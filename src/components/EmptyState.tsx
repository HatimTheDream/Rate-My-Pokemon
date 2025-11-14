import React from 'react';
import { cls } from '../lib/utils';

export function EmptyState({
  title = 'No results',
  message = 'No Pokémon match the current filters.',
  action,
}: {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cls(
        'empty-state col-span-full flex flex-col items-center justify-center rounded-xl border border-[#D8E2EB] bg-[#F2F6FA] py-10 px-6 relative overflow-hidden'
      )}
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-0 opacity-40 pointer-events-none select-none" aria-hidden>
        <div
          className="w-56 h-56 rounded-full bg-gradient-to-br from-[#E6F0FF] to-transparent blur-xl absolute -top-10 -left-10"
        />
        <div
          className="w-64 h-64 rounded-full bg-gradient-to-tr from-[#FFE5E4] to-transparent blur-xl absolute -bottom-16 -right-16"
        />
      </div>
      <div className="text-4xl mb-3" aria-hidden>
        🔍
      </div>
      <h2 className="text-sm font-semibold tracking-wide uppercase text-[#2C2C2C] mb-2">{title}</h2>
      <p className="text-[#4F5E6B] text-sm mb-4 text-center max-w-md">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
