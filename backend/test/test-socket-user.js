import { io } from "socket.io-client";
import readline from "readline";
import axios from "axios";

const userToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODZhMzIxZTg4ZjY1NTE0ZDgxM2U5YmEiLCJtb2RlbCI6IlVzZXIiLCJpYXQiOjE3NTE3OTA0NDgsImV4cCI6MTc1MjM5NTI0OH0.rduLB1f6p1v88noXoGLGdEw4KAw1MZG1mwUNL2PynLU";
const socket = io(process.env.BACKEND_URL || "http://localhost:5000", {
  auth: { token: userToken },
  transports: ["websocket"],
});
const chatId = "686a3456b8686390918dff35";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

socket.on('connect', () => {
  console.log("Connected as", socket.id);
  socket.emit('joinChat', chatId, (response) => {
    if (response.error) {
      console.error('Failed to join chat:', response.error);
      rl.close();
    } else {
      console.log("Joined chat room:", chatId);
      rl.setPrompt("Type your message: ");
      rl.prompt();
    }
  });
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
  rl.close();
});

socket.on("userInfo", (user) => {
  console.log("Authenticated user info:", user);
  console.log("You can start sending messages now.");
  rl.prompt();
});

socket.on("receiveMessage", (message) => {
  console.log("\nReceived message:", message);
  rl.prompt();
});

socket.on('disconnect', () => {
  console.log('Client disconnected:', socket.id);
  socket.rooms.forEach(room => {
    if (room !== socket.id) socket.leave(room);
  });
  rl.close();
});

rl.on("line", async (line) => {
  try {
    const response = await axios.post(
      `${process.env.BACKEND_URL || "http://localhost:5000"}/chats/${chatId}/message`,
      { content: line.trim() },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    socket.emit('sendMessageToRoom', { chatId, message: response.data.newMessage });
    console.log("Message sent:", response.data.message);
  } catch (error) {
    console.error("Failed to send message from user:", (error.response?.data?.message || error.message));
  }
  rl.prompt();
});