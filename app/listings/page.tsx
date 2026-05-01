import ListingsView from '@/components/listing/listings-view';

interface ListingsPageProps {
  searchParams?: {
    search?: string;
    category?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default function ListingsPage({ searchParams }: ListingsPageProps) {
  return (
    <ListingsView
      initialSearch={searchParams?.search || ''}
      initialCategory={searchParams?.category || ''}
      initialCondition={searchParams?.condition || ''}
      initialMinPrice={searchParams?.minPrice || ''}
      initialMaxPrice={searchParams?.maxPrice || ''}
    />
  );
}
