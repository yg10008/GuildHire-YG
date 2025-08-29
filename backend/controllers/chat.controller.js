import Chat from '../models/chat.model.js';
import dotenv from 'dotenv';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

dotenv.config();

export const createChat = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { participants } = req.body;
  const requester = req.user || req.recruiter;
  const requesterModel = req.user ? 'User' : 'Recruiter';

    // Ensure all participants have valid user IDs
  if (
    !Array.isArray(participants) ||
    participants.length !== 2 ||
    participants.some(
      p =>
        !p.user ||
        !mongoose.Types.ObjectId.isValid(p.user) ||
        !['User', 'Recruiter'].includes(p.model)
    )
  ) {
    return res.status(400).json({ message: 'Participants must be two valid objects with user (ObjectId) and model (User/Recruiter)' });
  }

  try {
    const isParticipant = participants.some(
      p => p.model === requesterModel && p.user.toString() === requester._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'You must be one of the participants to create a chat' });
    }

    // Check for existing chat between these two participants (regardless of order)
    const existingChat = await Chat.findOne({
      $and: [
        { 'participants.user': { $all: [participants[0].user, participants[1].user] } },
        { 'participants.model': { $all: [participants[0].model, participants[1].model] } },
      ],
    });

    if (existingChat) {
      // Populate the existing chat and return it
      const populatedParticipants = await Promise.all(
        existingChat.participants.map(async (participant) => {
          let populatedUser;
          if (participant.model === 'User') {
            const User = mongoose.model('User');
            populatedUser = await User.findById(participant.user).select('name email');
          } else if (participant.model === 'Recruiter') {
            const Recruiter = mongoose.model('Recruiter');
            populatedUser = await Recruiter.findById(participant.user).select('name email companyName');
          }
          return {
            ...participant.toObject(),
            user: populatedUser
          };
        })
      );

      const populatedExistingChat = {
        ...existingChat.toObject(),
        participants: populatedParticipants
      };

      return res.status(200).json({ message: 'Chat already exists', chat: populatedExistingChat });
    }

    const newChat = new Chat({ participants });
    await newChat.save();

    // Populate the new chat
    const populatedParticipants = await Promise.all(
      newChat.participants.map(async (participant) => {
        let populatedUser;
        if (participant.model === 'User') {
          const User = mongoose.model('User');
          populatedUser = await User.findById(participant.user).select('name email');
        } else if (participant.model === 'Recruiter') {
          const Recruiter = mongoose.model('Recruiter');
          populatedUser = await Recruiter.findById(participant.user).select('name email companyName');
        }
        return {
          ...participant.toObject(),
          user: populatedUser
        };
      })
    );

    const populatedNewChat = {
      ...newChat.toObject(),
      participants: populatedParticipants
    };

    res.status(201).json({ message: 'Chat created successfully', chat: populatedNewChat });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Failed to create chat', error: error.message });
  }
};

export const getChats = async (req, res) => {
  try {
    const requester = req.user || req.recruiter;
    const requesterModel = req.user ? 'User' : 'Recruiter';

    const chats = await Chat.find({
      'participants': {
        $elemMatch: { user: requester._id, model: requesterModel },
      },
    })
      .sort({ updatedAt: -1 });

    // Manually populate the participants based on their model
    const populatedChats = await Promise.all(
      chats.map(async (chat) => {
        const populatedParticipants = await Promise.all(
          chat.participants.map(async (participant) => {
            let populatedUser;
            if (participant.model === 'User') {
              const User = mongoose.model('User');
              populatedUser = await User.findById(participant.user).select('name email');
            } else if (participant.model === 'Recruiter') {
              const Recruiter = mongoose.model('Recruiter');
              populatedUser = await Recruiter.findById(participant.user).select('name email companyName');
            }
            return {
              ...participant.toObject(),
              user: populatedUser
            };
          })
        );
        return {
          ...chat.toObject(),
          participants: populatedParticipants
        };
      })
    );

    res.status(200).json({ message: 'Chats retrieved successfully', chats: populatedChats });
  } catch (error) {
    console.error('Error retrieving chats:', error);
    res.status(500).json({ message: 'Failed to retrieve chats', error: error.message });
  }
};

