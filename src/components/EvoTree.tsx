import { SPRITE_ICON } from '../lib/pokemon';
import { formatName } from '../lib/utils';
import { Pressable } from './Atoms';

function EvoNode({ id, name, go, totalStages, displayDex, isMega, regularStages }: { id: number; name: string; go: (dex: number) => void; totalStages: number; displayDex: number; isMega?: boolean; regularStages: number }) {
  const art = SPRITE_ICON(id);
  const label = formatName(name);
  
  // Size based on evolution line complexity - fewer stages = bigger sprites
  const spriteSize = regularStages === 1 ? 'w-40 h-40' : regularStages === 2 ? 'w-36 h-36' : regularStages === 3 ? 'w-32 h-32' : 'w-28 h-28';
  const fontSize = regularStages <= 2 ? 'text-sm' : 'text-xs';
  
  // Mega sprites have more whitespace/padding, scale them up slightly and pull text closer
  const megaScale = isMega ? 'scale-110' : '';
  
  return (
    <Pressable as="button" onClick={() => go(id)} className="flex flex-col items-center text-[#2C2C2C] hover:opacity-80 active:scale-95 transition-all focus-visible p-2 rounded flex-1 min-w-0">
      <div className="flex items-center justify-center">
        <img src={art} alt={`Dex ${displayDex}`} className={`${spriteSize} object-contain evo-sprite ${megaScale} ${isMega ? '-translate-y-2' : ''}`} />
      </div>
      <div className={`font-semibold text-center truncate max-w-full ${fontSize} ${isMega ? '-mt-1' : 'mt-1'}`}>
        {label}
      </div>
      <div className="text-[9px] text-[#666666]">#{String(displayDex).padStart(3, '0')}</div>
    </Pressable>
  );
}

export function EvoTree({
  levels,
  goToDex,
  nameForDex,
  megaToDexMap,
}: {
  levels: number[][];
  goToDex: (dex: number) => void;
  nameForDex: (dex: number) => string;
  megaToDexMap?: Map<number, number>;
}) {
  const totalStages = levels.length;
  
  // Count how many distinct non-mega evolution stages exist
  // Build a set of all base dex numbers from non-mega pokemon
  // Mega IDs are typically > 10000, so we can detect them even without the map
  const baseStages = new Set<number>();
  levels.forEach((stage) => {
    stage.forEach((id) => {
      const isMegaById = id > 10000; // Mega evolution IDs are typically 10000+
      const isMegaByMap = megaToDexMap?.has(id);
      const isMega = isMegaById || isMegaByMap;
      if (!isMega) {
        baseStages.add(id);
      }
    });
  });
  const regularStages = baseStages.size;
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 md:gap-6 justify-between px-4">
        {levels.map((stage, idx) => (
          <div key={idx} className="flex items-center gap-3 md:gap-6 flex-1">
            <div className="flex flex-col gap-2 flex-1">
              {stage.map((id) => {
                // Detect if this is a mega evolution
                const isMegaById = id > 10000; // Mega evolution IDs are typically 10000+
                const isMegaByMap = megaToDexMap?.has(id);
                const isMega = isMegaById || isMegaByMap;
                
                // For mega evolutions, use the base dex number for display
                // If map has it, use that. Otherwise, for megas in this chain, use the last non-mega ID
                let displayDex = id;
                if (isMega) {
                  displayDex = megaToDexMap?.get(id) || 
                    levels.flat().filter(i => i < 10000).pop() || 
                    id;
                }
                
                return (
                  <EvoNode key={id} id={id} name={nameForDex(id)} go={goToDex} totalStages={totalStages} displayDex={displayDex} isMega={isMega} regularStages={regularStages} />
                );
              })}
            </div>
            {idx < levels.length - 1 && <span className="text-[#2979FF] text-2xl md:text-3xl font-bold flex-shrink-0">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
