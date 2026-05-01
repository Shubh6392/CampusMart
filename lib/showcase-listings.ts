export const showcaseListings = [
  {
    _id: 'showcase-stationery-combo',
    title: 'Stationery combo',
    price: 12,
    category: 'study-essentials',
    condition: 'new',
    images: ['https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=700&q=80'],
    campus: 'Campus pickup',
    description: 'Notebooks, pens, sticky notes, and everyday desk supplies bundled for quick semester setup.',
    tags: ['stationery', 'study essentials', 'notebooks', 'pens'],
    status: 'approved',
    isDemo: true,
    views: 0,
  },
  {
    _id: 'showcase-desk-audio-setup',
    title: 'Desk audio setup',
    price: 39,
    category: 'electronics',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=700&q=80'],
    campus: 'Campus pickup',
    description: 'Compact speaker and desk audio accessories for study rooms, hostel desks, and creator setups.',
    tags: ['audio', 'speaker', 'electronics', 'desk'],
    status: 'approved',
    isDemo: true,
    views: 0,
  },
  {
    _id: 'showcase-cycle-commute-gear',
    title: 'Cycle commute gear',
    price: 18,
    category: 'cycles',
    condition: 'like new',
    images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=700&q=80'],
    campus: 'Campus pickup',
    description: 'Useful cycle accessories for safer, easier campus commutes between hostels, classes, and labs.',
    tags: ['cycle', 'commute', 'gear', 'transport'],
    status: 'approved',
    isDemo: true,
    views: 0,
  },
  {
    _id: 'showcase-classroom-basics',
    title: 'Classroom basics',
    price: 15,
    category: 'study-essentials',
    condition: 'new',
    images: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80'],
    campus: 'Campus pickup',
    description: 'Notebooks, pens, folders, and simple supplies for lectures, tutorials, and daily study.',
    tags: ['classroom', 'study essentials', 'notebooks', 'folders'],
    status: 'approved',
    isDemo: true,
    views: 0,
  },
  {
    _id: 'showcase-lab-and-project-gear',
    title: 'Lab and project gear',
    price: 45,
    category: 'electronics',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1581092921461-eab10380d70a?auto=format&fit=crop&w=700&q=80'],
    campus: 'Campus pickup',
    description: 'Calculators, kits, cables, and practical tools for academic labs and student projects.',
    tags: ['lab', 'project', 'calculator', 'kit'],
    status: 'approved',
    isDemo: true,
    views: 0,
  },
  {
    _id: 'showcase-creator-corner',
    title: 'Creator corner',
    price: 75,
    category: 'electronics',
    condition: 'like new',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80'],
    campus: 'Campus pickup',
    description: 'Camera, audio, lighting, and desk accessories for content, clubs, and portfolio work.',
    tags: ['creator', 'camera', 'audio', 'desk'],
    status: 'approved',
    isDemo: true,
    views: 0,
  },
  {
    _id: 'showcase-hostel-utility',
    title: 'Hostel utility',
    price: 22,
    category: 'hostel-needs',
    condition: 'new',
    images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=700&q=80'],
    campus: 'Campus pickup',
    description: 'Bottles, locks, organizers, and compact utility items for cleaner hostel living.',
    tags: ['hostel', 'utility', 'organizer', 'lock'],
    status: 'approved',
    isDemo: true,
    views: 0,
  },
  {
    _id: 'showcase-macbook-air-m1',
    title: 'MacBook Air M1',
    price: 899,
    category: 'electronics',
    condition: 'like new',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80'],
    campus: 'Campus pickup',
    description: 'A lightweight MacBook Air M1 suited for coding, design, assignments, and internship work.',
    tags: ['macbook', 'laptop', 'm1', 'electronics'],
    status: 'approved',
    isDemo: true,
    views: 0,
  },
  {
    _id: 'showcase-study-desk-setup',
    title: 'Study desk setup',
    price: 140,
    category: 'furniture',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80'],
    campus: 'Campus pickup',
    description: 'A clean desk setup for classes, assignments, long study sessions, and hostel room organization.',
    tags: ['desk', 'study', 'furniture', 'room setup'],
    status: 'approved',
    isDemo: true,
    views: 0,
  },
  {
    _id: 'showcase-textbook-bundle',
    title: 'Textbook bundle',
    price: 65,
    category: 'books',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80'],
    campus: 'Campus pickup',
    description: 'A semester-ready textbook bundle with useful reading material at student-friendly pricing.',
    tags: ['textbook', 'books', 'semester', 'study'],
    status: 'approved',
    isDemo: true,
    views: 0,
  },
];

export function filterShowcaseListings({
  category,
  condition,
  search,
  minPrice,
  maxPrice,
}: {
  category?: string | null;
  condition?: string | null;
  search?: string | null;
  minPrice?: number;
  maxPrice?: number;
}) {
  const normalizedSearch = search?.trim().toLowerCase();

  return showcaseListings.filter((listing) => {
    if (category && listing.category !== category) return false;
    if (condition && listing.condition !== condition) return false;
    if (minPrice && listing.price < minPrice) return false;
    if (maxPrice && listing.price > maxPrice) return false;
    if (!normalizedSearch) return true;

    return [listing.title, listing.description, listing.category, ...listing.tags]
      .some((value) => value.toLowerCase().includes(normalizedSearch));
  });
}
