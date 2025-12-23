import { io } from "socket.io-client";

const URL = "http://localhost:5000";  
let socket = null;

const getToken = () => {
  const rawToken = localStorage.getItem("token") || "";
  return rawToken
    .replace(/^"+|"+$/g, "")
    .replace(/^'+|'+$/g, "")
    .trim();
};

export const createSocket = () => {
  const token = getToken();

  // If socket already exists, but token changed (or was empty before), update & reconnect
  if (socket) {
    const oldToken = socket.auth?.token || "";
    if (oldToken !== token) {
      socket.auth = { token };
      socket.disconnect();
      socket.connect();
    }
    return socket;
  }

  socket = io(URL, {
    auth: { token },
    transports: ["polling", "websocket"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
  });

  // Helpful logs 
  socket.on("connect", () => console.log("✅ socket connected:", socket.id));
  socket.on("connect_error", (err) =>
    console.log("❌ socket connect_error:", err.message)
  );

  return socket;
};
