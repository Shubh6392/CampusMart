interface ListingFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
}

const categories = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Misc'];

export default function ListingFilters({ search, onSearchChange, category, onCategoryChange }: ListingFiltersProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
      <label className="block">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Search marketplace</span>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search items, courses, brands, or pickup notes"
          className="field-control"
        />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Category</span>
        <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className="field-control">
          <option value="">All categories</option>
          {categories.map((opt) => (
            <option key={opt} value={opt.toLowerCase()}>{opt}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
