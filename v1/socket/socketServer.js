// socketServer.js

const { Server } = require("socket.io");
let io; // Global Socket.IO instance

const initializeSocketServer = (socketPort = 4040) => {
  const httpServer = require("http").createServer(); // Create HTTP Server
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000"], // Replace with your React app's URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

    socket.on("chat message", (message) => {
      console.log("Received chat message:", message);
      io.emit("chat message", message); // Broadcast message to all clients
    });
  });

  httpServer.listen(socketPort, () => {
    console.log(`Socket.IO server is running on port ${socketPort}`);
  });
};

const emitEvent = (eventName, data) => {
  if (io) {
    io.emit(eventName, data);
    console.log(`Event ${eventName} emitted with data:`, data);
  } else {
    console.error("Socket.IO server is not initialized.");
  }
};

module.exports = { initializeSocketServer, emitEvent };
