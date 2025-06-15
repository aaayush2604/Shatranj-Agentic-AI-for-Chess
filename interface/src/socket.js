import { io } from "socket.io-client";

const socket = io("https://shatranj-agentic-ai-for-chess.onrender.com"); // Use actual backend URL if deployed
export default socket;
