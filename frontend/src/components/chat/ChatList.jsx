import React, { useEffect, useState } from "react";
import { getChats, createChat } from "../../services/chatService";
import { getMyApplications } from "../../services/applicationService";
import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../context/ChatContext";

const ChatList = ({ selectedChatId, setSelectedChatId }) => {
    const [loading, setLoading] = useState(true);
    const [appliedRecruiters, setAppliedRecruiters] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const { conversations, setConversations } = useChat();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                setError(null);
                const res = await getChats();
                setConversations(res.chats || []);
            } catch (err) {
                console.error("Failed to load chats", err);
                setError("Failed to load chats. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchChats();
    }, []); // Remove setConversations from dependencies

    // Fetch recruiters from applied jobs (for job seekers)
    useEffect(() => {
        const fetchRecruiters = async () => {
            if (user && user.role === "user") {
                try {
                    const res = await getMyApplications(1, 100);
                    console.log("Applications response:", res);
                    
                    const recruiters = [];
                    const seen = new Set();
                    (res.applications || []).forEach((app) => {
                        if (app.job && app.job.recruiterId && !seen.has(app.job.recruiterId._id)) {
                            recruiters.push({
                                id: app.job.recruiterId._id,
                                name: app.job.recruiterId.name,
                                companyName: app.job.recruiterId.companyName,
                                jobTitle: app.job.title,
                            });
                            seen.add(app.job.recruiterId._id);
                        }
                    });
                    setAppliedRecruiters(recruiters);
                } catch (err) {
                    console.error("Failed to fetch recruiters", err);
                }
            }
        };
        fetchRecruiters();
    }, [user]);

    // Helper to get the other participant
    const getOtherParticipant = (chat) => {
        if (!user) return null;
        return chat.participants.find((p) => p.user && p.user._id !== user._id)?.user;
    };

    const handleStartChat = async (recruiterId) => {
        try {
            // Check if chat already exists
            const existingChat = conversations.find(chat => {
                const otherParticipant = getOtherParticipant(chat);
                return otherParticipant?._id === recruiterId;
            });

            if (existingChat) {
                setSelectedChatId(existingChat._id);
                return;
            }

            const myId = user._id;
            const myModel = user.role === "user" ? "User" : "Recruiter";
            const otherModel = myModel === "User" ? "Recruiter" : "User";
            const participants = [
                { user: myId, model: myModel },
                { user: recruiterId, model: otherModel },
            ];
            
            const res = await createChat(participants);
            setConversations((prev) => [res.chat, ...prev]);
            setSelectedChatId(res.chat._id);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to start chat";
            console.error("Start chat error:", errorMessage);
            alert(errorMessage);
        }
    };

    const getLastMessagePreview = (chat) => {
        if (!chat.messages || chat.messages.length === 0) {
            return "No messages yet";
        }
        const lastMessage = chat.messages[chat.messages.length - 1];
        return lastMessage.content.length > 50 
            ? lastMessage.content.substring(0, 50) + "..."
            : lastMessage.content;
    };

    const formatLastMessageTime = (chat) => {
        if (!chat.messages || chat.messages.length === 0) {
            return "";
        }
        const lastMessage = chat.messages[chat.messages.length - 1];
        const date = new Date(lastMessage.sentAt);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return "now"; // less than 1 minute
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`; // less than 1 hour
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`; // less than 1 day
        return date.toLocaleDateString();
    };

    if (error) {
        return (
            <div className="w-1/3 bg-gray-50 border-r p-4">
                <div className="text-center text-red-500">
                    <p>{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-2 text-indigo-600 hover:text-indigo-800"
                    >
                        Reload
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="mr-2">💬</span>
                    Messages
                </h2>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
                {/* Start new chat section for users */}
                {user && user.role === "user" && appliedRecruiters.length > 0 && (
                    <div className="p-4 border-b bg-blue-50">
                        <div className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                            <span className="mr-2">🚀</span>
                            Start New Chat
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {appliedRecruiters.map((recruiter) => (
                                <button
                                    key={recruiter.id}
                                    className="w-full text-left px-3 py-3 bg-white hover:bg-blue-100 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                                    onClick={() => handleStartChat(recruiter.id)}
                                >
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                            {recruiter.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-900 truncate">{recruiter.name}</div>
                                            <div className="text-xs text-gray-600 truncate">
                                                {recruiter.companyName && `${recruiter.companyName} • `}{recruiter.jobTitle}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat list */}
                <div className="p-3">
                    {loading ? (
                        <div className="text-gray-500 text-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm">Loading chats...</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-gray-500 text-center py-12">
                            <div className="text-6xl mb-4 opacity-50">💬</div>
                            <h3 className="font-medium text-gray-700 mb-2">No conversations yet</h3>
                            {user?.role === "user" && (
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Apply to jobs and start chatting<br />with recruiters!
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {conversations.map((chat) => {
                                const otherUser = getOtherParticipant(chat);
                                const isSelected = chat._id === selectedChatId;
                                
                                return (
                                    <div
                                        key={chat._id}
                                        className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                            isSelected
                                                ? "bg-blue-50 border-l-4 border-blue-500 shadow-sm"
                                                : "hover:bg-gray-50"
                                        }`}
                                        onClick={() => setSelectedChatId(chat._id)}
                                    >
                                        <div className="flex items-center">
                                            {/* Avatar */}
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 ${
                                                isSelected 
                                                    ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                                                    : "bg-gradient-to-br from-gray-400 to-gray-500"
                                            }`}>
                                                {(otherUser?.name || otherUser?.email || "U").charAt(0).toUpperCase()}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="font-semibold text-gray-900 truncate">
                                                        {otherUser?.name || otherUser?.email || "Unknown User"}
                                                    </div>
                                                    <div className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                                        {formatLastMessageTime(chat)}
                                                    </div>
                                                </div>
                                                
                                                {otherUser?.companyName && (
                                                    <div className="text-xs text-blue-600 font-medium mb-1 truncate">
                                                        {otherUser.companyName}
                                                    </div>
                                                )}
                                                
                                                <div className="text-sm text-gray-600 truncate">
                                                    {getLastMessagePreview(chat)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatList;