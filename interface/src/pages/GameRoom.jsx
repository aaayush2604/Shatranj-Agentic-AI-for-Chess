import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useParams } from 'react-router-dom';
import { useResizeDetector } from 'react-resize-detector';
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
  const {width,ref}=useResizeDetector();
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
    <div className="flex flex-col md:flex-row justify-center items-center md:items-center md:justify-around gap-4 h-screen">
      
      <div className='flex flex-col justify-center gap-10 items-center w-full md:w-1/2 h-full'>
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

      <div ref={ref} className='h-full w-full md:w-1/2 flex items-center justify-center px-2'>
        <div >
          {width && <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            boardOrientation={color}
            arePiecesDraggable={!gameOver && chessRef.current.turn() === color[0]}
            animationDuration={200}
            boardWidth={Math.min(width-30,400)}
          />}
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
