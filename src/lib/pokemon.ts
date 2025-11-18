export type Flags = { legendary?: boolean; mythical?: boolean; pseudo?: boolean; mega?: boolean };

export type Mon = {
  id: number;
  name: string;
  dex: number;
  generation: number;
  region: string;
  types: string[];
  flags: Flags;
  pokedex: string;
  evoChain: number[];
  evoLevels?: number[][];
  seedAvg: number;
  seedCount: number;
  weight?: number; // in kg
  height?: number; // in m
};

export const TYPE_COLORS: Record<string, string> = {
  FIRE: "#F08030",
  WATER: "#6890F0",
  GRASS: "#78C850",
  ELECTRIC: "#F8D030",
  ICE: "#98D8D8",
  FIGHTING: "#C03028",
  POISON: "#A040A0",
  GROUND: "#E0C068",
  FLYING: "#A890F0",
  PSYCHIC: "#F85888",
  BUG: "#A8B820",
  ROCK: "#B8A038",
  GHOST: "#705898",
  DARK: "#705848",
  DRAGON: "#7038F8",
  STEEL: "#B8B8D0",
  FAIRY: "#EE99AC",
  NORMAL: "#A8A878",
};

export const ALL_TYPES = Object.keys(TYPE_COLORS);
export const GEN_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const REGION_OPTIONS = [
  "Kanto",
  "Johto",
  "Hoenn",
  "Sinnoh",
  "Unova",
  "Kalos",
  "Alola",
  "Galar",
  "Paldea",
];

const PSEUDO_IDS = new Set([149, 248, 376, 373, 445, 635, 706, 784, 887, 998]);
const GEN_MAP: Record<string, number> = {
  "generation-i": 1,
  "generation-ii": 2,
  "generation-iii": 3,
  "generation-iv": 4,
  "generation-v": 5,
  "generation-vi": 6,
  "generation-vii": 7,
  "generation-viii": 8,
  "generation-ix": 9,
};
const REGION_BY_GEN: Record<number, string> = {
  1: "Kanto",
  2: "Johto",
  3: "Hoenn",
  4: "Sinnoh",
  5: "Unova",
  6: "Kalos",
  7: "Alola",
  8: "Galar",
  9: "Paldea",
};

