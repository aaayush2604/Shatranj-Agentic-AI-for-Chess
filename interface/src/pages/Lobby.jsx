import { useState } from 'react';
import axios from 'axios';
import socket from '../socket';
import { useNavigate } from 'react-router-dom';

const Lobby = () => {
  const [gameId, setGameId] = useState('');
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    const res = await axios.post('http://localhost:5000/create-game', {});
    socket.emit('join-room', { gameId: res.data.gameId });
    navigate(`/game/${res.data.gameId}`);
  };

  const handleJoinGame = async () => {
    try {
      await axios.post('http://localhost:5000/join-game', { gameId });
      socket.emit('join-room', { gameId });
      navigate(`/game/${gameId}`);
    } catch (err) {
      alert('Game not found');
    }
  };

  const handlePlayVsAI = async () => {
    const res = await axios.post('http://localhost:5000/create-game', {});
    navigate(`/vs-ai/${res.data.gameId}`);
  };

  return (
    <div className="h-screen gap-4 text-center bg-[var(--color-two)]">
      <div className='absolute h-[95%] w-4/5 right-10 bottom-0 flex flex-col justify-end items-start'>
        <h1 className="absoute  text-5xl font-bold mb-4 font-toccoBold text-[var(--text-color-two)]">Chess Lobby</h1>
        <div className="h-[80%] w-full rounded-t-2xl flex flex-col items-start justify-center gap-10 text-center bg-[var(--primary-color)] pl-7">
          
          <button onClick={handleCreateGame} className="px-4 py-2 w-[310px] h-[50px] text-start hover:border-4 hover:border-black rounded-xl font-arvoBold text-xl shadow-black hover:shadow-md">
            Create Multiplayer Game
          </button>

          <div>
            <input
              className="border-4 w-[160px] h-[50px] px-4 outline-none focus:ring-0 focus:border-none py-2 text-start rounded border-none font-arvoBold"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter Game ID"
            />

            <button onClick={handleJoinGame} className="px-4 py-2 w-[310px] h-[50px] hover:border-4 hover:border-black rounded-xl font-arvoBold text-xl shadow-black hover:shadow-md text-start">
              Join Multiplayer Game
            </button>
          </div>
          <button onClick={handlePlayVsAI} className="px-4 py-2 w-[310px] h-[50px] hover:border-4 hover:border-black rounded-xl font-arvoBold text-xl shadow-black hover:shadow-md text-start">
            Play vs AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
