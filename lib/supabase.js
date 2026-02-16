import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only log warning during build time, don't throw to allow builds to complete
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
}

// Create a placeholder client or real client depending on env vars
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => !!supabase;

// Helper to throw error if Supabase is not configured
const requireSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  }
  return supabase;
};

// Helper functions for common operations
export const sceneAPI = {
  async getProject(slug) {
    const client = requireSupabase();
    const { data, error } = await client
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getScenes(projectId) {
    const client = requireSupabase();
    const { data, error } = await client
      .from('scenes')
      .select(`
        *,
        hotspots (*)
      `)
      .eq('project_id', projectId)
      .eq('active', true)
      .order('order');
    
    if (error) throw error;
    return data;
  },

  async getContent(keys, language = 'en') {
    const client = requireSupabase();
    const { data, error } = await client
      .from('content_blocks')
      .select('*')
      .in('key', keys)
      .eq('language', language);
    
    if (error) throw error;
    return data.reduce((acc, block) => {
      acc[block.key] = block;
      return acc;
    }, {});
  },

  async getGamification(projectId) {
    const client = requireSupabase();
    const { data, error } = await client
      .from('gamification')
      .select('*')
      .eq('project_id', projectId)
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const playerAPI = {
  async getOrCreatePlayer(authUser) {
    if (!authUser) return null;
    
    const client = requireSupabase();
    let { data: player, error } = await client
      .from('players')
      .select('*')
      .eq('auth_uid', authUser.id)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // Player doesn't exist, create one
      const { data: newPlayer, error: createError } = await client
        .from('players')
        .insert({
          auth_uid: authUser.id,
          email: authUser.email,
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0]
        })
        .select()
        .single();
      
      if (createError) throw createError;
      return newPlayer;
    }
    
    if (error) throw error;
    return player;
  },

  async awardXP(playerId, points, eventType = 'manual') {
    const client = requireSupabase();
    const { data, error } = await client.rpc('award_xp', {
      player_uuid: playerId,
      points: points,
      event_type: eventType
    });
    
    if (error) throw error;
    return data;
  },

  async logEvent(playerId, eventType, metadata = {}) {
    const client = requireSupabase();
    const { error } = await client
      .from('learning_events')
      .insert({
        user_id: playerId,
        event_type: eventType,
        ...metadata
      });
    
    if (error) throw error;
  }
};