export const SEED: Mon[] = [
  {
    id: 6,
    name: "Charizard",
    dex: 6,
    generation: 1,
    region: "Kanto",
    types: ["FIRE", "FLYING"],
    flags: {},
    pokedex: "Spits fire that is hot enough to melt boulders.",
    evoChain: [4, 5, 6],
    evoLevels: [[4], [5], [6]],
    seedAvg: 8.9,
    seedCount: 3200,
  },
  {
    id: 9,
    name: "Blastoise",
    dex: 9,
    generation: 1,
    region: "Kanto",
    types: ["WATER"],
    flags: {},
    pokedex: "Crushes its foe under its heavy body to cause fainting.",
    evoChain: [7, 8, 9],
    evoLevels: [[7], [8], [9]],
    seedAvg: 8.1,
    seedCount: 2100,
  },
  {
    id: 3,
    name: "Venusaur",
    dex: 3,
    generation: 1,
    region: "Kanto",
    types: ["GRASS", "POISON"],
    flags: {},
    pokedex: "The flower on its back blooms when it is absorbing solar energy.",
    evoChain: [1, 2, 3],
    evoLevels: [[1], [2], [3]],
    seedAvg: 7.8,
    seedCount: 1800,
  },
  {
    id: 25,
    name: "Pikachu",
    dex: 25,
    generation: 1,
    region: "Kanto",
    types: ["ELECTRIC"],
    flags: {},
    pokedex: "When it is angered, it immediately discharges the energy stored in the pouches in its cheeks.",
    evoChain: [172, 25, 26],
    evoLevels: [[172], [25], [26]],
    seedAvg: 8.5,
    seedCount: 5000,
  },
  {
    id: 94,
    name: "Gengar",
    dex: 94,
    generation: 1,
    region: "Kanto",
    types: ["GHOST", "POISON"],
    flags: {},
    pokedex: "On the night of a full moon, it is said that Gengar emerges from hiding to scare people.",
    evoChain: [92, 93, 94],
    evoLevels: [[92], [93], [94]],
    seedAvg: 9.1,
    seedCount: 4100,
  },
  {
    id: 150,
    name: "Mewtwo",
    dex: 150,
    generation: 1,
    region: "Kanto",
    types: ["PSYCHIC"],
    flags: { legendary: true },
    pokedex: "Its DNA is almost the same as Mew's.",
    evoChain: [150],
    evoLevels: [[150]],
    seedAvg: 9.3,
    seedCount: 6200,
  },
  {
    id: 445,
    name: "Garchomp",
    dex: 445,
    generation: 4,
    region: "Sinnoh",
    types: ["DRAGON", "GROUND"],
    flags: { pseudo: true },
    pokedex: "It is said that when one runs at high speed, its wings create blades of wind.",
    evoChain: [443, 444, 445],
    evoLevels: [[443], [444], [445]],
    seedAvg: 8.8,
    seedCount: 2500,
  },
  {
    id: 448,
    name: "Lucario",
    dex: 448,
    generation: 4,
    region: "Sinnoh",
    types: ["FIGHTING", "STEEL"],
    flags: {},
    pokedex: "It can tell what people are thinking.",
    evoChain: [447, 448],
    evoLevels: [[447], [448]],
    seedAvg: 8.7,
    seedCount: 2700,
  },
  {
    id: 658,
    name: "Greninja",
    dex: 658,
    generation: 6,
    region: "Kalos",
    types: ["WATER", "DARK"],
    flags: {},
    pokedex: "It creates throwing stars of compressed water...",
    evoChain: [656, 657, 658],
    evoLevels: [[656], [657], [658]],
    seedAvg: 9.0,
    seedCount: 4600,
  },
  {
    id: 197,
    name: "Umbreon",
    dex: 197,
    generation: 2,
    region: "Johto",
    types: ["DARK"],
    flags: {},
    pokedex: "When this Pokémon becomes angry, its pores secrete a poisonous sweat...",
    evoChain: [133, 196, 197],
    evoLevels: [[133], [196, 197]],
    seedAvg: 8.6,
    seedCount: 3300,
  },
];

export const OA = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
export const SPRITE = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
export const SPRITE_SHINY = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;

// PC box sprites (pixelated icons for evolution chains)
export const SPRITE_ICON = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/${id}.png`;
export const SPRITE_ICON_SHINY = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/shiny/${id}.png`;

export function artUrl(id: number, shiny: boolean, _spriteMode: boolean) {
  // Sprite-only strategy across the app: always return sprite URLs.
  return shiny ? SPRITE_SHINY(id) : SPRITE(id);
}

