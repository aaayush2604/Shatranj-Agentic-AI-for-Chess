// import { useEffect, useRef, useState } from 'react';
// import { Chess } from 'chess.js';
// import { Chessboard } from 'react-chessboard';
// import { useParams } from 'react-router-dom';
// import socket from '../socket';

// const GameRoom = () => {
//   const { gameId } = useParams();

//   // Persistent chess instance
//   const chessRef = useRef(new Chess());

//   const [fen, setFen] = useState('start');
//   const [opponentConnected, setOpponentConnected] = useState(false);
//   const [color, setColor] = useState('white');
//   const [gameOver, setGameOver] = useState(false);
//   const [gameResult, setGameResult] = useState('');
//   const [aiSuggestion, setAiSuggestion] = useState(null);
//   const [assistMode, setAssistMode] = useState(false);

//   useEffect(() => {
//     socket.emit('join-room', { gameId });

//     socket.on('opponent-joined', () => {
//       setOpponentConnected(true);
//     });

//     socket.on('assign-color', ({ color }) => {
//       setColor(color);
//     });

//     socket.on('receive-move', ({ from, to, promotion }) => {
//       const move = chessRef.current.move({ from, to, promotion });
//       if (move) {
//         setFen(chessRef.current.fen());
//         checkGameOver();
//       } else {
//         console.warn('Invalid move received:', from, to);
//       }
//     });

//     return () => {
//       socket.off('opponent-joined');
//       socket.off('receive-move');
//       socket.off('assign-color');
//     };
//   }, [gameId]);

//   const makeMove = (move) => {
//     const result = chessRef.current.move(move);
//     if (result) {
//       setFen(chessRef.current.fen());
//       socket.emit('send-move', { gameId, ...move });
//       checkGameOver();
//     }
//     return result !== null;
//   };

//   const onDrop = (sourceSquare, targetSquare) => {
//     if (gameOver || chessRef.current.turn() !== color[0]) return false;
//     const move = {
//       from: sourceSquare,
//       to: targetSquare,
//       promotion: 'q',
//     };
//     return makeMove(move);
//   };

//   const checkGameOver = () => {
//     if (!chessRef.current.isGameOver()) return;

//     setGameOver(true);

//     let result = 'Game Over!';

//     if (chessRef.current.isCheckmate()) {
//       // The player whose turn it is now just got checkmated,
//       // so the previous player is the winner.
//       const winner = chessRef.current.turn() === 'w' ? 'Black' : 'White';
//       result = `Checkmate! ${winner} wins!`;
//     } else if (chessRef.current.isStalemate()) {
//       result = 'Draw by stalemate!';
//     } else if (chessRef.current.isThreefoldRepetition()) {
//       result = 'Draw by threefold repetition!';
//     } else if (chessRef.current.isInsufficientMaterial()) {
//       result = 'Draw due to insufficient material!';
//     } else if (chessRef.current.isDraw()) {
//       result = 'Draw!';
//     }

//     setGameResult(result);
//   };

//   const handleGetAiMove = async () => {
//     const res = await fetch('http://localhost:5000/suggest-move', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ fen }),
//     });
//     const move = await res.json();
//     setAiSuggestion(move);
// };


//   return (
//     <div className="flex flex-col items-center justify-center gap-4 mt-6">
//       <h2 className="text-xl font-bold">Game ID: {gameId}</h2>
//       <p className={opponentConnected ? 'text-green-600' : 'text-yellow-500'}>
//         {opponentConnected ? 'Opponent connected!' : 'Waiting for opponent...'}
//       </p>

//       {gameOver && (
//         <div className="text-lg font-semibold text-red-600">
//           {gameResult}
//         </div>
//       )}

//       <Chessboard
//         position={fen}
//         onPieceDrop={onDrop}
//         boardOrientation={color}
//         arePiecesDraggable={!gameOver && chessRef.current.turn() === color[0]}
//         animationDuration={200}
//         boardWidth={400}
//       />

