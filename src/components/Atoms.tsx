import React, { useRef } from 'react';
import { cls } from '../lib/utils';
import { TYPE_COLORS } from '../lib/pokemon';

export function Star({ filled = false, onClick }: { filled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={filled ? 'rating-star-filled' : 'rating-star'}
      onClick={onClick}
      className={cls(
        'w-6 h-6 flex items-center justify-center rounded-md relative transition-all',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2979FF]',
        'hover:scale-[1.08] active:scale-90',
        filled ? 'text-[#FFB74D] drop-shadow-[0_0_6px_rgba(255,183,77,0.5)]' : 'text-[#B0BEC5]'
      )}
    >
      <span className="text-lg leading-none select-none">★</span>
    </button>
  );
}

export function Stars10({ value = 0, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  
  const handleKeyDown = (e: React.KeyboardEvent, currentValue: number) => {
    if (e.key === 'ArrowRight' && currentValue < 10) {
      e.preventDefault();
      onChange(currentValue + 1);
    } else if (e.key === 'ArrowLeft' && currentValue > 1) {
      e.preventDefault();
      onChange(currentValue - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(1);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(10);
    } else if (e.key >= '0' && e.key <= '9') {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 10) {
        e.preventDefault();
        onChange(num);
      }
    }
  };

  const displayValue = hoverValue ?? value;

  return (
    <div 
      className="flex gap-1" 
      role="group"
      aria-label={`Rating: ${value} out of 10 stars`}
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHoverValue(n)}
          onKeyDown={(e) => handleKeyDown(e, n)}
          aria-label={`Rate ${n} out of 10`}
          aria-pressed={n === value}
          className={cls(
            'w-6 h-6 flex items-center justify-center rounded-md relative transition-all',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2979FF]',
            'hover:scale-[1.08] active:scale-90',
            n <= displayValue 
              ? 'text-[#FFB74D] drop-shadow-[0_0_6px_rgba(255,183,77,0.5)]' 
              : 'text-[#B0BEC5]'
          )}
        >
          <span className="text-lg leading-none select-none">★</span>
        </button>
      ))}
    </div>
  );
}

export function TypeBadge({ type, compact = false }: { type: string; compact?: boolean }) {
  const t = (type || '').toUpperCase();
  const clsType = TYPE_COLORS[t] ? `type-${t}` : 'type-default';
  return <span className={cls('badge badge-vibrant select-none', clsType, compact ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1')}>{type}</span>;
}

export function Pressable({
  as: Comp = 'div',
  className,
  onClick,
  onKeyDown,
  tabIndex,
  children,
}: {
  as?: any;
  className?: string;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  tabIndex?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const lastTouch = useRef<number>(0);

  function onTouchEnd(e: React.TouchEvent) {
    if (!onClick) return;
    const now = Date.now();
    if (now - (lastTouch.current || 0) < 300) return;
    lastTouch.current = now;
    e.preventDefault();
    e.stopPropagation();
    onClick();
  }

  const Any: any = Comp;
  return (
    <Any
      ref={ref}
      onClick={onClick}
      onTouchEnd={onTouchEnd}
      className={cls('relative overflow-hidden touch-manipulation', className)}
      role={onClick ? 'button' : undefined}
      tabIndex={tabIndex !== undefined ? tabIndex : (onClick ? 0 : undefined)}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (onKeyDown) {
          onKeyDown(e);
        } else if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </Any>
  );
}

export function SkeletonBox({ className }: { className?: string }) {
  return <div className={cls('bg-[#EEF2F6] rounded animate-pulse', className)} />;
}

export function SkeletonLines({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-[#EEF2F6] rounded animate-pulse" />
      ))}
    </div>
  );
}

export function Card({ children, onClick, className, onKeyDown, tabIndex }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  tabIndex?: number;
}) {
  return (
    <Pressable
      as="div"
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      className={cls(
        'card card-hover relative',
        'transition-all',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </Pressable>
  );
}
