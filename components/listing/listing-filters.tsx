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
      className="grid gap-2 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_0.5fr_0.5fr_auto_auto] xl:items-end"
    >
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Search</span>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          type="search"
          placeholder="Items, courses, brands"
          className="field-control mt-1 h-9 border-slate-200/70 px-3 py-1.5 bg-white dark:border-white/10 dark:bg-neutral-950/60"
        />
      </label>
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Category</span>
        <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className="field-control mt-1 h-9 border-slate-200/70 px-3 py-1.5 bg-white dark:border-white/10 dark:bg-neutral-950/60">
          <option value="">All categories</option>
          {listingCategories.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Condition</span>
        <select value={condition} onChange={(e) => onConditionChange(e.target.value)} className="field-control mt-1 h-9 border-slate-200/70 px-3 py-1.5 bg-white dark:border-white/10 dark:bg-neutral-950/60">
          <option value="">Any condition</option>
          <option value="new">New</option>
          <option value="like new">Like new</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="used">Used</option>
        </select>
      </label>
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Min</span>
        <input
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          type="number"
          min="0"
          inputMode="numeric"
          placeholder="0"
          className="field-control mt-1 h-9 border-slate-200/70 px-3 py-1.5 bg-white dark:border-white/10 dark:bg-neutral-950/60"
        />
      </label>
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Max</span>
        <input
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          type="number"
          min="0"
          inputMode="numeric"
          placeholder="Any"
          className="field-control mt-1 h-9 border-slate-200/70 px-3 py-1.5 bg-white dark:border-white/10 dark:bg-neutral-950/60"
        />
      </label>
      <button type="submit" className="btn-primary h-9 px-5">
        Search
      </button>
      <button type="button" onClick={onClear} className="h-9 rounded-xl border border-slate-200/70 bg-white px-5 text-sm font-medium text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-slate-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-white">
        Clear
      </button>
    </form>
  );
}
