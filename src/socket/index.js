let onlineUsers = [];

export const newConnectionHandler = (socket) => {
  // "connection" is NOT A CUSTOM EVENT. This is a socket.io event, it's triggered every time a new client connects!
  console.log("A new client connected! it's id is:", socket.id);
  // 1. Emit a "welcome" event to the connected client
  socket.emit("welcome", { message: `HELLO ${socket.id}` });

  // 2. Listen to an event emitted by FE called "setUsername", this event should contain the username in the payload
  socket.on("setUsername", (payload) => {
    console.log(payload);

    // 2.1 Whenever we receive the username, we have to keep track of it together with the socket.id
    onlineUsers.push({ username: payload.username, socketId: socket.id });

    // 2.2 Then we have to send the list of online users to the current user that just "logged in"
    socket.emit("loggedIn", onlineUsers);

    // 2.3 We have also to inform everybody else of the new user which just joined
    socket.broadcast.emit("updateOnlineUsersList", onlineUsers);
  });

  // 3. Listen for an event called "sendMessage", this is triggered when a user sends a new chat message
  socket.on("sendMessage", (message) => {
    // 3.1 Whenever we receive the new message we have to "propagate" that message to everybody but not the sender
    socket.broadcast.emit("newMessage", message);
  });

  // 4. Listen for an event called "disconnect" (this is NOT A CUSTOM EVENT!). This event happens when an user closes the browser/tab/window
  socket.on("disconnect", () => {
    // 4.1 Server shall update the list of onlineUsers by removing the one that has disconnected
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

    // 4.2 We have to notify everybody who is still connected by communicating the updated list
    socket.broadcast.emit("updateOnlineUsersList", onlineUsers);
  });
};
