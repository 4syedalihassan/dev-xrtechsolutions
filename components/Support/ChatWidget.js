import { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUser, FaComments, FaCircle } from 'react-icons/fa';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! This is XR Tech Solutions's AI Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Hidden by default until settings load
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkChatStatus();
  }, []);

  const checkChatStatus = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      // Only show if explicitly enabled or not set (default true)
      if (data.chat_enabled !== false) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Failed to check chat status:', error);
      // Fallback to visible on error to ensure access
      setIsVisible(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  if (!isVisible) return null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: "I'm a demo bot. In the production version, I will be connected to the backend API to answer your questions about our products, shipping, and returns.",
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="chat-widget">
      {/* Search Button (Closed State) */}
      {!isOpen && (
        <button
          className="chat-toggle-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <FaComments />
        </button>
      )}

      {/* Chat Window (Open State) */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="header-info">
            <div className="avatar-container">
              <FaRobot />
              <span className="status-indicator"><FaCircle /></span>
            </div>
            <div>
              <h3>AI Assistant</h3>
              <span className="status-text">Online</span>
            </div>
          </div>
          <button
            className="close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <FaTimes />
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              {msg.sender === 'bot' && (
                <div className="message-avatar bot">
                  <FaRobot />
                </div>
              )}
              <div className="message-content">
                {msg.text}
              </div>
              {msg.sender === 'user' && (
                <div className="message-avatar user">
                  <FaUser />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="message bot typing">
              <div className="message-avatar bot">
                <FaRobot />
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!inputValue.trim()}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>

      <style jsx>{`
        .chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          font-family: 'Inter', sans-serif;
        }

        .chat-toggle-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--color-primary);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .chat-toggle-btn:hover {
          background: var(--color-secondary);
        }

        .chat-window {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 350px;
          height: 500px;
          background: var(--bg-primary);
          border-radius: 16px;
          box-shadow: 0 5px 40px rgba(0,0,0,0.16);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px) scale(0.95);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid var(--border-primary);
        }

        .chat-window.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }

        .chat-header {
          background: var(--bg-tertiary);
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-container {
          position: relative;
          width: 40px;
          height: 40px;
          background: var(--bg-secondary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          border: 1px solid var(--border-primary);
        }

        .status-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          color: var(--color-success);
          font-size: 10px;
          background: var(--bg-primary);
          border-radius: 50%;
          width: 12px;
          height: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-info h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .status-text {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 16px;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: var(--bg-secondary);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          max-width: 85%;
        }

        .message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .message-avatar.bot {
          background: var(--color-primary);
          color: white;
        }

        .message-avatar.user {
          background: var(--text-secondary);
          color: white;
        }

        .message-content {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
          position: relative;
        }

        .message.bot .message-content {
          background: var(--bg-primary);
          color: var(--text-primary);
          border-bottom-left-radius: 4px;
          border: 1px solid var(--border-subtle);
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .message.user .message-content {
          background: var(--color-primary);
          color: white;
          border-bottom-right-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .typing-indicator {
          background: var(--bg-primary);
          padding: 12px 16px;
          border-radius: 12px;
          border-bottom-left-radius: 4px;
          display: flex;
          gap: 4px;
          border: 1px solid var(--border-subtle);
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          background: var(--text-tertiary);
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out both;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .chat-input-form {
          padding: 16px;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-subtle);
          display: flex;
          gap: 10px;
        }

        .chat-input {
          flex: 1;
          padding: 10px 16px;
          border-radius: 20px;
          border: 1px solid var(--border-primary);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 14px;
          transition: all 0.2s;
        }

        .chat-input:focus {
          outline: none;
          border-color: var(--color-primary);
          background: var(--bg-primary);
        }

        .send-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: var(--color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          background: var(--color-secondary);
        }

        .send-btn:disabled {
          background: var(--bg-tertiary);
          color: var(--text-disabled);
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .chat-window {
            width: 100%;
            height: 100%;
            bottom: 0;
            right: 0;
            border-radius: 0;
          }

          .chat-toggle-btn {
            bottom: 16px;
            right: 16px;
          }
        }
      `}</style>
    </div>
  );
}
