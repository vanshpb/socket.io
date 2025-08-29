const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  const io = new Server(httpServer, {
    cors: {
      origin: "*", // allow frontend from same domain
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

  // let Next.js handle everything else
  server.all("*", (req, res) => handle(req, res));

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 App running on http://localhost:${PORT}`);
  });
});
