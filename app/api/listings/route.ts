import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import Listing from '@/models/Listing';
import { createListingSchema } from '@/lib/validators/listing';
import { filterShowcaseListings } from '@/lib/showcase-listings';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');
  const minPrice = Number(url.searchParams.get('minPrice') || '0');
  const maxPrice = Number(url.searchParams.get('maxPrice') || '0');
  const page = Number(url.searchParams.get('page') || '1');
  const limit = Number(url.searchParams.get('limit') || '12');
  const escapedSearch = search?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  await connectToDatabase();

  const baseFilters: any = { status: 'approved', isDemo: false };
  const demoFilters: any = { isDemo: true };

  let filters: any = { $or: [baseFilters, demoFilters] };

  if (category) {
    baseFilters.category = category;
    demoFilters.category = category;
  }
  if (search) {
    const searchOr = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
      { tags: { $regex: escapedSearch, $options: 'i' } }
    ];
    baseFilters.$or = searchOr;
    demoFilters.$or = searchOr;
  }
  if (minPrice > 0 || maxPrice > 0) {
    const priceFilter: any = {};
    if (minPrice > 0) priceFilter.$gte = minPrice;
    if (maxPrice > 0) priceFilter.$lte = maxPrice;
    baseFilters.price = priceFilter;
    demoFilters.price = priceFilter;
  }

  const skip = Math.max((page - 1) * limit, 0);
  const showcaseMatches = filterShowcaseListings({ category, search, minPrice, maxPrice });
  const showcasePage = showcaseMatches.slice(skip, skip + limit);
  const databaseLimit = Math.max(limit - showcasePage.length, 0);
  const databaseSkip = Math.max(skip - showcaseMatches.length, 0);

  const [databaseTotal, databaseListings] = await Promise.all([
    Listing.countDocuments(filters),
    databaseLimit > 0
      ? Listing.find(filters)
          .sort({ isDemo: 1, createdAt: -1 })
          .skip(databaseSkip)
          .limit(databaseLimit)
          .lean()
      : Promise.resolve([])
  ]);
  const total = showcaseMatches.length + databaseTotal;
  const listings = [...showcasePage, ...databaseListings];

  return NextResponse.json({ listings, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parseResult = createListingSchema.safeParse(body);
  if (!parseResult.success) {
    const errors = parseResult.error.flatten();
    const errorMessages = Object.entries(errors.fieldErrors)
      .map(([field, messages]) => `${field}: ${messages?.join(', ') || 'Invalid'}`)
      .join('; ');
    return NextResponse.json({ error: errorMessages || 'Validation failed' }, { status: 422 });
  }

  const listingData = parseResult.data;
  const campus = listingData.campus;

  await connectToDatabase();

  const listing = await Listing.create({
    seller: session.user.id,
    title: listingData.title,
    description: listingData.description,
    price: listingData.price,
    category: listingData.category,
    condition: listingData.condition,
    images: listingData.images,
    campus,
    tags: listingData.tags || [],
    status: process.env.NODE_ENV === 'production' ? 'pending' : 'approved'
  });

  return NextResponse.json({ listing }, { status: 201 });
}
