import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react'; // make sure you have installed it: npm install emoji-picker-react

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [username, setUsername] = useState('');
  const [socket, setSocket] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // new state to toggle emoji picker

  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || 'Guest';
    setUsername(storedUsername);

   const newSocket = io('https://chat-app1-backend.onrender.com'); 
    setSocket(newSocket);

    newSocket.emit('user connected', storedUsername); // add this to notify backend who connected

    newSocket.on('load messages', (oldMessages) => {
      setMessages(oldMessages);
    });

    newSocket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on('active users', (users) => {
      setActiveUsers(users);
    });

    return () => newSocket.disconnect();
  }, []);

  const sendMessage = () => {
    if (text.trim() !== '' && socket) {
      socket.emit('chat message', { user: username, text });
      setText('');
      setShowEmojiPicker(false); // close emoji picker after sending
    }
  };

  const deleteAllMessages = () => {
    if (socket) {
      socket.emit('delete all');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Welcome, {username}</h2>
        <button className="btn btn-danger me-2" onClick={deleteAllMessages}>Delete All Messages</button>
        <button className="btn btn-secondary"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = '/login';
          }}
        >Logout</button>
      </div>

      <div className="chat-body">
        <div className="users-list">
          <h5>Active Users</h5>
          <ul>
            {activeUsers.map((user, idx) => (
              <li key={idx}>{user}</li>
            ))}
          </ul>
        </div>

        <div className="messages-area">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message-bubble ${msg.user === username ? 'my-message' : 'other-message'}`}
            >
              <b>{msg.user}:</b> {msg.text}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-input">
        {showEmojiPicker && (
          <EmojiPicker 
            onEmojiClick={(e) => setText(prev => prev + e.emoji)}
          />
        )}

        {showEmojiPicker ? (
          <button onClick={() => setShowEmojiPicker(false)} className="emoji-btn">❌</button>
        ) : (
          <button onClick={() => setShowEmojiPicker(true)} className="emoji-btn">😀</button>
        )}

        <input
          className="form-control"
          style={{ width: "60%" }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />

        <button className="btn btn-primary" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
