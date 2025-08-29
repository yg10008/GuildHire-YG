import api from "./api"

// Create a new chat between two participants
export const createChat = async (participants) => {
    // participants: [{ user: userId, model: 'User'|'Recruiter' }, ...]
    const res = await api.post("/chats", { participants });
    return res.data;
};

// Get all chats for the current user/recruiter
export const getChats = async () => {
    const res = await api.get("/chats");
    return res.data;
};

// Get a specific chat by ID
export const getChatById = async (chatId) => {
    const res = await api.get(`/chats/${chatId}`);
    return res.data;
};

// Send a message in a chat
export const sendMessage = async (chatId, content) => {
    const res = await api.post(`/chats/${chatId}/message`, { content });
    return res.data;
};

export default {
    createChat,
    getChats,
    getChatById,
    sendMessage,
};
