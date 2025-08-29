// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // Socket.IO setup
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  let users = {};

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    socket.on("register", (username) => {
      users[socket.id] = username;
      io.emit("user-list", Object.values(users));
    });

    socket.on("private-message", ({ from, to, text }) => {
      const targetSocketId = Object.keys(users).find(
        (id) => users[id] === to
      );
      if (targetSocketId) {
        io.to(targetSocketId).emit("private-message", { from, text });
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
      delete users[socket.id];
      io.emit("user-list", Object.values(users));
    });
  });

  // Next.js pages
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server ready on http://localhost:${port}`);
  });
});
