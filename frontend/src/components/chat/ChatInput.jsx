import React, { useState } from "react";
import { sendMessage } from "../../services/chatService";
import { useChat } from "../../context/ChatContext";

const ChatInput = ({ chatId, onSend }) => {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const { sendMessageSocket, addMessage } = useChat();

    const handleSend = async () => {
        const trimmedText = text.trim();
        if (!trimmedText || sending) return;
        
        setSending(true);
        try {
            // Send via REST API for persistence
            const response = await sendMessage(chatId, trimmedText);
            const newMessage = response.newMessage;
            
            // Add message to local state immediately
            addMessage(newMessage);
            
            // Send via socket for real-time delivery to other participants
            sendMessageSocket(chatId, newMessage);
            
            // Clear input and trigger refresh
            setText("");
            if (onSend) onSend();
            
        } catch (err) {
            console.error("Send failed", err);
            // Show error to user
            alert("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t bg-white px-4 py-3">
            <div className="flex items-end gap-3">
                {/* Message input */}
                <div className="flex-1 relative">
                    <textarea
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-5 bg-gray-50 transition-all duration-200"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        rows={1}
                        style={{ 
                            minHeight: '44px', 
                            maxHeight: '120px',
                            height: 'auto'
                        }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        disabled={sending}
                    />
                    
                    {/* Emoji button */}
                    <button 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-lg"
                        type="button"
                    >
                        😊
                    </button>
                </div>

                {/* Send button */}
                <button
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                        text.trim() && !sending
                            ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    {sending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                        <svg 
                            className="w-5 h-5" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                        >
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ChatInput;