//       <button
//         onClick={handleGetAiMove}
//         className="px-4 py-2 bg-blue-600 text-white rounded"
//       >
//         Suggest Move
//       </button>

//       {aiSuggestion && (
//         <p className="text-green-600">
//           Suggested: {aiSuggestion.from} → {aiSuggestion.to}
//         </p>
//       )}

//     </div>
//   );
// };

// export default GameRoom;

import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useParams } from 'react-router-dom';
import socket from '../socket';

const GameRoom = ({ vsAI = false }) => {
  const { gameId } = useParams();

  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState('start');
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [color, setColor] = useState('white');
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [assistMode, setAssistMode] = useState(false);

  useEffect(() => {
    socket.emit('join-room', { gameId });

    socket.on('opponent-joined', () => {
      setOpponentConnected(true);
    });

    socket.on('assign-color', ({ color }) => {
      setColor(color);
    });

    socket.on('receive-move', ({ from, to, promotion }) => {
      const move = chessRef.current.move({ from, to, promotion });
      if (move) {
        setFen(chessRef.current.fen());
        checkGameOver();
      } else {
        console.warn('Invalid move received:', from, to);
      }
    });

    return () => {
      socket.off('opponent-joined');
      socket.off('receive-move');
      socket.off('assign-color');
    };
  }, [gameId]);

  const makeMove = (move, isAIMove = false) => {
    const result = chessRef.current.move(move);
    if (result) {
      setFen(chessRef.current.fen());
      checkGameOver();

      if (!isAIMove && !vsAI) {
        socket.emit('send-move', { gameId, ...move });
      }
    }
    return result !== null;
  };

  const makeAIMove = async () => {
    if (gameOver) return;

    const res = await fetch('http://localhost:5000/suggest-move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen: chessRef.current.fen() }),
    });

    const move = await res.json();
    if (move) {
      makeMove(move, true);
    }
  };

  const onDrop = async (sourceSquare, targetSquare) => {
    if (gameOver || chessRef.current.turn() !== color[0]) return false;

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    };

    const success = makeMove(move);

    // If playing against AI and move was successful, call AI
    if (success && vsAI && !gameOver) {
      setTimeout(makeAIMove, 500);
    }

    return success;
  };

  const checkGameOver = () => {
    if (!chessRef.current.isGameOver()) return;

    setGameOver(true);

    let result = 'Game Over!';
    if (chessRef.current.isCheckmate()) {
      const winner = chessRef.current.turn() === 'w' ? 'Black' : 'White';
      result = `Checkmate! ${winner} wins!`;
    } else if (chessRef.current.isStalemate()) {
      result = 'Draw by stalemate!';
    } else if (chessRef.current.isThreefoldRepetition()) {
      result = 'Draw by threefold repetition!';
    } else if (chessRef.current.isInsufficientMaterial()) {
      result = 'Draw due to insufficient material!';
    } else if (chessRef.current.isDraw()) {
      result = 'Draw!';
    }

    setGameResult(result);
  };

  const handleGetAiMove = async () => {
    const res = await fetch('http://localhost:5000/suggest-move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen }),
    });
    const move = await res.json();
    setAiSuggestion(move);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 mt-6">
      <h2 className="text-xl font-bold">Game ID: {gameId}</h2>
      {!vsAI && (
        <p className={opponentConnected ? 'text-green-600' : 'text-yellow-500'}>
          {opponentConnected ? 'Opponent connected!' : 'Waiting for opponent...'}
        </p>
      )}

      {gameOver && (
        <div className="text-lg font-semibold text-red-600">
          {gameResult}
        </div>
      )}

      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        boardOrientation={color}
        arePiecesDraggable={!gameOver && chessRef.current.turn() === color[0]}
        animationDuration={200}
        boardWidth={400}
      />

      {/* Suggest Move Button */}
      <button
        onClick={handleGetAiMove}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Suggest Move
      </button>

      {aiSuggestion && (
        <p className="text-green-600">
          Suggested: {aiSuggestion.from} → {aiSuggestion.to}
        </p>
      )}
    </div>
  );
};

export default GameRoom;
