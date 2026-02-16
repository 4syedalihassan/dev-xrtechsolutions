# Vercel Deployment Configuration

## Environment Variables Required

You need to set these environment variables in your Vercel project settings:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Example: `https://xxxxxxxxxxxxx.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key
   - Found in Supabase Dashboard → Settings → API

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Your Supabase service role key (secret)
   - Found in Supabase Dashboard → Settings → API
   - ⚠️ Keep this secret! Never commit to git

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings"
3. Click on "Environment Variables"
4. Add each variable:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
   - Environment: Production, Preview, Development (select all)
5. Repeat for the other two variables
6. Redeploy your project

## Build Configuration

The `vercel.json` file includes:
- `--legacy-peer-deps` flag to handle dependency conflicts
- esbuild binary path configuration
- API function memory and timeout settings

## Troubleshooting

If deployment still fails:
1. Check that all environment variables are set correctly
2. Ensure your Supabase project is accessible
3. Check Vercel build logs for specific errors
4. Try redeploying after clearing build cache

## Node Version

Vercel will automatically use Node.js 20.x (latest LTS) unless specified otherwise.
