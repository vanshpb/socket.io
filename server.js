const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Next.js dev server
    methods: ["GET", "POST"],
  },
});

let users = {}; // socket.id -> username

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("register", (username) => {
    users[socket.id] = username;
    io.emit("user-list", Object.values(users));
  });

  socket.on("chat-message", ({ from, text }) => {
    io.emit("chat-message", { from, text }); // broadcast to everyone
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    delete users[socket.id];
    io.emit("user-list", Object.values(users));
  });
});

server.listen(2000, () => {
  console.log("🚀 Socket.IO server running on http://localhost:2000");
});
