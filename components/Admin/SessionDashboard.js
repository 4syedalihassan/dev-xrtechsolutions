import { useState, useEffect } from 'react';

export default function SessionDashboard() {
  const [sessions, setSessions] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [newSession, setNewSession] = useState({
    session_type_id: '',
    title: '',
    description: '',
    presenter_name: '',
    scheduled_start: '',
    duration_minutes: 60,
    max_participants: 50
  });
  const [loading, setLoading] = useState(false);

  // Fetch sessions and session types
  useEffect(() => {
    fetchSessions();
    fetchSessionTypes();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchSessionTypes = async () => {
    try {
      // This would need a separate API endpoint for session types
      const types = [
        { id: 1, name: 'tb_awareness', display_name: 'TB Awareness' },
        { id: 2, name: 'heart_health', display_name: 'Heart Health' },
        { id: 3, name: 'diabetes_sugar', display_name: 'Diabetes & Sugar Management' },
        { id: 4, name: 'breast_cancer', display_name: 'Breast Cancer Awareness' }
      ];
      setSessionTypes(types);
    } catch (error) {
      console.error('Error fetching session types:', error);
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSession),
      });

      if (response.ok) {
        await fetchSessions();
        setNewSession({
          session_type_id: '',
          title: '',
          description: '',
          presenter_name: '',
          scheduled_start: '',
          duration_minutes: 60,
          max_participants: 50
        });
        alert('Session created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Error creating session');
    } finally {
      setLoading(false);
    }
  };

  const controlSession = async (sessionId, action) => {
    try {
      const response = await fetch('/api/sessions/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          action: action
        }),
      });

      if (response.ok) {
        await fetchSessions();
        alert(`Session ${action} successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error controlling session:', error);
      alert('Error controlling session');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 1000
    }}>
      <h2>Healthcare Session Management</h2>

      {/* Create New Session Form */}
      <form onSubmit={createSession} style={{ marginBottom: '30px' }}>
        <h3>Create New Session</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Session Type:</label>
          <select
            value={newSession.session_type_id}
            onChange={(e) => setNewSession({...newSession, session_type_id: e.target.value})}
            required
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
          >
            <option value="">Select Type</option>
            {sessionTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.display_name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Title:</label>
          <input
            type="text"
            value={newSession.title}
            onChange={(e) => setNewSession({...newSession, title: e.target.value})}
            required
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Presenter:</label>
          <input
            type="text"
            value={newSession.presenter_name}
            onChange={(e) => setNewSession({...newSession, presenter_name: e.target.value})}
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Start Time:</label>
          <input
            type="datetime-local"
            value={newSession.scheduled_start}
            onChange={(e) => setNewSession({...newSession, scheduled_start: e.target.value})}
            required
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Duration (minutes):</label>
          <input
            type="number"
            value={newSession.duration_minutes}
            onChange={(e) => setNewSession({...newSession, duration_minutes: parseInt(e.target.value)})}
            min="15"
            max="180"
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            backgroundColor: '#007B83',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Create Session'}
        </button>
      </form>

      {/* Active Sessions List */}
      <div>
        <h3>Active Sessions</h3>
        {sessions.length === 0 ? (
          <p>No active sessions</p>
        ) : (
          sessions.map(session => (
            <div 
              key={session.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: session.status === 'active' ? '#e8f5e8' : '#f9f9f9'
              }}
            >
              <h4>{session.title}</h4>
              <p><strong>Type:</strong> {session.session_types?.display_name}</p>
              <p><strong>Status:</strong> {session.status}</p>
              <p><strong>Presenter:</strong> {session.presenter_name || 'N/A'}</p>
              <p><strong>Participants:</strong> {session.current_participants}/{session.max_participants}</p>
              <p><strong>Start:</strong> {new Date(session.scheduled_start).toLocaleString()}</p>
              
              <div style={{ marginTop: '10px' }}>
                {session.status === 'scheduled' && (
                  <button 
                    onClick={() => controlSession(session.id, 'start')}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '3px',
                      marginRight: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Start
                  </button>
                )}
                
                {session.status === 'active' && (
                  <>
                    <button 
                      onClick={() => controlSession(session.id, 'pause')}
                      style={{
                        backgroundColor: '#ffc107',
                        color: 'black',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '3px',
                        marginRight: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Pause
                    </button>
                    <button 
                      onClick={() => controlSession(session.id, 'end')}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '3px',
                        marginRight: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      End
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}