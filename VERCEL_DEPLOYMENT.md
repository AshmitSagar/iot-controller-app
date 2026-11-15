# Vercel Deployment Guide

## Important Prerequisites

⚠️ **Critical**: Your Home Assistant instance must be accessible from the internet for Vercel deployment to work, since Vercel hosts static sites that run in users' browsers.

### Options for Home Assistant Access:

1. **Nabu Casa Cloud** (Recommended)
   - Easiest solution: https://www.nabucasa.com/
   - Provides secure remote access
   - Use URL: `https://your-instance.ui.nabu.casa`

2. **Self-Hosted with Reverse Proxy**
   - Set up Nginx/Caddy with SSL
   - Use domain with valid certificate
   - Configure port forwarding

3. **Cloudflare Tunnel** (Free)
   - Create tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
   - No port forwarding required
   - Get public URL for your HA instance

4. **Tailscale** (Private Network)
   - Not suitable for public Vercel deployment
   - Only works for devices on your Tailscale network

## Deployment Steps

### 1. Prepare Your Repository

```bash
cd /home/ashmit/prog/iot-controller-app

# Add vercel.json to git
git add iot-controller/vercel.json
git commit -m "Add Vercel configuration"

# Push to GitHub (create repo first if needed)
git remote add origin https://github.com/YOUR_USERNAME/iot-controller-app.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

**Option A: Vercel Dashboard (Easiest)**
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import your `iot-controller-app` repository
5. Configure:
   - **Root Directory**: `iot-controller`
   - **Framework Preset**: Angular
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/iot-controller/browser`
   - **Install Command**: `npm ci`
6. Click "Deploy"

**Option B: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from iot-controller directory
cd iot-controller
vercel

# For production
vercel --prod
```

### 3. Configure Home Assistant URL

After deployment, users will need to configure their Home Assistant URL when they first login to your app.

**Default Login Screen**:
- URL: (user enters their public HA URL)
- Token: (user enters their long-lived access token)

### 4. Environment Variables (Optional)

If you want to pre-configure a default HA URL, add environment variable in Vercel:

**Vercel Dashboard** → **Project Settings** → **Environment Variables**:
- `HA_DEFAULT_URL`: `https://your-ha-instance.com:8123`

Then update `iot-controller/src/app/features/auth/login/login.ts`:
```typescript
hassUrl = model(environment.haDefaultUrl || 'http://localhost:8123');
```

## Important Security Considerations

### CORS Configuration
Your Home Assistant must allow CORS from Vercel domain:

**configuration.yaml**:
```yaml
http:
  cors_allowed_origins:
    - https://your-app.vercel.app
    - https://*.vercel.app  # Allow all Vercel preview deployments
  use_x_forwarded_for: true
  trusted_proxies:
    - 127.0.0.1
    - ::1
```

### SSL/HTTPS Required
- Vercel serves over HTTPS
- Home Assistant must also use HTTPS
- Mixed content (HTTPS → HTTP) is blocked by browsers
- Use Let's Encrypt or Nabu Casa for SSL

### WebSocket Support
Ensure your reverse proxy supports WebSocket upgrades:

**Nginx example**:
```nginx
location /api/websocket {
    proxy_pass http://homeassistant:8123/api/websocket;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## Testing Deployment

1. Deploy to Vercel
2. Open your Vercel URL: `https://your-app.vercel.app`
3. Enter your public Home Assistant URL
4. Enter long-lived access token
5. Should connect and show overview dashboard

## Troubleshooting

### CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```
**Fix**: Add your Vercel domain to Home Assistant CORS config

### Mixed Content Errors
```
Mixed Content: The page was loaded over HTTPS, but requested an insecure resource
```
**Fix**: Ensure Home Assistant uses HTTPS

### WebSocket Connection Failed
```
WebSocket connection to 'ws://...' failed
```
**Fix**: Use `wss://` (secure WebSocket) - requires HTTPS on HA

### Cannot Connect to localhost
```
Failed to connect to http://localhost:8123
```
**Fix**: Use public URL, not localhost (Vercel runs in user's browser)

## Alternative: Deploy Frontend Only Locally

If you can't expose Home Assistant publicly, you can:

1. Keep Home Assistant on local network
2. Run frontend locally: `npm run dev` in iot-controller directory
3. Or deploy via Docker on same network as Home Assistant

## Build Output

Vercel will build and deploy from:
- **Source**: `iot-controller/src`
- **Build**: `iot-controller/dist/iot-controller/browser`
- **Size**: ~810 kB (173 kB gzipped)
- **Framework**: Angular 18

## Custom Domain (Optional)

After deployment, add custom domain in Vercel dashboard:
1. Go to Project Settings → Domains
2. Add your domain: `homecontrol.yourdomain.com`
3. Configure DNS as instructed
4. Update Home Assistant CORS to include new domain

## Summary

✅ Vercel deployment works great for the frontend  
⚠️ Home Assistant must be publicly accessible  
🔒 Use HTTPS and proper CORS configuration  
🌐 Users enter their own HA URL at login

For most home users, **Nabu Casa Cloud** or **Cloudflare Tunnel** is the easiest solution for public access.
