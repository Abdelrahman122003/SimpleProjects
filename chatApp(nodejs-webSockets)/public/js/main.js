const chatFrom = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const usersList = document.getElementById("users");
const socket = io();

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Join chatRoom
socket.emit("joinRoom", { username, room });

// Message from server
socket.on("message", (message) => {
  // Call Output Message to show message in chat
  outputMessage(message);

  // Scroll Down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Retrieve Users and Room
socket.on("usersRoom", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Get message that user write it
chatFrom.addEventListener("submit", (e) => {
  e.preventDefault();
  // Get message text
  const msg = e.target.elements.msg.value;

  // Emit message to server to listen it
  socket.emit("chatMessage", msg);

  // Clear Input That is in Chat
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");

  div.innerHTML = `<div class="message">
            <p class="meta">${message.username} <span>${message.time}</span></p>
            <p class="text">
              ${message.message}
            </p>
          </div>`;
  // Add div element to document
  document.querySelector(".chat-messages").appendChild(div);
}

// Add Room Name To DOM
function outputRoomName(room) {
  roomName.innerHTML = room;
}

// Add users To DOM
function outputUsers(users) {
  usersList.innerHTML = `${users
    .map((user) => `<li>${user.username}</li>`)
    .join("")}`;
}
