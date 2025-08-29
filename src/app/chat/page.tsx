"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function ChatPage() {
  const socketRef = useRef<Socket | null>(null);

  const [username, setUsername] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const socket = io("http://localhost:2000");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("user-list", (onlineUsers: string[]) => {
      setUsers(onlineUsers);
    });

    socket.on("chat-message", ({ from, text }) => {
      setMessages((prev) => [...prev, { from, text }]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const register = () => {
    if (username.trim() !== "" && socketRef.current) {
      socketRef.current.emit("register", username);
      setIsRegistered(true);
    }
  };

  const sendMessage = () => {
    if (message.trim() !== "" && socketRef.current) {
      socketRef.current.emit("chat-message", { from: username, text: message });
      setMessage("");
    }
  };

  return (
    <div className="p-6">
      {!isRegistered ? (
        <div>
          <input
            className="border px-3 py-1"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            onClick={register}
            className="ml-2 px-4 py-1 bg-blue-500 text-white"
          >
            Join
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {/* Online Users */}
          <div className="border p-4">
            <h2 className="font-bold">Online Users</h2>
            <ul>
              {users.map((user, idx) => (
                <li key={idx}>{user}</li>
              ))}
            </ul>
          </div>

          {/* Messages */}
          <div className="col-span-2 border p-4">
            <h2 className="font-bold">Global Chat</h2>
            <div className="h-64 overflow-y-auto border p-2 mb-2">
              {messages.map((msg, idx) => (
                <p key={idx}>
                  <strong>{msg.from}:</strong> {msg.text}
                </p>
              ))}
            </div>
            <div>
              <input
                className="border px-3 py-1 w-3/4"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                onClick={sendMessage}
                className="ml-2 px-4 py-1 bg-green-500 text-white"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
