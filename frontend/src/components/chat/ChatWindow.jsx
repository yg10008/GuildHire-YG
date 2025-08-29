import React, { useEffect, useRef, useState } from "react";
import { getChatById } from "../../services/chatService";
import MessageBubble from "./MessageBubble";
import { useChat } from "../../context/ChatContext";

const ChatWindow = ({ chatId }) => {
    const bottomRef = useRef();
    const { messages, setMessages, joinChatRoom } = useChat();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!chatId) {
            setMessages([]);
            setError(null);
            return;
        }
        
        const fetchMessages = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getChatById(chatId);
                setMessages(res.chat.messages || []);
                // Join the chat room for real-time updates
                joinChatRoom(chatId);
            } catch (err) {
                console.error("Failed to load messages", err);
                setError("Failed to load messages. Please try again.");
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchMessages();
    }, [chatId]); // Remove setMessages and joinChatRoom from dependencies to prevent infinite loop

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (!chatId) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
                <div className="text-center">
                    <div className="text-4xl mb-4">💬</div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No chat selected</h3>
                    <p className="text-gray-500">Choose a conversation to start chatting</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                    <p>Loading messages...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
                <div className="text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-medium text-red-700 mb-2">Error</h3>
                    <p className="text-red-500">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="flex-1 overflow-y-auto py-4" 
                 style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f8fafc' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40z'/%3E%3C/g%3E%3C/svg%3E")`,
                     backgroundSize: '20px 20px'
                 }}>
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                            <div className="text-4xl mb-4">🚀</div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Start Conversation</h3>
                            <p className="text-sm text-gray-500">Send a message to begin chatting!</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <MessageBubble 
                            key={msg._id || `${msg.sentAt}-${index}`} 
                            message={msg} 
                        />
                    ))
                )}
                <div ref={bottomRef}></div>
            </div>
        </div>
    );
};

export default ChatWindow;