export function idFromUrl(u: string) {
  const m = new RegExp("\\/(\\d+)\\/?$").exec(u.trim());
  return m ? Number(m[1]) : 0;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function parseEvoLevels(chainRoot: any): number[][] {
  const levels: number[][] = [];
  let layer: any[] = [chainRoot];
  while (layer.length) {
    const ids: number[] = [];
    const next: any[] = [];
    for (const node of layer) {
      const id = idFromUrl(node.species.url);
      if (id) ids.push(id);
      if (node.evolves_to && node.evolves_to.length) next.push(...node.evolves_to);
    }
    if (ids.length) levels.push(Array.from(new Set(ids)));
    layer = next;
  }
  return levels.length ? levels : [[]];
}

async function fetchMonFromListItem(it: { name: string; url: string }): Promise<Mon | null> {
  try {
    const p = await fetchJSON<any>(it.url);
    const dex = p.id as number;
    const types: string[] = p.types.map((t: any) => t.type.name.toUpperCase());
    const species = await fetchJSON<any>(p.species.url);
  const flavor = (species.flavor_text_entries || []).find((e: any) => e.language.name === "en");
  const pokedex = flavor ? String(flavor.flavor_text).replace(/\s+/g, " ") : "";
  const genKey: string = species.generation?.name || "";
  const generation = GEN_MAP[genKey] || 0;
  const region = REGION_BY_GEN[generation] || "Unknown";
  const evoUrl = species.evolution_chain?.url as string | undefined;
  let evoChain: number[] = [dex];
  let evoLevels: number[][] | undefined = undefined;
  if (evoUrl) {
    try {
      const evo = await fetchJSON<any>(evoUrl);
      const chain: number[] = [];
      let node = evo.chain;
      while (node) {
        const id = idFromUrl(node.species.url);
        if (id) chain.push(id);
        node = (node.evolves_to && node.evolves_to[0]) || null;
      }
      if (chain.length) evoChain = chain;
      evoLevels = parseEvoLevels(evo.chain);
    } catch {}
  
  // Fetch mega evolutions from varieties if available, but only true megas (not base forms, and not unreleased like Meganium)
  const megas: number[] = [];
  if (species.varieties && Array.isArray(species.varieties)) {
    for (const variety of species.varieties) {
      const vname = variety.pokemon?.name?.toLowerCase() || '';
      // Only allow true megas, not base forms, and never allow Meganium mega (unreleased)
      if (
        vname.includes('mega') &&
        vname !== species.name.toLowerCase() &&
        !vname.startsWith('meganium-mega')
      ) {
        try {
          const megaMon = await fetchJSON<any>(variety.pokemon.url);
          if (megaMon.id) megas.push(megaMon.id);
        } catch {}
      }
    }
  }
  // Append megas as final evolution stage if found
  if (megas.length && evoLevels) {
    evoLevels.push(megas);
  } else if (megas.length && !evoLevels) {
    evoLevels = [[dex], megas];
  }
  }
  // Only set mega flag for true mega forms (name includes 'mega' and is not the base species)
  const isTrueMega = p.name.toLowerCase().includes('mega') && p.name.toLowerCase() !== species.name.toLowerCase();
  const flags: Flags = {
    legendary: !!species.is_legendary,
    mythical: !!species.is_mythical,
    pseudo: PSEUDO_IDS.has(dex),
    mega: isTrueMega,
  };
  
  // Extract weight (hectograms to kg) and height (decimeters to m)
  const weight = p.weight ? p.weight / 10 : undefined;
  const height = p.height ? p.height / 10 : undefined;
  
  return {
    id: dex,
    name: p.name[0].toUpperCase() + p.name.slice(1),
    dex,
    generation,
    region,
    types,
    flags,
    pokedex,
    evoChain,
    evoLevels,
    seedAvg: 6 + Math.random() * 3,
    seedCount: Math.floor(500 + Math.random() * 5000),
    weight,
    height,
  } as Mon;
  } catch (err) {
    console.warn(`Failed to fetch Pokemon: ${it.name}`, err);
    return null;
  }
}

async function chunkMap<X, Y>(xs: X[], n: number, fn: (x: X) => Promise<Y>): Promise<Y[]> {
  const out: Y[] = [];
  for (let i = 0; i < xs.length; i += n) {
    const part = await Promise.all(xs.slice(i, i + n).map(fn));
    out.push(...part);
  }
  return out;
}

export async function loadNationalDex(signal?: AbortSignal): Promise<Mon[]> {
  const base = await fetchJSON<{ results: { name: string; url: string }[] }>(
    "https://pokeapi.co/api/v2/pokemon?limit=2000&offset=0"
  );
  const results = await chunkMap(base.results, 12, fetchMonFromListItem);
  return results.filter((mon): mon is Mon => mon !== null);
}

export async function streamNationalDex(onBatch: (batch: Mon[]) => void, signal?: AbortSignal): Promise<void> {
  const base = await fetchJSON<{ results: { name: string; url: string }[] }>(
    "https://pokeapi.co/api/v2/pokemon?limit=2000&offset=0"
  );
  const items = base.results;
  const step = 24;
  for (let i = 0; i < items.length; i += step) {
    if (signal?.aborted) return;
    const slice = items.slice(i, i + step);
    const results = await Promise.all(slice.map(fetchMonFromListItem));
    const part = results.filter((mon): mon is Mon => mon !== null);
    if (part.length > 0) {
      onBatch(part);
    }
  }
}
