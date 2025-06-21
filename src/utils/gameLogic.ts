export function checkWinner(
  board: ("X" | "O" | null)[],
  index: number,
  symbol: "X" | "O",
  boardSize: number = 20,
  winLength: number = 5
): boolean {
  const directions = [
    { dx: 1, dy: 0 }, // ngang →
    { dx: 0, dy: 1 }, // dọc ↓
    { dx: 1, dy: 1 }, // chéo chính ↘
    { dx: -1, dy: 1 }, // chéo phụ ↙
  ];

  const row = Math.floor(index / boardSize);
  const col = index % boardSize;

  for (const { dx, dy } of directions) {
    let count = 1;

    // Đi về 1 phía
    for (let step = 1; step < winLength; step++) {
      const newRow = row + dy * step;
      const newCol = col + dx * step;

      if (
        newRow < 0 ||
        newRow >= boardSize ||
        newCol < 0 ||
        newCol >= boardSize
      )
        break;

      const newIndex = newRow * boardSize + newCol;
      if (board[newIndex] !== symbol) break;

      count++;
    }

    // Đi về phía ngược lại
    for (let step = 1; step < winLength; step++) {
      const newRow = row - dy * step;
      const newCol = col - dx * step;

      if (
        newRow < 0 ||
        newRow >= boardSize ||
        newCol < 0 ||
        newCol >= boardSize
      )
        break;

      const newIndex = newRow * boardSize + newCol;
      if (board[newIndex] !== symbol) break;

      count++;
    }

    if (count >= winLength) return true; // Đủ 5 ô liên tiếp
  }

  return false;
}
