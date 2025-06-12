import { useState } from "react"
import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"

const ChessGame = () => {
  const [game, setGame] = useState(new Chess())

  const makeAMove = (move) => {
    const gameCopy = new Chess(game.fen())
    const result = gameCopy.move(move)
    if (result) {
      setGame(gameCopy)
    }
    return result
  }

  const onDrop = (sourceSquare, targetSquare) => {
    makeAMove({ from: sourceSquare, to: targetSquare, promotion: "q" })
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <div>
        <h1 className="text-3xl mb-4 text-center font-bold">♟ Web Chess Platform</h1>
        <Chessboard position={game.fen()} onPieceDrop={onDrop} boardWidth={400} />
      </div>
    </div>
  )
}

export default ChessGame
