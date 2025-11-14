import { cls } from '../lib/utils';

const toAriaBoolean = (value: boolean): 'true' | 'false' => (value ? 'true' : 'false');

export interface SortBarProps {
  // counts & openers
  itemsCount: number;
  activeCount: number;
  onOpenFilters: () => void;
  onOpenSort: () => void;
}

export function SortBar({
  itemsCount,
  activeCount,
  onOpenFilters,
  onOpenSort,
}: SortBarProps) {

  return (
    <div className="sticky top-[56px] z-20 bg-white/90 backdrop-blur border border-[#E0E0E0] rounded-xl shadow-sm px-3 sm:px-4 py-3 mb-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onOpenFilters}
        className="btn btn-secondary px-3 py-1 text-xs"
        aria-label="Open filters"
      >
        ☰ Filters{activeCount > 0 ? ` (${activeCount})` : ''}
      </button>

      {/* Sort button */}
      <button
        type="button"
        onClick={onOpenSort}
        className="btn btn-secondary px-3 py-1 text-xs"
        aria-label="Open sort and display"
      >
        ⇅ Sort
      </button>

      <div className="ml-auto text-[11px] text-[#666666]">
        {itemsCount.toLocaleString()} results · {activeCount} filters
      </div>
    </div>
  );
}
