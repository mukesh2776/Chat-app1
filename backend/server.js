require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const http = require('http').Server(app);


const allowedOrigins = [
  'http://localhost:3000',
  'https://chat-app1-owdn.onrender.com'
];


app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const io = require('socket.io')(http, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const authRoutes = require('./routes/auth');
const Message = require('./models/message');

// Middlewares
app.use(express.json());
app.use('/api', authRoutes);


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));


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
