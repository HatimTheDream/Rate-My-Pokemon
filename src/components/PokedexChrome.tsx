export function PokedexChrome({ onHomeClick }: { onHomeClick?: () => void }) {
  return (
    <div className="relative">
      <div className="bg-[#E53935] border-b border-[#E0E0E0] py-3">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between text-white">
            <button 
              onClick={onHomeClick}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Go to home"
            >
              <div className="flex items-center gap-1" aria-hidden="true">
                <span className="w-4 h-4 rounded-full bg-white/80 border border-white/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/70 border border-white/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/70 border border-white/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/70 border border-white/70" />
              </div>
              <div>
                <div className="ml-3 text-lg font-extrabold tracking-wide">Rate My Pokémon</div>
                <div className="ml-3 text-xs text-white/90 font-normal hidden sm:block">Rate how cool each Pokémon looks</div>
              </div>
            </button>
            <div className="h-2 w-24 rounded bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
