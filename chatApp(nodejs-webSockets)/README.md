> # The Project Idea

**Simple chat application implemented with nodejs and websockets**

> ## Establish a connection between the frontend and the Socket.io server running in server.js on the backend.

### **How `io` Works Between Backend (`server.js`) and Frontend (`main.js`)**

- The `io` in `server.js` **creates and manages** WebSocket connections.
- The **Socket.IO server** automatically exposes `/socket.io/socket.io.js` to the frontend.
- The `io()` function in `main.js` (frontend) **uses** that exposed WebSocket connection to communicate with the server.

---

### **Flow in Simple Terms:**

1. **Backend (`server.js`) starts Socket.IO**

   ```js
   const server = http.createServer(app);
   const io = require("socket.io")(server);

   io.on("connection", (socket) => {
     console.log("New client connected");
   });
   ```

   - This sets up a **WebSocket server**.

2. **Frontend (`index.html`) loads Socket.IO client**

   ```html
   <script src="/socket.io/socket.io.js"></script>
   <script src="js/main.js"></script>
   ```

   - The browser automatically **gets the client library** from `server.js`.

3. **Frontend (`main.js`) connects using `io()`**

   ```js
   const socket = io(); // Connects to the WebSocket server
   socket.on("message", (msg) => {
     console.log("Received:", msg);
   });
   ```

   - This calls the **`io` object from the backend** and opens a WebSocket connection.

4. **Backend listens and responds**
   ```js
   io.on("connection", (socket) => {
     socket.emit("message", "Welcome to the chat!");
   });
   ```
   - The server **sends data** to the client.

---

### **Key Takeaways:**

✅ The `io` in `server.js` manages WebSocket connections.  
✅ The **client (`main.js`) uses `io()`** (provided by `/socket.io/socket.io.js`).  
✅ **They communicate in real-time** using WebSockets!

> ## Explanation about events in WebSockets

```javascript
socket.on("chatMessage", (message) => {
  console.log(`Message: ${message}`);
});
```

- `socket.on(event, callback)` is listening for an event called `"chatMessage"`.
- The `message` parameter represents the data sent by the client when this event is triggered.

### **Understanding WebSocket Events**

In a WebSocket-based chat system (especially using `socket.io` in Node.js), events like `"chatMessage"`, `"connection"`, and `"disconnect"` are commonly used. Here's what they typically do:

**Common WebSocket Events**

| Event Name      | Purpose                                               |
| --------------- | ----------------------------------------------------- |
| `"connection"`  | Fires when a client connects to the WebSocket server. |
| `"disconnect"`  | Fires when a client disconnects.                      |
| `"chatMessage"` | Custom event for receiving chat messages.             |
| `"joinRoom"`    | Custom event for handling users joining a chat room.  |
| `"typing"`      | Custom event to indicate when a user is typing.       |

---

### **Example: WebSocket Chat Server (Node.js + Socket.io)**

This example shows how to handle `chatMessage` and other events using `socket.io`:

```javascript
const io = require("socket.io")(3000);

io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for chat messages
  socket.on("chatMessage", (message) => {
    console.log(`Message received: ${message}`);

    // Broadcast message to all clients
    io.emit("chatMessage", message);
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
```

### **Client Side (HTML + JavaScript)**

```javascript
const socket = io("ws://localhost:3000");

// Send message to server
document.getElementById("sendBtn").addEventListener("click", () => {
  const msg = document.getElementById("msgInput").value;
  socket.emit("chatMessage", msg);
});

// Receive messages from server
socket.on("chatMessage", (message) => {
  console.log("New message:", message);
});
```

🟢 **Important Point:**
There are **no specific predefined event names** you must use (except built-in ones like `"connect"`, `"disconnect"`, etc.).

You can create and listen to **any event name you choose**, making it **flexible** and **customizable**.

> ## The difference between using io and socket

**1. `io` (Global WebSocket Server)**

- Used on the **server-side**.
- Manages **all connected clients**.
- Can broadcast messages to **all clients**.

**Example: Using `io` to Broadcast to All Clients**

```javascript
const io = require("socket.io")(3000);

io.on("connection", (socket) => {
  console.log("A user connected");

  // Example: Broadcast a message to all clients
  io.emit("welcome", "A new user has joined the chat");
});
```

💡 **`io.emit(event, data)` sends a message to ALL connected clients.**

