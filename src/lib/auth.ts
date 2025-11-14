import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

// Google-only authentication strategy
export async function signInWithGoogle(): Promise<void> {
  // For development, use the exact localhost URL
  // For production, use your deployed domain with hash route
  const redirectUrl = import.meta.env.PROD 
    ? `${window.location.origin}/#/`
    : 'http://localhost:5174';
    
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      scopes: 'email profile',
      skipBrowserRedirect: false,
    }
  });
  if (error) {
    console.error('OAuth signInWithGoogle error:', error);
    throw error;
  }
  // data.url is where Supabase will redirect the browser; Supabase client handles navigation automatically.
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return null;
    }

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('getCurrentUser error:', error);
      return null;
    }

    if (!data.user) return null;

    const meta: any = (data.user as any).user_metadata || {};
    return {
      id: data.user.id,
      email: data.user.email || '',
      name: meta.full_name || meta.name || undefined,
      avatarUrl: meta.avatar_url || meta.picture || undefined,
    };
  } catch (err) {
    console.error('getCurrentUser exception:', err);
    return null;
  }
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      const meta: any = (session.user as any).user_metadata || {};
      callback({
        id: session.user.id,
        email: session.user.email || '',
        name: meta.full_name || meta.name || undefined,
        avatarUrl: meta.avatar_url || meta.picture || undefined,
      });
    } else {
      callback(null);
    }
  });

  return data.subscription.unsubscribe;
}
