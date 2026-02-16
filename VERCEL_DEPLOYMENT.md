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

## Recent Fixes (February 2026)

### Fixed: Build Failure with Error Code 127
**Problem**: Vercel build was failing with:
```
npm error node: error while loading shared libraries: libatomic.so.1: cannot open shared object file
npm error Command "npm install" exited with 127
```

**Root Cause**: The `package.json` had an incorrect `"node": "^25.6.1"` package in dependencies. The "node" npm package is not the Node.js runtime and should never be a dependency.

**Solution**: 
- Removed the incorrect "node" package from dependencies
- Updated Node.js engine requirement to `>=20.0.0` for better Vercel compatibility
- Added missing `stripe` package that was causing build warnings

## Troubleshooting

If deployment still fails:
1. Check that all environment variables are set correctly
2. Ensure your Supabase project is accessible
3. Check Vercel build logs for specific errors
4. Try redeploying after clearing build cache
5. Verify that dependencies don't include the "node" package

## Node Version

The project now requires Node.js 20.x or later. Vercel will automatically use Node.js 20.x (latest LTS) unless specified otherwise.
