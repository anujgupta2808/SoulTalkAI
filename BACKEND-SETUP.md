# SoulTalk AI - Backend Setup

## ⚠️ SECURITY WARNING
**NEVER share your Gemini API key publicly!** Keep it in the `.env` file only.

## Setup Instructions

### 1. Install Node.js
Download and install Node.js from: https://nodejs.org/

### 2. Install Dependencies
Open terminal in the SoulTalkAI folder and run:
```bash
npm install
```

### 3. Get Your Gemini API Key
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy your API key

### 4. Add Your API Key
1. Open the `.env` file in this folder
2. Replace `your_gemini_api_key_here` with your actual API key:
```
GEMINI_API_KEY=AIzaSy...
PORT=3000
```

### 5. Start the Backend Server
```bash
npm start
```

Server will run on: http://localhost:3000

### 6. Open the Chat Application
Open `chat.html` in your browser

## How It Works

1. User types message in chat
2. Frontend sends message to backend server (localhost:3000)
3. Backend server sends message to ChatGPT API
4. ChatGPT response comes back to backend
5. Backend sends response to frontend
6. User sees ChatGPT's response

## Benefits of Indirect Approach

✅ API key stays secure on server (not exposed in frontend)
✅ Better control over API usage
✅ Can add rate limiting, logging, etc.
✅ Fallback to local responses if API fails

## Files

- `server.js` - Backend Node.js server
- `chat.js` - Frontend (updated to call backend)
- `package.json` - Node.js dependencies
