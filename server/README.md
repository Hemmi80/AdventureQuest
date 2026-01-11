# RealmQuest Multiplayer Server

This is the multiplayer server for RealmQuest that handles player synchronization, chat, and real-time updates.

## Quick Deploy to Render.com (Free)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) and sign up with GitHub
3. Click **New** → **Web Service**
4. Connect your GitHub repo (Hemmi80/AdventureQuest)
5. Set these options:
   - **Name**: realmquest-server
   - **Root Directory**: server
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Click **Create Web Service**

Your server will be live at: `https://realmquest-server.onrender.com`

## Local Development

```bash
cd server
npm install
npm start
```

Server runs on `http://localhost:3000`

## Environment Variables

- `PORT` - Server port (default: 3000)

## Features

- Real-time player position sync
- Chat system
- Scene change notifications
- Attack/combat sync
- Player health sync
- Auto-cleanup on disconnect
