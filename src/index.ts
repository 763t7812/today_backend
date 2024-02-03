import { Socket } from "socket.io";
import http from "http";

import express from 'express';
import { Server } from 'socket.io';
import { UserManager } from "./managers/UserManger";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const userManager = new UserManager();

io.on('connection', (socket: Socket) => {
  console.log('a user connected');
  userManager.addUser("randomName", socket);
  socket.on("disconnect", () => {
    console.log("user disconnected");

    socket.emit("user_disconnected", {
      socketId: socket.id
    });
    userManager.removeUser(socket.id);
  })
  socket.on("send_event", () => {
    // Use socket.emit to send the event to all other clients
    socket.broadcast.emit('recv_event', { name: 'Your desired message here' });
  });
  socket.on("msg", (data) => {
    const { message, targetSocketId } = data;
    socket.join(targetSocketId);
    socket.to(targetSocketId).emit('recv_msg', { msg: message });
  });
  socket.on("connect_room", (data) => {
    const {  targetSocketId } = data;
    socket.join(targetSocketId);
  });
  socket.on("disconnect_room", (data) => {
    const {  targetSocketId } = data;
    socket.leave(targetSocketId);
  });
  socket.on("typing", (typing) => {
    // Use socket.emit to send the event to all other clients
    socket.emit('recv_typing', { type: typing });
  });

});

server.listen(4000, () => {
  console.log('listening on *:3000');
});