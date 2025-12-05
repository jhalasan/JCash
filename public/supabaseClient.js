// Declare Supabase URL and anonymous key
const SUPABASE_URL = 'https://fndmnwwaarvmquumfaci.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuZG1ud3dhYXJ2bXF1dW1mYWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3Njg5MDEsImV4cCI6MjA4MDM0NDkwMX0.5UQvkmnCz4dLqBy0Kh4txwL1MQ-wdavh3C2IMMj38SM';

// Create client in a robust way and always expose helpers
(() => {
  // Lightweight local "session" for demo logins (no real auth)
  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem('jcUser');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Error reading local user:', e);
      return null;
    }
  };

  const setStoredUser = (user) => {
    try {
      localStorage.setItem('jcUser', JSON.stringify(user));
    } catch (e) {
      console.error('Error saving local user:', e);
    }
  };

  const clearStoredUser = () => {
    try {
      localStorage.removeItem('jcUser');
    } catch (e) {
      console.error('Error clearing local user:', e);
    }
  };

  // Expose storage helpers immediately so other scripts can access them even if SDK init fails
  window.getStoredUser = getStoredUser;
  window.setStoredUser = setStoredUser;
  window.clearStoredUser = clearStoredUser;

  // Try to find a createClient function provided by the CDN
  const createClientFn = window.createClient || (window.supabase && window.supabase.createClient);

  if (!createClientFn) {
    console.error('Supabase SDK not loaded. Ensure the CDN script is included before supabaseClient.js.');
    // Provide safe stubs so callers won't throw
    window.supabaseClient = null;
    window.requireAuth = async () => {
      const localUser = getStoredUser();
      if (localUser) return { user: localUser };
      // no SDK — treat as not authenticated
      window.location.href = 'index.html';
      return null;
    };
    return;
  }

  try {
    const client = createClientFn(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = client;

    // Helper you can call on pages that require authentication
    window.requireAuth = async () => {
      const localUser = getStoredUser();
      if (localUser) return { user: localUser };

      if (!client || !client.auth) {
        console.error('Supabase auth not available on client.');
        window.location.href = 'index.html';
        return null;
      }

      const { data, error } = await client.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
        return null;
      }
      if (!data || !data.session) {
        window.location.href = 'index.html';
        return null;
      }
      return data.session;
    };
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    window.supabaseClient = null;
    window.requireAuth = async () => {
      const localUser = getStoredUser();
      if (localUser) return { user: localUser };
      window.location.href = 'index.html';
      return null;
    };
  }
})();
