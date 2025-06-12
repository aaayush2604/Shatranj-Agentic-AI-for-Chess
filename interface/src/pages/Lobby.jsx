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

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 text-center">
      <button onClick={handleCreateGame} className="bg-blue-600 text-white px-4 py-2 rounded">
        Create Game
      </button>
      <input
        className="border px-3 py-1 rounded"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
        placeholder="Enter Game ID"
      />
      <button onClick={handleJoinGame} className="bg-green-600 text-white px-4 py-2 rounded">
        Join Game
      </button>
    </div>
  );
};

export default Lobby;
