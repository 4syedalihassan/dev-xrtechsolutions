import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Redirect to login when session is invalid
  const redirectToLogin = () => {
    if (typeof window === 'undefined') return;

    const currentPath = window.location.pathname;

    // Don't redirect if already on public pages or password setup
    if (
      currentPath === '/admin/login' ||
      currentPath === '/login' ||
      currentPath === '/' ||
      currentPath === '/admin/accept-invite' ||
      currentPath === '/immersiveexp' ||
      currentPath.startsWith('/products')
    ) {
      return;
    }

    // Redirect to appropriate login
    if (currentPath.startsWith('/admin')) {
      window.location.href = '/admin/login?error=session_expired';
    } else {
      window.location.href = '/login?error=session_expired';
    }
  };

  // Check session validity periodically
  useEffect(() => {
    // Skip if Supabase is not configured
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const checkSessionValidity = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        // Session is invalid
        if (user) {
          // We had a user but now session is gone - redirect
          setUser(null);
          setSession(null);
          redirectToLogin();
        }
      }
    };

    // Check session every 30 seconds
    const intervalId = setInterval(checkSessionValidity, 30000);

    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    // Skip if Supabase is not configured
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Check active session
    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔔 [AuthContext] Auth state change event:', event);
        console.log('🔔 [AuthContext] Has session:', !!newSession);
        console.log('🔔 [AuthContext] Has user:', !!newSession?.user);

        if (newSession?.user) {
          console.log('🔔 [AuthContext] User signed in, updating session and loading profile...');
          setSession(newSession);
          await loadUserProfile(newSession.user);
        } else {
          // Session is null - user signed out or expired
          console.log('🔔 [AuthContext] No session, clearing user...');
          setUser(null);
          setSession(null);

          // Only redirect if event indicates user should be logged out
          if (event === 'SIGNED_OUT') {
            console.log('🔔 [AuthContext] User signed out, redirecting to login...');
            redirectToLogin();
          }
        }

        console.log('🔔 [AuthContext] Auth state change complete, setting loading to false');
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    // Skip if Supabase is not configured
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }

      setSession(session);

      if (session?.user) {
        await loadUserProfile(session.user);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (authUser) => {
    try {
      console.log('👤 [AuthContext] Loading user profile for auth_id:', authUser.id);

      // Get user from users table with role
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          admin_profile:admin_profiles(*)
        `)
        .eq('auth_id', authUser.id)
        .single();

      console.log('👤 [AuthContext] User profile query result:', {
        hasUser: !!user,
        userEmail: user?.email,
        userRole: user?.role,
        error: userError?.message,
        errorCode: userError?.code
      });

      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist in users table, create them
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            auth_id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || '',
            role: 'customer' // Default to customer
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user record:', createError);
          throw createError;
        }

        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', newUser.id);

        // Set basic user profile
        const userProfile = {
          id: newUser.id,
          auth_id: authUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          active: newUser.active,
          isAdmin: false,
          isSuperAdmin: false,
          email_verified: authUser.email_confirmed_at ? true : false
        };

        setUser(userProfile);
        return;
      }

      if (userError) {
        console.error('Error loading user:', userError);
        throw userError;
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Build user profile with role information
      const userProfile = {
        id: user.id,
        auth_id: authUser.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
        isAdmin: ['admin', 'super_admin'].includes(user.role),
        isSuperAdmin: user.role === 'super_admin',
        admin_profile: user.admin_profile?.[0] || null,
        email_verified: authUser.email_confirmed_at ? true : false,
        created_at: user.created_at
      };

      console.log('✅ [AuthContext] User profile loaded successfully:', {
        email: userProfile.email,
        role: userProfile.role,
        isAdmin: userProfile.isAdmin,
        isSuperAdmin: userProfile.isSuperAdmin
      });

      setUser(userProfile);
      console.log('✅ [AuthContext] User state updated in context');
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Set basic user info if profile load fails
      setUser({
        id: authUser.id,
        auth_id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || '',
        role: 'customer',
        isAdmin: false,
        isSuperAdmin: false
      });
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name || '',
            phone: metadata.phone || ''
          }
        }
      });

      if (error) throw error;

      // Create user record in users table
      if (data.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert([
            {
              auth_id: data.user.id,
              email: email,
              name: metadata.name || '',
              role: 'customer' // Always create as customer, admin role set manually
            }
          ]);

        if (userError) {
          console.error('Error creating user record:', userError);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('🔐 [AuthContext] Starting signIn for:', email);
      console.log('🔐 [AuthContext] Supabase client exists:', !!supabase);

      if (!supabase) {
        console.error('❌ [AuthContext] Supabase client is null! Check environment variables.');
        throw new Error('Supabase is not configured. Please check environment variables.');
      }

      console.log('🔐 [AuthContext] Calling supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('🔐 [AuthContext] SignIn response:', {
        hasData: !!data,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error?.message
      });

      if (error) {
        console.error('❌ [AuthContext] SignIn error:', error);
        throw error;
      }

      console.log('✅ [AuthContext] SignIn successful for user:', data?.user?.id);
      return { data, error: null };
    } catch (error) {
      console.error('💥 [AuthContext] Exception in signIn:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      // Clear all auth state
      setUser(null);
      setSession(null);
      setLoading(false);

      // Clear any cached auth data from storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      }

      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);

      // Force clear state even if signOut fails
      setUser(null);
      setSession(null);

      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      }

      return { error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { data: null, error };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      return { data: null, error };
    }
  };

  const updateProfile = async (updates) => {
    try {
      // Update auth user metadata
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          phone: updates.phone
        }
      });

      if (authError) throw authError;

      // Update customer record
      if (user.customer_id) {
        const { error: customerError } = await supabase
          .from('customers')
          .update({
            name: updates.name,
            phone: updates.phone,
            avatar_url: updates.avatar_url || user.avatar_url
          })
          .eq('id', user.customer_id);

        if (customerError) throw customerError;
      }

      // Reload user profile
      await loadUserProfile(authData.user);

      return { data: authData, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  };

  const uploadAvatar = async (file) => {
    try {
      if (!user) throw new Error('No user logged in');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      await updateProfile({ avatar_url: publicUrl });

      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { url: null, error };
    }
  };

  // Helper function to check if user is admin
  const requireAdmin = () => {
    if (!user || !user.isAdmin) {
      throw new Error('Admin access required');
    }
    return true;
  };

  // Helper function to check if user is super admin
  const requireSuperAdmin = () => {
    if (!user || !user.isSuperAdmin) {
      throw new Error('Super admin access required');
    }
    return true;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar,
    requireAdmin,
    requireSuperAdmin,
    isAdmin: user?.isAdmin || false,
    isSuperAdmin: user?.isSuperAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
