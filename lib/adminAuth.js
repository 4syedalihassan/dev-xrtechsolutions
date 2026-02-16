import { createClient } from '@supabase/supabase-js';

/**
 * Helper function to extract Supabase access token from cookies
 */
function getAccessTokenFromCookies(context) {
  const cookies = context.req.cookies || {};

  // Try different cookie name patterns used by Supabase
  const possibleKeys = [
    'sb-access-token',
    'sb-eituitxxvzosdhzuiisr-auth-token',
    'supabase-auth-token'
  ];

  for (const key of possibleKeys) {
    if (cookies[key]) {
      return cookies[key];
    }
  }

  // Also try parsing from Set-Cookie header
  const cookieHeader = context.req.headers.cookie;
  if (cookieHeader) {
    const cookieMatch = cookieHeader.match(/sb-[^-]+-auth-token(?:\.0)?=([^;]+)/);
    if (cookieMatch) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookieMatch[1]));
        return parsed.access_token || parsed;
      } catch (e) {
        return cookieMatch[1];
      }
    }

    // Try simple token extraction
    const tokenMatch = cookieHeader.match(/sb-access-token=([^;]+)/);
    if (tokenMatch) {
      return tokenMatch[1];
    }
  }

  return null;
}

/**
 * Admin Authentication Middleware
 *
 * Protects admin pages by checking:
 * 1. User is authenticated (has valid session)
 * 2. User has admin or super_admin role
 * 3. User account is active
 *
 * Usage in admin pages:
 *
 * export async function getServerSideProps(context) {
 *   return requireAdmin(context);
 * }
 */

export async function requireAdmin(context) {
  try {
    // Get access token from cookies
    const accessToken = getAccessTokenFromCookies(context);

    if (!accessToken) {
      console.log('No access token found in cookies, redirecting to login');
      return {
        redirect: {
          destination: '/admin/login?error=session_expired',
          permanent: false,
        },
      };
    }

    // Create Supabase client and verify the token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get user from the access token
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !authUser) {
      console.log('Invalid or expired token:', authError?.message);
      return {
        redirect: {
          destination: '/admin/login?error=session_expired',
          permanent: false,
        },
      };
    }

    // Query user from users table to check role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role, active')
      .eq('auth_id', authUser.id)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return {
        redirect: {
          destination: '/admin/login?error=user_not_found',
          permanent: false,
        },
      };
    }

    // Check if user is admin or super_admin
    if (!['admin', 'super_admin'].includes(user.role)) {
      console.log(`Access denied: User role is ${user.role}`);
      return {
        redirect: {
          destination: '/admin/login?error=access_denied',
          permanent: false,
        },
      };
    }

    // Check if account is active
    if (!user.active) {
      console.log('Access denied: Account is inactive');
      return {
        redirect: {
          destination: '/admin/login?error=account_inactive',
          permanent: false,
        },
      };
    }

    // All checks passed, allow access
    return {
      props: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isAdmin: true,
          isSuperAdmin: user.role === 'super_admin',
        },
        session: {
          access_token: accessToken,
          user: authUser,
        },
      },
    };
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return {
      redirect: {
        destination: '/admin/login?error=server_error',
        permanent: false,
      },
    };
  }
}

/**
 * Super Admin Authentication Middleware
 *
 * Stricter version that only allows super_admin role
 *
 * Usage:
 *
 * export async function getServerSideProps(context) {
 *   return requireSuperAdmin(context);
 * }
 */

export async function requireSuperAdmin(context) {
  const result = await requireAdmin(context);

  // If redirect already set, return it
  if (result.redirect) {
    return result;
  }

  // Check if user is super admin
  if (result.props.user.role !== 'super_admin') {
    return {
      redirect: {
        destination: '/admin?error=super_admin_required',
        permanent: false,
      },
    };
  }

  return result;
}

/**
 * Check if current session belongs to an admin (client-side)
 *
 * Usage in components:
 *
 * const isAdmin = await checkIsAdmin();
 */

export async function checkIsAdmin() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return false;

    const { data: user } = await supabase
      .from('users')
      .select('role, active')
      .eq('auth_id', session.user.id)
      .single();

    return user && user.active && ['admin', 'super_admin'].includes(user.role);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}
