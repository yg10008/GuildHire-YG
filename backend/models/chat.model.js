import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, refPath: 'participants.model' },
      model: { type: String, enum: ['User', 'Recruiter'], required: true },
    },
  ],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'messages.senderModel' },
      senderModel: { type: String, enum: ['User', 'Recruiter'], required: true },
      content: { type: String, required: true },
      sentAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Chat', chatSchema);