import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import Listing from '@/models/Listing';
import mongoose from 'mongoose';
import { Faker, en } from '@faker-js/faker';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  return POST(req);
}

export async function POST(req: NextRequest) {
  // Allow admin OR dev environment
  if (process.env.NODE_ENV === 'production') {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }
  }

  await connectToDatabase();

  // Delete existing demos
  await Listing.deleteMany({ isDemo: true });

  const faker = new Faker({ locale: [en] });
  faker.seed(123); // Consistent demos

  const categories = ['electronics', 'books', 'furniture', 'clothing', 'sports', 'textbooks', 'stationery', 'music', 'vehicles', 'other'];
  const conditions = ['new', 'like new', 'good', 'fair', 'used'];
  const campuses = ['MIT', 'Stanford', 'Harvard', 'UCLA', 'NYU', 'UC Berkeley', 'Oxford', 'Cambridge', 'Sample Campus A', 'Sample Campus B'];

  const demoListings = [];
  for (let i = 1; i <= 120; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const price = Number(faker.commerce.price({ min: 5, max: 1500, dec: 2 }));
    const title = faker.commerce.productName() + (Math.random() > 0.5 ? ` ${faker.commerce.productAdjective()}` : '');
    const description = faker.lorem.paragraph({ min: 2, max: 5 });
    const tags = Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => faker.commerce.department()).slice(0, 4);
    const campus = campuses[Math.floor(Math.random() * campuses.length)];
    const imageId = faker.number.int({ min: 1, max: 1000 });
    const images = [
      `https://picsum.photos/seed/${imageId}/500/400`
    ];


    demoListings.push({
      seller: new mongoose.Types.ObjectId(), // Dummy seller
      title: title.slice(0, 120),
      description,
      price,
      category,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      images,
      campus,
      tags,
      status: 'approved' as const,
      isDemo: true,
      views: faker.number.int({ min: 0, max: 500 }),
    });
  }


  await Listing.insertMany(demoListings);

  const count = await Listing.countDocuments({ isDemo: true });
  return NextResponse.json({ message: `Seeded ${count} demo listings` }, { status: 201 });
}

