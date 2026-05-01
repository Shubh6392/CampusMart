import { listingCategories } from '@/lib/listing-categories';

interface ListingFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  condition: string;
  onConditionChange: (value: string) => void;
  minPrice: string;
  onMinPriceChange: (value: string) => void;
  maxPrice: string;
  onMaxPriceChange: (value: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
}

export default function ListingFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  condition,
  onConditionChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  onSubmit,
  onClear
}: ListingFiltersProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      className="grid gap-4 xl:grid-cols-[1.2fr_220px_180px_140px_140px_auto_auto] xl:items-end"
    >
      <label className="block">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Search marketplace</span>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          type="search"
          placeholder="Search items, courses, brands, or pickup notes"
          className="field-control"
        />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Category</span>
        <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className="field-control">
          <option value="">All categories</option>
          {listingCategories.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Condition</span>
        <select value={condition} onChange={(e) => onConditionChange(e.target.value)} className="field-control">
          <option value="">Any condition</option>
          <option value="new">New</option>
          <option value="like new">Like new</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="used">Used</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Min price</span>
        <input
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          type="number"
          min="0"
          inputMode="numeric"
          placeholder="0"
          className="field-control"
        />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Max price</span>
        <input
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          type="number"
          min="0"
          inputMode="numeric"
          placeholder="Any"
          className="field-control"
        />
      </label>
      <button type="submit" className="btn-primary h-[46px] px-5">
        Search
      </button>
      <button type="button" onClick={onClear} className="btn-secondary h-[46px] px-5">
        Clear
      </button>
    </form>
  );
}
