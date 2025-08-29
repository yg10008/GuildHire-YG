import React from "react";
import { useAuth } from "../../hooks/useAuth";

const MessageBubble = ({ message }) => {
    const { user } = useAuth();
    
    // Handle different sender ID formats (populated vs non-populated)
    const senderId = message.sender?._id || message.sender;
    
    // More robust comparison for MongoDB ObjectIds
    const isOwn = senderId && user._id && (
        senderId === user._id || 
        senderId.toString() === user._id.toString() ||
        senderId === user._id.toString() ||
        senderId.toString() === user._id
    );

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getSenderName = () => {
        if (isOwn) return "You";
        
        // Handle populated sender object
        if (typeof message.sender === 'object' && message.sender?.name) {
            return message.sender.name;
        }
        if (typeof message.sender === 'object' && message.sender?.email) {
            return message.sender.email.split('@')[0];
        }
        
        return "Unknown User";
    };

    console.log('Message:', message);
    console.log('Current user ID:', user._id);
    console.log('Sender ID:', senderId);
    console.log('Is own message:', isOwn);

    return (
        <div className={`flex w-full mb-3 px-4 ${isOwn ? "justify-end" : "justify-start"}`}>
            <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? "items-end" : "items-start"}`}>
                {/* Sender name for received messages */}
                {!isOwn && (
                    <div className="text-xs text-gray-500 mb-1 ml-3 font-medium">
                        {getSenderName()}
                    </div>
                )}
                
                {/* Message bubble */}
                <div className="relative">
                    <div
                        className={`px-4 py-3 rounded-2xl break-words shadow-sm relative ${
                            isOwn
                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                                : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                        }`}
                        style={{
                            boxShadow: isOwn 
                                ? '0 2px 8px rgba(59, 130, 246, 0.15)' 
                                : '0 2px 8px rgba(0, 0, 0, 0.08)'
                        }}
                    >
                        {/* Message content */}
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                        </div>
                        
                        {/* Timestamp */}
                        <div className={`text-xs mt-1 ${
                            isOwn ? "text-blue-100" : "text-gray-400"
                        } text-right`}>
                            {formatTime(message.sentAt)}
                        </div>
                    </div>
                    
                    {/* Message tail/pointer */}
                    <div
                        className={`absolute top-3 w-0 h-0 ${
                            isOwn
                                ? "right-0 border-l-8 border-l-blue-500 border-t-4 border-t-transparent border-b-4 border-b-transparent"
                                : "left-0 border-r-8 border-r-white border-t-4 border-t-transparent border-b-4 border-b-transparent"
                        }`}
                        style={{
                            transform: isOwn ? 'translateX(8px)' : 'translateX(-8px)',
                            filter: isOwn 
                                ? 'drop-shadow(2px 0 2px rgba(59, 130, 246, 0.1))' 
                                : 'drop-shadow(-2px 0 2px rgba(0, 0, 0, 0.05))'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
