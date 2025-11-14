import { cls } from '../lib/utils';
import { Modal } from './Modal';

const toAriaBoolean = (value: boolean): 'true' | 'false' => (value ? 'true' : 'false');

export interface SortDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (d: 'asc' | 'desc') => void;
  shiny: boolean;
  setShiny: (b: boolean) => void;
  showMegas: boolean;
  setShowMegas: (b: boolean) => void;
  perPage: number;
  setPerPage: (n: number) => void;
}

export function SortDialog({
  isOpen,
  onClose,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  shiny,
  setShiny,
  showMegas,
  setShowMegas,
  perPage,
  setPerPage,
}: SortDialogProps) {
  const sortOpts = [
    { v: 'bayes', label: 'Coolness' },
    { v: 'name', label: 'Name' },
    { v: 'dex', label: 'Dex' },
    { v: 'gen', label: 'Gen' },
    { v: 'type', label: 'Type' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sort & Display" maxWidth="max-w-lg">
      <div className="flex flex-col gap-5">
        <section>
          <div className="filter-head">Sort</div>
          <div className="flex items-center gap-2 flex-wrap">
            <div role="tablist" aria-label="Sort" className="segmented">
              {sortOpts.map((o) => (
                <button
                  key={o.v}
                  type="button"
                  role="tab"
                  aria-selected={toAriaBoolean(sortBy === o.v)}
                  className={cls('segmented-btn', sortBy === o.v && 'on')}
                  onClick={() => setSortBy(o.v)}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {sortBy !== 'bayes' && (
              <button
                type="button"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="btn btn-secondary px-2 py-1 text-xs flex items-center gap-1"
                title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            )}
          </div>
        </section>

        <section className="flex flex-wrap gap-6">
          <div>
            <div className="filter-head">Shiny</div>
            <div role="group" aria-label="Shiny variant" className="segmented">
              <button
                type="button"
                className={cls('segmented-btn', !shiny && 'on')}
                aria-pressed={toAriaBoolean(!shiny)}
                onClick={() => setShiny(false)}
              >
                Off
              </button>
              <button
                type="button"
                className={cls('segmented-btn', shiny && 'on')}
                aria-pressed={toAriaBoolean(shiny)}
                onClick={() => setShiny(true)}
              >
                ✧ On
              </button>
            </div>
          </div>

          <div>
            <div className="filter-head">Megas</div>
            <div role="group" aria-label="Show mega evolutions" className="segmented">
              <button
                type="button"
                className={cls('segmented-btn', !showMegas && 'on')}
                aria-pressed={toAriaBoolean(!showMegas)}
                onClick={() => setShowMegas(false)}
              >
                Hide
              </button>
              <button
                type="button"
                className={cls('segmented-btn', showMegas && 'on')}
                aria-pressed={toAriaBoolean(showMegas)}
                onClick={() => setShowMegas(true)}
              >
                Show
              </button>
            </div>
          </div>

          <div>
            <div className="filter-head">Per Page</div>
            <div role="group" aria-label="Items per page" className="segmented">
              {[10,20,50,0].map(n => (
                <button
                  key={n}
                  type="button"
                  className={cls('segmented-btn', perPage === n && 'on')}
                  aria-pressed={toAriaBoolean(perPage === n)}
                  onClick={() => setPerPage(n)}
                >
                  {n === 0 ? 'All' : n}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="button" className="btn btn-accent px-4 py-2 text-sm" onClick={onClose}>Done</button>
        </div>
      </div>
    </Modal>
  );
}
