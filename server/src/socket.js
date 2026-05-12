const jwt = require('jsonwebtoken');
const Message = require('./models/Message');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Track online users: userId -> Set of socketIds (to handle multiple tabs)
const onlineUsers = new Map();

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('authenticate', (token) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;
        socket.userId = userId;
        
        console.log(`User authenticated: ${userId} with socket ID: ${socket.id}`);
        
        // Add to online users
        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);
        
        // Join a user-specific room
        socket.join(userId);

        // Broadcast updated online status to everyone
        io.emit('userStatusChanged', {
          userId: userId,
          status: 'online',
          onlineUserIds: Array.from(onlineUsers.keys())
        });

      } catch (error) {
        console.error('Authentication error:', error);
        socket.disconnect();
      }
    });

    socket.on('getChatHistory', async ({ recipientId }) => {
      if (!socket.userId) return;
      try {
        const messages = await Message.find({
          $or: [
            { senderId: socket.userId, recipientId },
            { senderId: recipientId, recipientId: socket.userId },
          ],
        }).sort('timestamp');
        
        socket.emit('loadMessages', messages);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    });

    socket.on('chatMessage', async ({ recipientId, message }) => {
      if (!socket.userId || !recipientId) return;

      try {
        const msg = new Message({
          senderId: socket.userId,
          recipientId,
          message,
          isRead: false
        });
        await msg.save();

        const messageData = {
          _id: msg._id,
          senderId: socket.userId,
          recipientId,
          message,
          isRead: false,
          timestamp: msg.timestamp,
        };

        // Emit to sender and recipient
        io.to(socket.userId).emit('chatMessage', messageData);
        io.to(recipientId).emit('chatMessage', messageData);
        
        // Also emit a "newNotification" if the user is online but maybe not on the chat tab
        io.to(recipientId).emit('newNotification', messageData);

      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('markAsRead', async ({ senderId }) => {
        if (!socket.userId) return;
        try {
            // Update all unread messages from this sender to the current user
            await Message.updateMany(
                { senderId: senderId, recipientId: socket.userId, isRead: false },
                { $set: { isRead: true } }
            );
            
            // Notify the original sender that their messages were read
            io.to(senderId).emit('messagesMarkedAsRead', {
                readerId: socket.userId,
                senderId: senderId
            });
            
            // Trigger a re-fetch of the chat list for the reader to clear badge
            io.to(socket.userId).emit('updateUnreadCount', { senderId });

        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    });

    socket.on('disconnect', () => {
      if (socket.userId && onlineUsers.has(socket.userId)) {
        const userSockets = onlineUsers.get(socket.userId);
        userSockets.delete(socket.id);
        
        if (userSockets.size === 0) {
          onlineUsers.delete(socket.userId);
          // Broadcast that the user is truly offline
          io.emit('userStatusChanged', {
            userId: socket.userId,
            status: 'offline',
            onlineUserIds: Array.from(onlineUsers.keys())
          });
        }
      }
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = initializeSocket;