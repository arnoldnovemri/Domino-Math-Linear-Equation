export interface DominoCard {
  id: string;
  leftVal: number; // 0 to 6
  rightVal: number; // 0 to 6
  leftEquation: string; // e.g. "3x - 5 = 7"
  rightEquation: string; // e.g. "5x + 2 = 3x + 8"
  leftAnswer?: number;
  rightAnswer?: number;
  isSolved: boolean; // whether player has solved the card
}

export type PlayerType = 'human' | 'ai';

export interface Player {
  id: string;
  name: string;
  avatar: AvatarConfig;
  type: PlayerType;
  cards: DominoCard[];
  score: number;
  isReady: boolean;
  coins: number;
  rankPoints: number;
  lastEmote?: string;
  isPassed?: boolean;
}

export interface PlacedDomino {
  card: DominoCard;
  leftVal: number;
  rightVal: number;
  placedBy: string;
  turnIndex: number;
  end: 'left' | 'right' | 'first';
}

export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'ai' | 'multiplayer';

export type GamePhase =
  | 'intro'
  | 'profile' // Halaman 1: Nama & Avatar 3D
  | 'room' // Halaman 2: Ruangan & Mode Permainan
  | 'difficulty' // Halaman 3: Level Kesulitan
  | 'theme' // Halaman 4: Tempat / Peta dengan Gambaran Visual
  | 'solving' // Halaman 5: Pre-match solving phase
  | 'playing' // Halaman 6: Meja Domino 3D
  | 'gameover'; // Halaman 7: Hasil Pertandingan

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  isEmote?: boolean;
}

export interface RoomState {
  roomCode: string;
  hostId: string;
  players: Player[];
  status: 'waiting' | 'starting' | 'in_game' | 'finished';
  themeId: string;
  maxPlayers: number;
}

export interface AvatarConfig {
  skinColor: string;
  hairStyle:
    | 'simple_short'
    | 'spiky'
    | 'ponytail'
    | 'curly'
    | 'bangs'
    | 'beanie'
    | 'flame_spikes'
    | 'royal_curls'
    | 'dreadlocks';
  hairColor: string;
  headwear:
    | 'none'
    | 'cap'
    | 'tophat'
    | 'headset'
    | 'catears'
    | 'halo'
    | 'visor'
    | 'crown'
    | 'dragon_horns';
  eyewear:
    | 'none'
    | 'simple_glasses'
    | 'sunglasses'
    | 'nerd'
    | 'monocle'
    | 'goggles'
    | 'cyber_eye'
    | 'gold_shades';
  outfit:
    | 'plain_tee'
    | 'school'
    | 'hoodie'
    | 'cyber'
    | 'wizard'
    | 'armor'
    | 'emperor_armor'
    | 'galaxy_wizard'
    | 'cyber_exosuit'
    | 'vip_tuxedo';
  outfitColor: string;
  expression: 'happy' | 'confident' | 'cool' | 'playful';
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar: AvatarConfig;
  tier: string;
  points: number;
  wins: number;
  winRate: number;
  isUser?: boolean;
}
