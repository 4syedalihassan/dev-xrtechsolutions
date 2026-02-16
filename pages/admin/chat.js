// =====================================================
// ADMIN CHAT SUPPORT PAGE
// View and respond to customer chat messages
// =====================================================

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

function AdminChatSupport() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const token = session?.access_token;

  // Client-side auth check
  useEffect(() => {
    if (!authLoading && (!user || !['admin', 'super_admin'].includes(user.role))) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && ['admin', 'super_admin'].includes(user.role)) {
      loadConversations();
      loadChatSettings();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show loading state until auth check completes
  if (authLoading || !user || !['admin', 'super_admin'].includes(user.role)) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f7fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #00BCD4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#666' }}>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const loadChatSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setChatEnabled(data.chat_enabled !== false);
      }
    } catch (error) {
      console.error('Failed to load chat settings:', error);
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);

      // Fetch conversations from database - Add Auth Token
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch('/api/admin/chat/conversations', { headers });
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations || []);
        if (data.message) {
          console.info(data.message);
        }
      } else {
        console.error('Failed to load conversations:', data.error);
        setConversations([]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`/api/admin/chat/messages?conversation_id=${conversationId}`, { headers });
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages || []);
      } else {
        console.error('Failed to load messages:', data.error);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);

    // Mark as read
    setConversations(prev => prev.map(c =>
      c.id === conversation.id ? { ...c, unread_count: 0 } : c
    ));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: Date.now(),
      sender: 'admin',
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    // Add message locally
    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update conversation's last message
    setConversations(prev => prev.map(c =>
      c.id === selectedConversation.id
        ? { ...c, last_message: newMessage, updated_at: new Date().toISOString() }
        : c
    ));

    // Try to send to API
    try {
      if (!token) throw new Error('No auth token');

      await fetch('/api/admin/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation_id: selectedConversation.id,
          text: newMessage
        })
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleResolveConversation = async (conversationId) => {
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, status: 'resolved' } : c
    ));

    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => ({ ...prev, status: 'resolved' }));
    }

    try {
      if (!token) throw new Error('No auth token');

      await fetch(`/api/admin/chat/conversations/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'resolved' })
      });
    } catch (error) {
      console.error('Failed to resolve conversation:', error);
    }
  };

  const toggleChatEnabled = async () => {
    const newValue = !chatEnabled;
    setChatEnabled(newValue);

    try {
      if (!token) {
        console.error('No auth token found, cannot update settings');
        return;
      }

      await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chat_enabled: newValue })
      });
    } catch (error) {
      console.error('Failed to update chat setting:', error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const stats = {
    total: conversations.length,
    active: conversations.filter(c => c.status === 'active').length,
    unread: conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)
  };

  return (
    <AdminLayout currentPage="Chat Support">
      <div className="chat-container">
        {/* Header with Stats */}
        <div className="chat-header">
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Chats</span>
            </div>
            <div className="stat-item">
              <span className="stat-value active">{stats.active}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-value unread">{stats.unread}</span>
              <span className="stat-label">Unread</span>
            </div>
          </div>
          <div className="chat-toggle">
            <span>Chat Widget:</span>
            <button
              className={`toggle-btn ${chatEnabled ? 'enabled' : 'disabled'}`}
              onClick={toggleChatEnabled}
            >
              {chatEnabled ? '✓ Enabled' : '✕ Disabled'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading conversations...</p>
          </div>
        ) : (
          <div className={`chat-layout ${selectedConversation ? 'conversation-selected' : ''}`}>
            {/* Conversations List */}
            <div className="conversations-panel">
              <div className="panel-header">
                <h3>Conversations</h3>
              </div>
              <div className="conversations-list">
                {conversations.length === 0 ? (
                  <div className="empty-conversations">
                    <p>💬 No conversations yet</p>
                  </div>
                ) : (
                  conversations.map(conversation => (
                    <div
                      key={conversation.id}
                      className={`conversation-item ${selectedConversation?.id === conversation.id ? 'selected' : ''} ${conversation.unread_count > 0 ? 'unread' : ''}`}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="conversation-avatar">
                        {conversation.customer_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="conversation-info">
                        <div className="conversation-header">
                          <span className="customer-name">{conversation.customer_name}</span>
                          <span className="conversation-time">{formatTime(conversation.updated_at)}</span>
                        </div>
                        <div className="conversation-preview">
                          <p>{conversation.last_message}</p>
                          {conversation.unread_count > 0 && (
                            <span className="unread-badge">{conversation.unread_count}</span>
                          )}
                        </div>
                        <span className={`status-tag ${conversation.status}`}>
                          {conversation.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messages Panel */}
            <div className="messages-panel">
              {selectedConversation ? (
                <>
                  <div className="messages-header">
                    <div className="customer-details">
                      <div className="customer-avatar">
                        {selectedConversation.customer_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3>{selectedConversation.customer_name}</h3>
                        <span>{selectedConversation.customer_email}</span>
                      </div>
                    </div>
                    <div className="header-actions">
                      {selectedConversation.status === 'active' && (
                        <button
                          className="resolve-btn"
                          onClick={() => handleResolveConversation(selectedConversation.id)}
                        >
                          ✓ Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="messages-list">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`message ${message.sender}`}
                      >
                        <div className="message-content">
                          <p>{message.text}</p>
                          <span className="message-time">{formatTime(message.timestamp)}</span>
                        </div>
                        <span className="sender-label">
                          {message.sender === 'customer' ? '👤 Customer' :
                            message.sender === 'bot' ? '🤖 Bot' : '👨‍💼 Admin'}
                        </span>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="message-input-container">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your response..."
                      className="message-input"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="send-btn"
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-selection">
                  <div className="no-selection-content">
                    <span className="no-selection-icon">💬</span>
                    <h3>Select a conversation</h3>
                    <p>Choose a conversation from the left to view messages and respond</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .chat-container {
          height: calc(100vh - 180px);
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: white;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .stats-row {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-text-primary, #333);
        }

        .stat-value.active { color: #4CAF50; }
        .stat-value.unread { color: #FF9800; }

        .stat-label {
          font-size: 12px;
          color: var(--color-text-secondary, #666);
        }

        .chat-toggle {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .chat-toggle span {
          font-weight: 500;
          color: var(--color-text-secondary, #666);
        }

        .toggle-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-btn.enabled {
          background: #E8F5E9;
          color: #4CAF50;
        }

        .toggle-btn.disabled {
          background: #FFEBEE;
          color: #F44336;
        }

        .loading-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 12px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f0f0f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .chat-layout {
          flex: 1;
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 1.5rem;
          min-height: 0;
        }

        .conversations-panel {
          background: white;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .panel-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--color-border-light, #f0f0f0);
        }

        .panel-header h3 {
          margin: 0;
          font-size: 16px;
          color: var(--color-text-primary, #333);
        }

        .conversations-list {
          flex: 1;
          overflow-y: auto;
        }

        .empty-conversations {
          padding: 3rem;
          text-align: center;
          color: var(--color-text-secondary, #666);
        }

        .conversation-item {
          display: flex;
          gap: 1rem;
          padding: 1rem 1.5rem;
          cursor: pointer;
          border-bottom: 1px solid var(--color-border-light, #f0f0f0);
          transition: background 0.2s;
        }

        .conversation-item:hover {
          background: var(--color-bg-secondary, #f8f9fa);
        }

        .conversation-item.selected {
          background: #EEF2FF;
          border-left: 3px solid var(--color-primary, #667eea);
        }

        .conversation-item.unread {
          background: #FFF8E1;
        }

        .conversation-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary, #667eea) 0%, #5a67d8 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 18px;
          flex-shrink: 0;
        }

        .conversation-info {
          flex: 1;
          min-width: 0;
        }

        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .customer-name {
          font-weight: 600;
          color: var(--color-text-primary, #333);
        }

        .conversation-time {
          font-size: 12px;
          color: var(--color-text-tertiary, #999);
        }

        .conversation-preview {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .conversation-preview p {
          margin: 0;
          font-size: 13px;
          color: var(--color-text-secondary, #666);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .unread-badge {
          background: #FF9800;
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 0.125rem 0.5rem;
          border-radius: 10px;
        }

        .status-tag {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
          margin-top: 0.25rem;
        }

        .status-tag.active {
          background: #E8F5E9;
          color: #4CAF50;
        }

        .status-tag.resolved {
          background: #E3F2FD;
          color: #2196F3;
        }

        .messages-panel {
          background: white;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .messages-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .customer-details {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .customer-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #5a67d8 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 18px;
        }

        .customer-details h3 {
          margin: 0;
          font-size: 16px;
          color: var(--color-text-primary, #333);
        }

        .customer-details span {
          font-size: 13px;
          color: var(--color-text-secondary, #666);
        }

        .resolve-btn {
          padding: 0.5rem 1rem;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .resolve-btn:hover {
          background: #43A047;
        }

        .messages-list {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message {
          max-width: 70%;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .message.customer {
          align-self: flex-start;
        }

        .message.admin,
        .message.bot {
          align-self: flex-end;
        }

        .message-content {
          padding: 0.75rem 1rem;
          border-radius: 12px;
        }

        .message.customer .message-content {
          background: var(--color-bg-secondary, #f0f0f0);
          border-bottom-left-radius: 4px;
        }

        .message.admin .message-content {
          background: linear-gradient(135deg, #667eea 0%, #5a67d8 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message.bot .message-content {
          background: #E3F2FD;
          border-bottom-right-radius: 4px;
        }

        .message-content p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.7;
        }

        .sender-label {
          font-size: 11px;
          color: var(--color-text-tertiary, #999);
        }

        .message.admin .sender-label,
        .message.bot .sender-label {
          text-align: right;
        }

        .message-input-container {
          display: flex;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid #f0f0f0;
        }

        .message-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .message-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .send-btn {
          padding: 0.75rem 1.5rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          background: #5a67d8;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .no-selection {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .no-selection-content {
          text-align: center;
          color: var(--color-text-secondary, #666);
        }

        .no-selection-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 1rem;
        }

        .no-selection-content h3 {
          margin: 0 0 0.5rem 0;
          color: var(--color-text-primary, #333);
        }

        .no-selection-content p {
          margin: 0;
          font-size: 14px;
          color: var(--color-text-secondary, #666);
        }

        @media (max-width: 900px) {
          .chat-layout {
            grid-template-columns: 1fr;
          }

          .chat-layout .conversations-panel {
            display: flex;
          }

          .chat-layout .messages-panel {
            display: none;
          }

          .chat-layout.conversation-selected .conversations-panel {
            display: none;
          }

          .chat-layout.conversation-selected .messages-panel {
            display: flex;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

export default AdminChatSupport;