export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const requester = req.user || req.recruiter;
    const requesterModel = req.user ? 'User' : 'Recruiter';

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(
      p =>
        p.model === requesterModel &&
        p.user &&
        requester &&
        p.user.toString() === requester._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Unauthorized to access this chat' });
    }

    // Manually populate participants and messages
    const populatedParticipants = await Promise.all(
      chat.participants.map(async (participant) => {
        let populatedUser;
        if (participant.model === 'User') {
          const User = mongoose.model('User');
          populatedUser = await User.findById(participant.user).select('name email');
        } else if (participant.model === 'Recruiter') {
          const Recruiter = mongoose.model('Recruiter');
          populatedUser = await Recruiter.findById(participant.user).select('name email companyName');
        }
        return {
          ...participant.toObject(),
          user: populatedUser
        };
      })
    );

    const populatedMessages = await Promise.all(
      chat.messages.map(async (message) => {
        let populatedSender;
        if (message.senderModel === 'User') {
          const User = mongoose.model('User');
          populatedSender = await User.findById(message.sender).select('name email');
        } else if (message.senderModel === 'Recruiter') {
          const Recruiter = mongoose.model('Recruiter');
          populatedSender = await Recruiter.findById(message.sender).select('name email companyName');
        }
        return {
          ...message.toObject(),
          sender: populatedSender
        };
      })
    );

    const populatedChat = {
      ...chat.toObject(),
      participants: populatedParticipants,
      messages: populatedMessages
    };

    res.status(200).json({ message: 'Chat retrieved successfully', chat: populatedChat });
  } catch (error) {
    console.error('Error retrieving chat:', error);
    res.status(500).json({ message: 'Failed to retrieve chat', error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { chatId } = req.params;
  const { content } = req.body;
  const sender = req.user || req.recruiter;
  const senderModel = req.user ? 'User' : 'Recruiter';

  console.log('req.user:', req.user ? { _id: req.user._id, email: req.user.email } : null);
  console.log('req.recruiter:', req.recruiter ? { _id: req.recruiter._id, email: req.recruiter.email } : null);
  console.log('sender:', sender ? { _id: sender._id, email: sender.email } : null);
  console.log('senderModel:', senderModel);
  console.log('chatId:', chatId);
  console.log('content:', content);

  if (!sender || !sender._id) {
    console.log('No valid sender found');
    return res.status(401).json({ message: 'Unauthorized: No valid sender found' });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      console.log('Chat not found:', chatId);
      return res.status(404).json({ message: 'Chat not found' });
    }

    console.log('Chat participants:', chat.participants.map(p => ({ user: p.user.toString(), model: p.model })));
    const isParticipant = chat.participants.some(
      p => p.model === senderModel && p.user.toString() === sender._id.toString()
    );
    if (!isParticipant) {
      console.log('Unauthorized: Sender not a participant', { senderId: sender._id, senderModel, participants: chat.participants });
      return res.status(403).json({ message: 'Unauthorized to send a message in this chat' });
    }

    const message = {
      sender: sender._id,
      senderModel,
      content,
      sentAt: new Date(),
    };
    console.log('Created message:', message);

    chat.messages.push(message);
    chat.updatedAt = new Date();
    await chat.save();

    const populateQuery = senderModel === 'User'
      ? { path: 'messages.sender', select: 'name email', model: 'User' }
      : { path: 'messages.sender', select: 'name email companyName', model: 'Recruiter' };

    await chat.populate([populateQuery]);

    const io = req.app.locals.io;
    if (io) {
      // Emit to all participants in the chat room except the sender
      io.to(chatId).except(sender._id.toString()).emit('receiveMessage', {
        chatId,
        message: chat.messages[chat.messages.length - 1],
      });
      console.log(`Emitted message to chat ${chatId}`);
    }

    res.status(200).json({ 
      message: 'Message sent successfully', 
      chat,
      newMessage: chat.messages[chat.messages.length - 1],
    });
  } catch (error) {
    console.error('Error sending message:', error.message);
    res.status(500).json({ message: 'Failed to send message from chat', error: error.message });
  }
};