**2. `socket` (Individual Client)**

- Represents a **single client** connection.
- Used inside the `.on("connection")` event.
- Handles **individual client** messages and actions.

**Example: Using `socket` to Communicate with a Single Client**

```javascript
io.on("connection", (socket) => {
  console.log("A specific user connected");

  // Listen for a message from this client
  socket.on("chatMessage", (msg) => {
    console.log("Message received:", msg);

    // Send response only to this client
    socket.emit("privateMessage", "Hello from the server!");
  });
});
```

💡 **`socket.emit(event, data)` sends a message ONLY to that specific client.**

---

### **Key Differences Between `io` and `socket`**

| Feature          | `io` (Global WebSocket Server)    | `socket` (Single Client Connection)   |
| ---------------- | --------------------------------- | ------------------------------------- |
| Scope            | Manages all clients               | Manages a single client               |
| Use Case         | Broadcast messages to all clients | Handle events for one client          |
| Example          | `io.emit("event", data);`         | `socket.emit("event", data);`         |
| Connection Event | `io.on("connection", callback);`  | `socket.on("chatMessage", callback);` |

---

**3. Example: Using Both `io` and `socket` Together**

```javascript
const io = require("socket.io")(3000);

io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for a chat message from this client
  socket.on("chatMessage", (msg) => {
    console.log("Received message:", msg);

    // Send the message to all clients (including sender)
    io.emit("chatMessage", msg);

    // Or send to all *except* sender
    socket.broadcast.emit("chatMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
```

🔹 **Use `io.emit()`** when broadcasting to **everyone**.  
🔹 **Use `socket.emit()`** when sending to **one client**.  
🔹 **Use `socket.broadcast.emit()`** to send to **everyone except the sender**.

> ## About socket Rooms

Yes! In **Socket.IO**, each socket connection can join one or more **rooms**, and you can emit messages to specific rooms instead of broadcasting to all connected clients. This is useful for **chat applications, multiplayer games, and real-time collaboration tools**.

### **🛠 Understanding Socket.IO Rooms**

🔹 **How Rooms Work**

- A **room** is just a named channel where sockets can join and leave.
- Each **socket** (client connection) can be in multiple rooms at the same time.
- You can send messages **only to users in a specific room**.

---

## **🎯 Key Room Operations**

1️⃣ **Joining a Room**

```javascript
socket.join("room1");
```

> Now, this socket is part of `"room1"`.

2️⃣ **Sending Messages to a Specific Room**

```javascript
io.to("room1").emit("message", "Hello Room 1!");
```

> This sends a message **only to users in `"room1"`**.

3️⃣ **Leaving a Room**

```javascript
socket.leave("room1");
```

> Now, this socket is no longer in `"room1"`.

4️⃣ **Broadcast to Everyone in a Room (except the sender)**

```javascript
socket.to("room1").emit("message", "A new user has joined!");
```

> This sends a message **to all users in `"room1"`, except the sender**.

---

### **📌 Example: Chat Rooms Implementation**

**📝 Server Code (Node.js with Express & Socket.IO)**

```javascript
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);

    // Welcome the current user
    socket.emit("message", `Welcome ${username} to room ${room}`);

    // Notify others in the room (except the new user)
    socket.to(room).emit("message", `${username} has joined the room!`);
  });

  // Handle messages in a specific room
  socket.on("chatMessage", ({ room, message }) => {
    io.to(room).emit("message", message);
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
```

**📝 Client Code (JavaScript)**

```javascript
const socket = io();

// Join a room
socket.emit("joinRoom", { username: "John", room: "Room1" });

// Listen for messages
socket.on("message", (message) => {
  console.log("New message:", message);
});

// Send message to a room
socket.emit("chatMessage", { room: "Room1", message: "Hello everyone!" });
```

## **🌟 Summary**

✅ **Rooms** allow you to group users and send messages to specific groups.  
✅ You can **join** a room using `socket.join(roomName)`.  
✅ You can **send messages** to a room using `io.to(roomName).emit(event, data)`.  
✅ You can **broadcast** to all users in a room **except the sender** using `socket.to(roomName).emit(event, data)`.  
✅ You can **leave a room** using `socket.leave(roomName)`.

## Resources

[VIDEO LINK](http://youtube.com/watch?v=jD7FnbI76Hg)
