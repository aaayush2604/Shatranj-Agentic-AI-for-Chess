// import ChessGame from './components/ChessGame'
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Lobby from './pages/Lobby';
// import GameRoom from './pages/GameRoom';

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Lobby />} />
//         <Route path="/game/:gameId" element={<GameRoom />} />
//       </Routes>
//     </BrowserRouter>
//   )
// }

// export default App

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        {/* Multiplayer game */}
        <Route path="/game/:gameId" element={<GameRoom />} />
        {/* Play vs AI game */}
        <Route path="/vs-ai/:gameId" element={<GameRoom vsAI={true} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
