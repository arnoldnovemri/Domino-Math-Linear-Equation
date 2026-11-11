import { DominoCard } from '../types/game';

/**
 * Generates a single-variable linear equation whose unique solution is `targetX` (0..6).
 */
export function generateLinearEquation(targetX: number): string {
  // Collection of template generators for variety
  const templates = [
    // Type 1: ax + b = c
    () => {
      const a = [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)];
      const b = Math.floor(Math.random() * 9) - 4; // -4 to +4
      const c = a * targetX + b;
      const bStr = b === 0 ? '' : b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`;
      const aStr = a === 1 ? 'x' : `${a}x`;
      return `${aStr}${bStr} = ${c}`;
    },
    // Type 2: ax + b = cx + d
    () => {
      const a = [3, 4, 5, 6][Math.floor(Math.random() * 4)];
      const c = a - [1, 2][Math.floor(Math.random() * 2)];
      const diff = a - c; // > 0
      const b = Math.floor(Math.random() * 7) + 1; // 1 to 7
      const d = diff * targetX + b;
      return `${a}x + ${b} = ${c === 1 ? 'x' : `${c}x`} + ${d}`;
    },
    // Type 3: k(x + m) = n
    () => {
      const k = [2, 3][Math.floor(Math.random() * 2)];
      const m = Math.floor(Math.random() * 4) + 1; // 1 to 4
      const n = k * (targetX + m);
      return `${k}(x + ${m}) = ${n}`;
    },
    // Type 4: c - ax = b
    () => {
      const a = [1, 2, 3][Math.floor(Math.random() * 3)];
      const b = Math.floor(Math.random() * 6);
      const c = b + a * targetX;
      return `${c} - ${a === 1 ? 'x' : `${a}x`} = ${b}`;
    },
    // Type 5: k(x - m) = n (when targetX >= m)
    () => {
      if (targetX >= 1) {
        const m = Math.min(targetX, Math.floor(Math.random() * 2) + 1);
        const k = [2, 3, 4][Math.floor(Math.random() * 3)];
        const n = k * (targetX - m);
        return `${k}(x - ${m}) = ${n}`;
      }
      return `${3}x + 2 = ${3 * targetX + 2}`;
    },
    // Type 6: Simple x + a = b
    () => {
      const a = Math.floor(Math.random() * 8) + 1;
      const b = targetX + a;
      return `x + ${a} = ${b}`;
    },
  ];

  const chosen = templates[Math.floor(Math.random() * templates.length)];
  return chosen();
}

/**
 * Creates the complete standard 28-card domino set (double-six).
 * Each domino has two values (0-6) and corresponding linear equations.
 */
export function generateFullDominoDeck(): DominoCard[] {
  const cards: DominoCard[] = [];
  let count = 0;

  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      count++;
      cards.push({
        id: `card_${i}_${j}_${count}`,
        leftVal: i,
        rightVal: j,
        leftEquation: generateLinearEquation(i),
        rightEquation: generateLinearEquation(j),
        isSolved: false,
      });
    }
  }

  // Shuffle the 28 domino cards with Fisher-Yates
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

/**
 * Distributes 28 dominoes equally to 4 players (7 cards each).
 */
export function dealCardsToPlayers(deck: DominoCard[]): DominoCard[][] {
  const hands: DominoCard[][] = [[], [], [], []];
  for (let i = 0; i < 28; i++) {
    const playerIndex = i % 4;
    hands[playerIndex].push({ ...deck[i] });
  }
  return hands;
}
