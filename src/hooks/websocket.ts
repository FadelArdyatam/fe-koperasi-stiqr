import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  const url = `${import.meta.env.VITE_API_BASE_URL}`;
  if (!socket) {
    socket = io(url, {
      secure: true,
      transports: ["websocket", "polling"],
      forceNew: false,
      reconnection: true,
      timeout: 5000,
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("connect_error", (error) => {
      console.log("Connection error:", error);
    });
  }
  return socket;
};
