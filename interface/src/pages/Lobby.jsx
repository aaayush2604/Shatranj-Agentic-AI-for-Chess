import { useState } from 'react';
import axios from 'axios';
import socket from '../socket';
import { useNavigate } from 'react-router-dom';

const Lobby = () => {
  const [gameId, setGameId] = useState('');
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    const res = await axios.post('https://shatranj-agentic-ai-for-chess.onrender.com/create-game', {});
    socket.emit('join-room', { gameId: res.data.gameId });
    navigate(`/game/${res.data.gameId}`);
  };

  const handleJoinGame = async () => {
    try {
      await axios.post('https://shatranj-agentic-ai-for-chess.onrender.com/join-game', { gameId });
      socket.emit('join-room', { gameId });
      navigate(`/game/${gameId}`);
    } catch (err) {
      alert('Game not found');
    }
  };

  const handlePlayVsAI = async () => {
    const res = await axios.post('https://shatranj-agentic-ai-for-chess.onrender.com', {});
    navigate(`/vs-ai/${res.data.gameId}`);
  };

  return (
    <div className="h-screen gap-4 text-center bg-[var(--color-two)]">
      <div className='absolute h-[95%] w-4/5 right-10 bottom-0 flex flex-col justify-end items-start'>
        <h1 className="absoute  text-5xl font-bold mb-4 font-toccoBold text-[var(--text-color-two)]">शतरंज  Lobby</h1>
        <div className="h-[80%] w-full rounded-t-2xl flex flex-col items-start justify-center gap-10 text-center bg-[var(--primary-color)] md:pl-7 px-6">
          <button onClick={handleCreateGame} className="sm:px-4 sm:py-2 sm:w-[310px] h-[50px] sm:text-start sm:hover:border-4 hover:border-2 hover:border-black rounded-xl font-arvoBold sm:text-xl shadow-black hover:shadow-md text-base text-center w-11/12">
            Create Multiplayer Game
          </button>

          <div>
            <input
              className="border-4 w-[160px] h-[50px] px-4 outline-none focus:ring-0 focus:border-none py-2 text-start rounded border-none font-arvoBold"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter Game ID"
            />

            <button onClick={handleJoinGame} className="sm:px-4 sm:py-2 sm:w-[310px] h-[50px] sm:text-start sm:hover:border-4 hover:border-2 hover:border-black rounded-xl font-arvoBold sm:text-xl shadow-black hover:shadow-md text-base text-center w-11/12">
              Join Multiplayer Game
            </button>
          </div>
          <button onClick={handlePlayVsAI} className="sm:px-4 sm:py-2 sm:w-[310px] h-[50px] sm:text-start sm:hover:border-4 hover:border-2 hover:border-black rounded-xl font-arvoBold sm:text-xl shadow-black hover:shadow-md text-base text-center w-11/12">
            Play vs AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
