import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import { getBestMove } from "./ai.js"; // assuming ai.js uses export

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // change to your frontend URL in prod
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// Game room state
const games = {};

// REST API routes
app.post("/create-game", (req, res) => {
  const gameId = Math.random().toString(36).substr(2, 6);
  games[gameId] = {
    players: [],
    moves: [],
    currentFen: req.body.fen || "start",
  };
  res.json({ gameId });
});

app.post("/join-game", (req, res) => {
  const { gameId } = req.body;
  if (games[gameId]) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Game not found" });
  }
});

app.post("/suggest-move", (req, res) => {
  const { fen } = req.body;
  const move = getBestMove(fen);
  res.json(move);
});

// WebSocket events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  socket.on("join-room", ({ gameId }) => {
    socket.join(gameId);

    const room = io.sockets.adapter.rooms.get(gameId);
    if (room.size === 2) {
      const sockets = Array.from(room);
      io.to(sockets[0]).emit("assign-color", { color: "white" });
      io.to(sockets[1]).emit("assign-color", { color: "black" });
      io.to(gameId).emit("opponent-joined");
    }
  });

  socket.on("send-move", ({ gameId, from, to, promotion }) => {
    socket.to(gameId).emit("receive-move", { from, to, promotion });
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
