import { AvatarConfig, LeaderboardEntry } from '../types/game';

const PROFILE_KEY = 'domino_math_user_profile';
const COINS_KEY = 'domino_math_coins';
const UNLOCKED_ITEMS_KEY = 'domino_math_unlocked_items';
const STATS_KEY = 'domino_math_stats';

export interface UserStats {
  rankPoints: number;
  matchesPlayed: number;
  wins: number;
  miniGamesWon: number;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skinColor: '#fcd34d',
  hairStyle: 'simple_short',
  hairColor: '#475569',
  headwear: 'none',
  eyewear: 'none',
  outfit: 'plain_tee',
  outfitColor: '#64748b',
  expression: 'happy',
};

export type CosmeticTier = 'default' | 'standard' | 'premium' | 'epic' | 'legendary';

export interface CosmeticItem {
  id: string;
  category: 'headwear' | 'eyewear' | 'outfit' | 'hairStyle';
  name: string;
  value: string;
  cost: number;
  icon: string;
  tier: CosmeticTier;
  description: string;
}

export const COSMETIC_SHOP_ITEMS: CosmeticItem[] = [
  // --- HEADWEAR ---
  // Default / Biasa Saja (Gratis)
  {
    id: 'h_none',
    category: 'headwear',
    name: 'Tanpa Topi',
    value: 'none',
    cost: 0,
    icon: '🚫',
    tier: 'default',
    description: 'Tampilan polos santai tanpa penutup kepala.',
  },
  {
    id: 'h_cap',
    category: 'headwear',
    name: 'Topi Baseball Biasa',
    value: 'cap',
    cost: 0,
    icon: '🧢',
    tier: 'default',
    description: 'Topi kain katun santai sehari-hari untuk latihan.',
  },
  // Paid Exclusive (Unik & Mewah)
  {
    id: 'h_crown',
    category: 'headwear',
    name: 'Mahkota Kaisar Emas Permata',
    value: 'crown',
    cost: 650,
    icon: '👑',
    tier: 'legendary',
    description: 'Mahkota emas murni 24K bertatahkan batu rubi dan zamrud bangsawan matematika.',
  },
  {
    id: 'h_dragon',
    category: 'headwear',
    name: 'Tanduk Mecha Cyber Dragon',
    value: 'dragon_horns',
    cost: 450,
    icon: '🐉',
    tier: 'epic',
    description: 'Tanduk futuristik berenergi plasma kuantum dengan LED merah menyala.',
  },
  {
    id: 'h_halo',
    category: 'headwear',
    name: 'Halo Malaikat Seraphim',
    value: 'halo',
    cost: 380,
    icon: '😇',
    tier: 'epic',
    description: 'Cincin cahaya kemuliaan ganda berpendar emas suci di atas kepala.',
  },
  {
    id: 'h_visor',
    category: 'headwear',
    name: 'VR Cyber Visor Quantum',
    value: 'visor',
    cost: 260,
    icon: '🥽',
    tier: 'premium',
    description: 'Visor holografik berlayar transparan penampil koordinat aljabar.',
  },
  {
    id: 'h_catears',
    category: 'headwear',
    name: 'Telinga Kucing LED Mecha',
    value: 'catears',
    cost: 220,
    icon: '🐱',
    tier: 'premium',
    description: 'Telinga kucing robotik berlampu neon RGB interaktif dan sensor suara.',
  },
  {
    id: 'h_tophat',
    category: 'headwear',
    name: 'Topi Pesulap Sutra Emas',
    value: 'tophat',
    cost: 180,
    icon: '🎩',
    tier: 'premium',
    description: 'Topi pesulap panggung klasik dilapisi pita emas dan sutra mengkilap.',
  },
  {
    id: 'h_headset',
    category: 'headwear',
    name: 'Headset Pro Gamer RGB',
    value: 'headset',
    cost: 120,
    icon: '🎧',
    tier: 'standard',
    description: 'Headphone gaming surround sound dengan bantalan telinga berlampu sian.',
  },

  // --- EYEWEAR ---
  // Default / Biasa Saja (Gratis)
  {
    id: 'e_none',
    category: 'eyewear',
    name: 'Tanpa Kacamata',
    value: 'none',
    cost: 0,
    icon: '🚫',
    tier: 'default',
    description: 'Pandangan mata jernih alami tanpa kacamata.',
  },
  {
    id: 'e_simple',
    category: 'eyewear',
    name: 'Kacamata Baca Sederhana',
    value: 'simple_glasses',
    cost: 0,
    icon: '👓',
    tier: 'default',
    description: 'Kacamata frame tipis sederhana untuk membaca soal persamaan.',
  },
  // Paid Exclusive (Unik & Mewah)
  {
    id: 'e_cybereye',
    category: 'eyewear',
    name: 'Holo-Scouter Mata Cybernetic',
    value: 'cyber_eye',
    cost: 500,
    icon: '👁️',
    tier: 'legendary',
    description: 'Lensa optik bionik penampil analisis probabilitas domino secara live.',
  },
  {
    id: 'e_goldshades',
    category: 'eyewear',
    name: 'Kacamata Hitam Emas VIP Aviator',
    value: 'gold_shades',
    cost: 360,
    icon: '🕶️',
    tier: 'epic',
    description: 'Bingkai emas tebal dengan lensa cermin gelap anti-silau kelas sultan.',
  },
  {
    id: 'e_goggles',
    category: 'eyewear',
    name: 'Goggles Steampunk Gear Kuningan',
    value: 'goggles',
    cost: 280,
    icon: '⚙️',
    tier: 'epic',
    description: 'Kacamata mekanik bertenaga uap dengan roda gigi dan lensa pembesar ganda.',
  },
  {
    id: 'e_monocle',
    category: 'eyewear',
    name: 'Monokel Bangsawan Aristokrat',
    value: 'monocle',
    cost: 200,
    icon: '🧐',
    tier: 'premium',
    description: 'Kaca pembesar satu mata berbingkai emas dengan juntaian rantai halus.',
  },
  {
    id: 'e_nerd',
    category: 'eyewear',
    name: 'Kacamata Jenius Matematikawan',
    value: 'nerd',
    cost: 100,
    icon: '🤓',
    tier: 'standard',
    description: 'Kacamata bulat retro khas profesor dan matematikawan pemecah rekor.',
  },

  // --- OUTFITS ---
  // Default / Biasa Saja (Gratis)
  {
    id: 'o_plain',
    category: 'outfit',
    name: 'Kaos Oblong Santai',
    value: 'plain_tee',
    cost: 0,
    icon: '👕',
    tier: 'default',
    description: 'Kaos katun kasual biasa yang nyaman untuk latihan santai di rumah.',
  },
  {
    id: 'o_school',
    category: 'outfit',
    name: 'Kemeja Pelajar Sederhana',
    value: 'school',
    cost: 0,
    icon: '👔',
    tier: 'default',
    description: 'Kemeja sekolah polos standar berkerah rapi tanpa ornamen berlebih.',
  },
  // Paid Exclusive (Unik & Mewah)
  {
    id: 'o_emperor',
    category: 'outfit',
    name: 'Zirah Emas Kaisar Pythagoras',
    value: 'emperor_armor',
    cost: 750,
    icon: '🛡️',
    tier: 'legendary',
    description: 'Pelindung dada pelat emas berukir ornamen kerajaan lengkap dengan jubah merah beludru megah.',
  },
  {
    id: 'o_galaxywizard',
    category: 'outfit',
    name: 'Jubah Penyihir Bintang Galaksi',
    value: 'galaxy_wizard',
    cost: 520,
    icon: '🧙‍♂️',
    tier: 'epic',
    description: 'Jubah mistis kain kosmik ungu bertabur sulaman rasi bintang dan bros kristal bercahaya.',
  },
  {
    id: 'o_exosuit',
    category: 'outfit',
    name: 'Cyber Exosuit Mecha Pilot',
    value: 'cyber_exosuit',
    cost: 440,
    icon: '🤖',
    tier: 'epic',
    description: 'Baju tempur mecha serat karbon berdaya tinggi dengan reaktor fusi berpendar di dada.',
  },
  {
    id: 'o_viptuxedo',
    category: 'outfit',
    name: 'Setelan Jas VIP Tuxedo Emas',
    value: 'vip_tuxedo',
    cost: 300,
    icon: '🤵',
    tier: 'premium',
    description: 'Jas pesta malam mewah dengan kerah lapel sutra keemasan dan dasi kupu-kupu satin.',
  },
  {
    id: 'o_cyber',
    category: 'outfit',
    name: 'Jaket Cyber Neon Runner',
    value: 'cyber',
    cost: 180,
    icon: '⚡',
    tier: 'standard',
    description: 'Jaket jaket streetwear modern bergaris lampu neon elektrik biru menyala.',
  },
  {
    id: 'o_hoodie',
    category: 'outfit',
    name: 'Streetwear Urban Hoodie',
    value: 'hoodie',
    cost: 130,
    icon: '🧥',
    tier: 'standard',
    description: 'Hoodie oversized kasual bergaya pemuda kota metropolitan.',
  },

  // --- HAIR STYLES ---
  // Default / Biasa Saja (Gratis)
  {
    id: 'hair_simple',
    category: 'hairStyle',
    name: 'Rambut Pendek Biasa',
    value: 'simple_short',
    cost: 0,
    icon: '✂️',
    tier: 'default',
    description: 'Potongan rambut pendek rapi sederhana tanpa gel atau pewarna.',
  },
  {
    id: 'hair_spiky',
    category: 'hairStyle',
    name: 'Rambut Spiky Standar',
    value: 'spiky',
    cost: 0,
    icon: '👦',
    tier: 'default',
    description: 'Gaya rambut berdiri kasual yang sering dipakai anak muda.',
  },
  // Paid Exclusive (Unik & Mewah)
  {
    id: 'hair_flame',
    category: 'hairStyle',
    name: 'Rambut Api Membara (Neon Flame)',
    value: 'flame_spikes',
    cost: 500,
    icon: '🔥',
    tier: 'legendary',
    description: 'Gaya rambut lonjakan aura energi api super kosmik yang menyala berkobar-kobar.',
  },
  {
    id: 'hair_royal',
    category: 'hairStyle',
    name: 'Rambut Bangsawan Bergelombang',
    value: 'royal_curls',
    cost: 320,
    icon: '👑',
    tier: 'epic',
    description: 'Rambut ikal elegan panjang terurai layaknya pangeran dan putri bangsawan Eropa.',
  },
  {
    id: 'hair_dreadlocks',
    category: 'hairStyle',
    name: 'Cyberpunk Dreadlocks & Gold Rings',
    value: 'dreadlocks',
    cost: 280,
    icon: '🪮',
    tier: 'epic',
    description: 'Rambut gimbal futuristik diikat rapi dengan cincin emas penahan kuantum.',
  },
  {
    id: 'hair_ponytail',
    category: 'hairStyle',
    name: 'Kuncir Kuda Stylish',
    value: 'ponytail',
    cost: 140,
    icon: '👱‍♀️',
    tier: 'standard',
    description: 'Ikatan kuncir tinggi anggun yang dinamis saat bergerak.',
  },
  {
    id: 'hair_bangs',
    category: 'hairStyle',
    name: 'Poni Anime Jenius',
    value: 'bangs',
    cost: 110,
    icon: '💇',
    tier: 'standard',
    description: 'Gaya rambut poni depan lurus khas karakter jenius anime Jepang.',
  },
  {
    id: 'hair_curly',
    category: 'hairStyle',
    name: 'Afro Keren Bervolume',
    value: 'curly',
    cost: 110,
    icon: '🧑‍🦱',
    tier: 'standard',
    description: 'Gaya rambut bulat mengembang bervolume tebal penuh gaya.',
  },
];

