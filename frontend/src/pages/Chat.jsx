import React, { useState, useEffect } from "react";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import ChatInput from "../components/chat/ChatInput";
import { useChat } from "../context/ChatContext";

const Chat = () => {
    const [chatId, setChatId] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const { initializeSocket, isConnected, setActiveChat } = useChat();

    const triggerRefresh = () => setRefresh((r) => !r);

    // Update the active chat in context when chatId changes
    useEffect(() => {
        setActiveChat(chatId);
    }, [chatId, setActiveChat]);

    // Initialize socket connection when component mounts
    useEffect(() => {
        initializeSocket();
    }, []);

    return (
        <div className="h-[calc(100vh-120px)] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {/* Connection status indicator */}
            {!isConnected && (
                <div className="bg-yellow-100 border-l-4 border-yellow-400 p-2 text-sm text-yellow-800">
                    <p className="text-center">⚠️ Real-time chat disconnected. Messages will still be delivered.</p>
                </div>
            )}
            
            <div className="flex h-full">
                <ChatList selectedChatId={chatId} setSelectedChatId={setChatId} />
                <div className="flex-1 flex flex-col">
                    <ChatWindow key={refresh} chatId={chatId} />
                    {chatId && <ChatInput chatId={chatId} onSend={triggerRefresh} />}
                </div>
            </div>
        </div>
    );
};

export default Chat;
