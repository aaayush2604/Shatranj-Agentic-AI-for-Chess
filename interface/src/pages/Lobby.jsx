// import { useState } from 'react';
// import axios from 'axios';
// import socket from '../socket';
// import { useNavigate } from 'react-router-dom';

// const Lobby = () => {
//   const [gameId, setGameId] = useState('');
//   const navigate = useNavigate();

//   const handleCreateGame = async () => {
//     const res = await axios.post('http://localhost:5000/create-game', {});
//     socket.emit('join-room', { gameId: res.data.gameId });
//     navigate(`/game/${res.data.gameId}`);
//   };

//   const handleJoinGame = async () => {
//     try {
//       await axios.post('http://localhost:5000/join-game', { gameId });
//       socket.emit('join-room', { gameId });
//       navigate(`/game/${gameId}`);
//     } catch (err) {
//       alert('Game not found');
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen gap-4 text-center">
//       <button onClick={handleCreateGame} className="bg-blue-600 text-white px-4 py-2 rounded">
//         Create Game
//       </button>
//       <input
//         className="border px-3 py-1 rounded"
//         value={gameId}
//         onChange={(e) => setGameId(e.target.value)}
//         placeholder="Enter Game ID"
//       />
//       <button onClick={handleJoinGame} className="bg-green-600 text-white px-4 py-2 rounded">
//         Join Game
//       </button>
//     </div>
//   );
// };

// export default Lobby;


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
    <div className="flex flex-col items-center justify-center h-screen gap-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Chess Lobby</h1>

      <button onClick={handleCreateGame} className="bg-blue-600 text-white px-4 py-2 rounded">
        Create Multiplayer Game
      </button>

      <input
        className="border px-3 py-1 rounded"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
        placeholder="Enter Game ID"
      />

      <button onClick={handleJoinGame} className="bg-green-600 text-white px-4 py-2 rounded">
        Join Multiplayer Game
      </button>

      <div className="my-4">OR</div>

      <button onClick={handlePlayVsAI} className="bg-purple-600 text-white px-4 py-2 rounded">
        Play vs AI
      </button>
    </div>
  );
};

export default Lobby;