export function getUserProfile(): { name: string; avatar: AvatarConfig } {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    name: 'Pemain ' + Math.floor(100 + Math.random() * 900),
    avatar: DEFAULT_AVATAR,
  };
}

export function saveUserProfile(name: string, avatar: AvatarConfig) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ name, avatar }));
  } catch {}
}

export function getUserCoins(): number {
  try {
    const raw = localStorage.getItem(COINS_KEY);
    if (raw !== null) return parseInt(raw, 10);
  } catch {}
  return 250; // Starting bonus coins
}

export function addCoins(amount: number): number {
  const current = getUserCoins();
  const next = Math.max(0, current + amount);
  try {
    localStorage.setItem(COINS_KEY, next.toString());
  } catch {}
  return next;
}

export function getUnlockedItems(): string[] {
  try {
    const raw = localStorage.getItem(UNLOCKED_ITEMS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    'h_none',
    'h_cap',
    'e_none',
    'e_simple',
    'o_plain',
    'o_school',
    'hair_simple',
    'hair_spiky',
  ];
}

export function unlockItem(itemId: string) {
  const items = getUnlockedItems();
  if (!items.includes(itemId)) {
    items.push(itemId);
    try {
      localStorage.setItem(UNLOCKED_ITEMS_KEY, JSON.stringify(items));
    } catch {}
  }
}

export function getUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    rankPoints: 1240,
    matchesPlayed: 8,
    wins: 5,
    miniGamesWon: 4,
  };
}

