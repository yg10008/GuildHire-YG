import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Create the context
export const ChatContext = createContext();

// Custom hook for consuming ChatContext
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

// Provider component
export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]); // all chats
  const [activeChat, setActiveChat] = useState(null);      // selected chat
  const [messages, setMessages] = useState([]);            // messages of active chat
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const activeChatRef = useRef(null); // Reference to track active chat in socket handlers

  // Update activeChat ref when activeChat changes
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Initialize socket connection
  const initializeSocket = () => {
    const token = localStorage.getItem("token");
    if (!token || socketRef.current) return;

    const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      setIsConnected(false);
    });

    newSocket.on("receiveMessage", ({ chatId, message }) => {
      console.log("Received message via socket:", { chatId, message });
      
      // Only add message if it's for the currently active chat
      if (activeChatRef.current === chatId) {
        setMessages((prevMessages) => {
          // Check if message already exists (prevent duplicates)
          const messageExists = prevMessages.some(
            (msg) => msg._id === message._id || 
            (msg.sentAt === message.sentAt && msg.content === message.content && msg.sender === message.sender)
          );
          
          if (!messageExists) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
      }
      
      // Update last message in conversations list regardless of active chat
      setConversations((prevConversations) => 
        prevConversations.map((conv) => 
          conv._id === chatId 
            ? { ...conv, messages: [message], updatedAt: new Date() } 
            : conv
        )
      );
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  // Disconnect socket
  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  };

  // Join a chat room
  const joinChatRoom = (chatId) => {
    if (socketRef.current && chatId && isConnected) {
      socketRef.current.emit("joinChat", chatId, (response) => {
        if (response?.error) {
          console.error("Failed to join chat:", response.error);
        } else {
          console.log("Successfully joined chat:", chatId);
        }
      });
    }
  };

  // Send message via socket
  const sendMessageSocket = (chatId, message) => {
    if (socketRef.current && chatId) {
      socketRef.current.emit("sendMessageToRoom", { chatId, message });
    }
  };

  // Select a conversation and load messages
  const openChat = (chatId) => {
    setActiveChat(chatId);
    if (chatId && socketRef.current && isConnected) {
      joinChatRoom(chatId);
    }
  };

  // Add a new message
  const addMessage = (message) => {
    setMessages((prev) => {
      // Prevent duplicate messages
      const exists = prev.some(
        (msg) => msg._id === message._id || 
        (msg.sentAt === message.sentAt && msg.content === message.content && msg.sender === message.sender)
      );
      if (!exists) {
        return [...prev, message];
      }
      return prev;
    });
  };

  // Clear all chat state (e.g. on logout)
  const resetChat = () => {
    setConversations([]);
    setActiveChat(null);
    setMessages([]);
    disconnectSocket();
  };

  // Initialize socket when component mounts or token changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !socketRef.current) {
      initializeSocket();
    } else if (!token && socketRef.current) {
      // Token was removed (logout), disconnect socket
      disconnectSocket();
      resetChat();
    }

    return () => {
      disconnectSocket();
    };
  }, []); // Keep empty dependency array to avoid reconnecting on every token change

  // Listen for storage changes (logout in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (!e.newValue && socketRef.current) {
          // Token was removed, disconnect
          disconnectSocket();
          resetChat();
        } else if (e.newValue && !socketRef.current) {
          // Token was added, connect
          initializeSocket();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        setConversations,
        activeChat,
        setActiveChat,
        messages,
        setMessages,
        socket,
        isConnected,
        openChat,
        addMessage,
        resetChat,
        joinChatRoom,
        sendMessageSocket,
        initializeSocket,
        disconnectSocket,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
