const path = require("path");
const express = require("express");
const socketIo = require("socket.io");
const PORT = process.env.PORT || 2222;
const app = express();
const formatMessage = require("./utils/message");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");
// Require http to use it for make handshake for websocket
const http = require("http");

// Create http server
const server = http.createServer(app);

// Make socket use http server(server)
const io = socketIo(server);

// Name of Chat app
const chatName = "ChatApp Bot";
//Run when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    // Get user object from userJoin function
    let user = userJoin(socket.id, username, room);

    // socket.join() should receive only the room name
    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(chatName, "Welcome from server"));

    // Broadcast when a user connects to specific room(java, js, c#, python and so on.....)
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(chatName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit("usersRoom", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on("chatMessage", (message) => {
    const user = getCurrentUser(socket.id);
    io.emit("message", formatMessage(user.username, message));
  });

  // Runs when client disconnect
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.emit(
        "message",
        formatMessage(chatName, `${user.username} has left the chat`)
      );
    }
  });
});

// Use Static Files from Public
app.use(express.static(path.join(__dirname, "public")));

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