export function updateStats(isWin: boolean, miniWon: boolean = false) {
  const current = getUserStats();
  const newPoints = isWin ? current.rankPoints + 35 : Math.max(800, current.rankPoints - 15);
  const updated: UserStats = {
    rankPoints: newPoints,
    matchesPlayed: current.matchesPlayed + 1,
    wins: isWin ? current.wins + 1 : current.wins,
    miniGamesWon: miniWon ? current.miniGamesWon + 1 : current.miniGamesWon,
  };
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function getGlobalLeaderboard(): LeaderboardEntry[] {
  const stats = getUserStats();
  const profile = getUserProfile();

  const baseBotEntries: LeaderboardEntry[] = [
    {
      id: 'bot_top1',
      rank: 1,
      name: 'Raden Archimedes',
      avatar: { ...DEFAULT_AVATAR, headwear: 'halo', outfit: 'wizard', outfitColor: '#fbbf24', hairColor: '#e0e7ff' },
      tier: 'Grandmaster Aljabar',
      points: 2840,
      wins: 112,
      winRate: 88,
    },
    {
      id: 'bot_top2',
      rank: 2,
      name: 'Siti Pythagoras',
      avatar: { ...DEFAULT_AVATAR, hairStyle: 'ponytail', headwear: 'visor', outfit: 'armor', outfitColor: '#38bdf8' },
      tier: 'Master Matematika',
      points: 2410,
      wins: 89,
      winRate: 82,
    },
    {
      id: 'bot_top3',
      rank: 3,
      name: 'Arya Matrix',
      avatar: { ...DEFAULT_AVATAR, headwear: 'catears', eyewear: 'sunglasses', outfit: 'cyber', outfitColor: '#ec4899' },
      tier: 'Berlian I',
      points: 2150,
      wins: 67,
      winRate: 75,
    },
    {
      id: 'bot_top4',
      rank: 4,
      name: 'Budi Al-Khwarizmi',
      avatar: { ...DEFAULT_AVATAR, hairStyle: 'curly', headwear: 'tophat', eyewear: 'monocle', outfit: 'school' },
      tier: 'Berlian II',
      points: 1980,
      wins: 54,
      winRate: 70,
    },
    {
      id: 'bot_top5',
      rank: 5,
      name: 'Citra Fibonacci',
      avatar: { ...DEFAULT_AVATAR, headwear: 'headset', eyewear: 'nerd', outfit: 'hoodie', outfitColor: '#10b981' },
      tier: 'Emas I',
      points: 1650,
      wins: 43,
      winRate: 64,
    },
  ];

  // Calculate user tier
  let tier = 'Perunggu III';
  if (stats.rankPoints >= 2500) tier = 'Grandmaster Aljabar';
  else if (stats.rankPoints >= 2200) tier = 'Master Matematika';
  else if (stats.rankPoints >= 1800) tier = 'Berlian';
  else if (stats.rankPoints >= 1400) tier = 'Emas';
  else if (stats.rankPoints >= 1100) tier = 'Perak';

  const userEntry: LeaderboardEntry = {
    id: 'current_user',
    rank: 6,
    name: profile.name,
    avatar: profile.avatar,
    tier,
    points: stats.rankPoints,
    wins: stats.wins,
    winRate: stats.matchesPlayed > 0 ? Math.round((stats.wins / stats.matchesPlayed) * 100) : 0,
    isUser: true,
  };

  const list = [...baseBotEntries, userEntry];
  list.sort((a, b) => b.points - a.points);
  list.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return list;
}
