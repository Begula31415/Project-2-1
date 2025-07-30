// Session utility for tracking guest user views
const SESSION_KEY = 'filmfusion_session_id';

// Generate a unique session ID
export const generateSessionId = () => {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Get existing session ID or create a new one
export const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
};

// Clear session ID (for logout or manual reset)
export const clearSessionId = () => {
  localStorage.removeItem(SESSION_KEY);
};
