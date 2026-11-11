export interface ArenaTheme {
  id: string;
  name: string;
  description: string;
  badge: string;
  cost: number; // 0 for default free, > 0 for purchasable with coins
  ambientColor: string;
  bgGradient: string;
  tableSurfaceColor: string;
  tableBorderColor: string;
  dominoFaceColor: string;
  dominoBorderColor: string;
  accentColor: string;
  particles: string[];
}

export const ARENA_THEMES: ArenaTheme[] = [
  {
    id: 'cyber-classroom',
    name: 'Ruang Kelas Futuristik',
    description: 'Papan tulis holografik dan teknologi kuantum aljabar.',
    badge: '🚀 Cyber Tech',
    cost: 0, // Default Free
    ambientColor: '#0ea5e9',
    bgGradient: 'from-slate-950 via-cyan-950 to-slate-900',
    tableSurfaceColor: '#0f172a',
    tableBorderColor: '#38bdf8',
    dominoFaceColor: '#f8fafc',
    dominoBorderColor: '#0284c7',
    accentColor: '#38bdf8',
    particles: ['⚡', '📐', '∫', '∑', '✨'],
  },
  {
    id: 'sakura-garden',
    name: 'Taman Sakura Aljabar',
    description: 'Meja kayu zen dengan kehangatan kelopak bunga sakura.',
    badge: '🌸 Zen Nature',
    cost: 150,
    ambientColor: '#ec4899',
    bgGradient: 'from-slate-950 via-rose-950 to-emerald-950',
    tableSurfaceColor: '#1c1917',
    tableBorderColor: '#f472b6',
    dominoFaceColor: '#fff1f2',
    dominoBorderColor: '#e11d48',
    accentColor: '#fb7185',
    particles: ['🌸', '🍃', '✨', '🎋'],
  },
  {
    id: 'neon-cosmos',
    name: 'Arena Kosmik Neon',
    description: 'Ruang angkasa tak terbatas dengan nebula ungu berpendar.',
    badge: '🌌 Galaxy',
    cost: 250,
    ambientColor: '#a855f7',
    bgGradient: 'from-purple-950 via-indigo-950 to-black',
    tableSurfaceColor: '#1e1b4b',
    tableBorderColor: '#c084fc',
    dominoFaceColor: '#faf5ff',
    dominoBorderColor: '#9333ea',
    accentColor: '#c084fc',
    particles: ['⭐', '🪐', '✨', '💫'],
  },
  {
    id: 'ancient-library',
    name: 'Perpustakaan Kuno Mesir',
    description: 'Ruang manuskrip kuno berhias emas peninggalan matematikawan.',
    badge: '📜 Ancient Gold',
    cost: 350,
    ambientColor: '#eab308',
    bgGradient: 'from-amber-950 via-yellow-950 to-stone-950',
    tableSurfaceColor: '#292524',
    tableBorderColor: '#facc15',
    dominoFaceColor: '#fefce8',
    dominoBorderColor: '#ca8a04',
    accentColor: '#facc15',
    particles: ['📜', '✨', '⚜️', '🪙'],
  },
  {
    id: 'golden-pyramid',
    name: 'Piramida Pythagoras Emas',
    description: 'Kuil geometri suci berbalut lempengan emas murni dan permata rubi.',
    badge: '🔺 Golden Mystery',
    cost: 450,
    ambientColor: '#f59e0b',
    bgGradient: 'from-black via-amber-950 to-yellow-950',
    tableSurfaceColor: '#361e05',
    tableBorderColor: '#fbbf24',
    dominoFaceColor: '#fffbeb',
    dominoBorderColor: '#d97706',
    accentColor: '#f59e0b',
    particles: ['🔺', '📐', '👑', '✨', '💎'],
  },
  {
    id: 'royal-palace',
    name: 'Kasino Monte Carlo VIP',
    description: 'Meja beludru hijau zamrud termegah dengan lampu kristal bangsawan.',
    badge: '💎 VIP Royalty',
    cost: 600,
    ambientColor: '#10b981',
    bgGradient: 'from-slate-950 via-emerald-950 to-black',
    tableSurfaceColor: '#064e3b',
    tableBorderColor: '#34d399',
    dominoFaceColor: '#ecfdf5',
    dominoBorderColor: '#059669',
    accentColor: '#10b981',
    particles: ['💎', '🎲', '🍾', '✨', '🪙'],
  },
];
