import { Metadata } from 'next';
import BookmarksView from '@/components/bookmarks/bookmarks-view';

export const metadata: Metadata = {
  title: 'My Bookmarks - CampusMart',
  description: 'View your saved listings'
};

export const dynamic = 'force-dynamic';

export default function BookmarksPage() {
  return <BookmarksView />;
}
