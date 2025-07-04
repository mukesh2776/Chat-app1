require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000', // frontend port
    methods: ['GET', 'POST']
  }
});

const authRoutes = require('./routes/auth');
const Message = require('./models/message');

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Sample route
app.get('/', (req, res) => {
  res.send('API is running');
});

let activeUsers = [];

io.on('connection', async (socket) => {
  let currentUser = null;

  try {
    const oldMessages = await Message.find().exec();
    socket.emit('load messages', oldMessages);
  } catch (err) {
    console.error('Error loading messages:', err);
  }

  socket.on('chat message', async (msg) => {
    try {
      const newMessage = new Message(msg);
      await newMessage.save();
      io.emit('chat message', newMessage);

      currentUser = msg.user;
      if (!activeUsers.includes(currentUser)) {
        activeUsers.push(currentUser);
      }
      io.emit('active users', activeUsers);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('delete all', async () => {
    try {
      await Message.deleteMany({});
      io.emit('load messages', []); // broadcast cleared messages
    } catch (err) {
      console.error('Error deleting messages:', err);
    }
  });

  socket.on('disconnect', () => {
    if (currentUser) {
      activeUsers = activeUsers.filter(u => u !== currentUser);
      io.emit('active users', activeUsers);
    }
  });
});

// REST endpoint for deleting via HTTP (optional, since you have socket delete)
app.delete('/api/messages', async (req, res) => {
  try {
    await Message.deleteMany({});
    res.json({ message: 'All messages deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete messages' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
http.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
