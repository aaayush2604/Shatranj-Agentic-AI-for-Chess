import { Chess } from "chess.js";

export function getBestMove(fen, depth = 3) {
  const game = new Chess(fen);

  let bestMove = null;
  let bestValue = -Infinity;

  for (const move of game.moves({ verbose: true })) {
    game.move(move);
    const value = minimax(game, depth - 1, -Infinity, Infinity, false);
    game.undo();

    if (value > bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }

  return bestMove
    ? {
        from: bestMove.from,
        to: bestMove.to,
        promotion: bestMove.promotion || undefined,
      }
    : null;
}

function minimax(game, depth, alpha, beta, isMaximizing) {
  if (depth === 0 || game.isGameOver()) return evaluateBoard(game);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of game.moves({ verbose: true })) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of game.moves({ verbose: true })) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function evaluateBoard(game) {
  const pieceValues = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
  };

  const board = game.board();
  let evalScore = 0;

  for (const row of board) {
    for (const piece of row) {
      if (piece) {
        const value = pieceValues[piece.type];
        evalScore += piece.color === "w" ? value : -value;
      }
    }
  }

  return evalScore;
}
