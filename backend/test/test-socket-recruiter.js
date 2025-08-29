import { io } from "socket.io-client";
import readline from "readline";
import axios from "axios";

const recruiterToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODZhMzI1ZDg4ZjY1NTE0ZDgxM2U5ZWEiLCJtb2RlbCI6IlJlY3J1aXRlciIsImlhdCI6MTc1MTc5MDUxMywiZXhwIjoxNzUxNzk0MTEzfQ.f_Nab2m6yaS5jxy1VDeaTugpI5egSvltbvPGw6RhYdI";
const socket = io(process.env.BACKEND_URL || "http://localhost:5000", {
  auth: { token: recruiterToken },
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
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    socket.emit('sendMessageToRoom', { chatId, message: response.data.newMessage });
    console.log("Message sent:", response.data.message);
  } catch (error) {
    console.error("Failed to send message from recruiter:", (error.response?.data?.message || error.message));
  }
  rl.prompt();
});