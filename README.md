# Note Collab - Backend Server

Real-time collaboration server using Express and Socket.io.

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     Express HTTP Server             │
│  - REST API endpoints               │
│  - Health checks                    │
│  - Static file serving (production) │
└─────────────────────────────────────┘
                │
                │
┌─────────────────────────────────────┐
│     Socket.io WebSocket Layer       │
│  - Real-time bidirectional comms    │
│  - Room management                  │
│  - User presence tracking           │
└─────────────────────────────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
  ┌──────────┐    ┌──────────┐
  │  Room 1  │    │  Room 2  │
  │  Users:  │    │  Users:  │
  │  • Alice │    │  • Bob   │
  │  • Carol │    │  • Dave  │
  └──────────┘    └──────────┘
```

## 📁 File Structure

```
server/
├── index.js               # Main server file
├── utils/
│   ├── roomManager.js     # Room management utilities
│   ├── socketHandlers.js  # Socket.io event handlers
│   └── logger.js          # Logging utility
├── test-server.js         # Testing script
├── API.md                 # API documentation
├── package.json
├── .env                   # Environment config
└── .env.example           # Example config
```

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

Server will start on `http://localhost:3000` with auto-reload.

### Start Production Server
```bash
npm start
```

### Run Tests
```bash
npm test
```

## 🔧 Configuration

Create a `.env` file:

```bash
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
LOG_LEVEL=INFO
```

### Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment: development/production
- `CLIENT_URL` - Client origin for CORS
- `LOG_LEVEL` - Logging level: DEBUG/INFO/WARN/ERROR

## 📡 Features

### Real-time Collaboration
- ✅ Room-based sessions
- ✅ User presence tracking
- ✅ Yjs document synchronization
- ✅ Awareness state sharing (cursors, selections)
- ✅ Typing indicators
- ✅ User color assignment

### Room Management
- ✅ Auto-create rooms on join
- ✅ Auto-cleanup empty rooms
- ✅ Track room metadata
- ✅ User join/leave notifications
- ✅ Multiple users per room

### REST API
- ✅ Health check endpoint
- ✅ Server statistics
- ✅ Room creation/deletion
- ✅ Room info queries

### Production Ready
- ✅ CORS configured
- ✅ Error handling
- ✅ Graceful shutdown
- ✅ Logging
- ✅ Static file serving

## 📚 API Documentation

See [API.md](./API.md) for complete API documentation including:
- All Socket.io events
- REST endpoints
- Request/response formats
- Error handling
- Examples

## 🔌 Socket.io Events

### Key Events

**Client → Server:**
- `join-room` - Join a note session
- `yjs-update` - Send document updates
- `awareness-update` - Share cursor/selection
- `leave-room` - Leave session

**Server → Client:**
- `join-success` - Joined successfully
- `room-users` - List of users in room
- `user-joined` - Someone joined
- `user-left` - Someone left
- `yjs-update` - Receive document update

See [API.md](./API.md) for complete event list.

## 🧪 Testing

### Manual Testing

1. **Start server:**
   ```bash
   npm run dev
   ```

2. **Test health endpoint:**
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **Test stats endpoint:**
   ```bash
   curl http://localhost:3000/api/stats
   ```

4. **Create a room:**
   ```bash
   curl -X POST http://localhost:3000/api/room
   ```

### Automated Testing

Run the test script:
```bash
npm test
```

This tests:
- ✅ Health check
- ✅ Room creation
- ✅ Socket.io connection
- ✅ Joining rooms
- ✅ Stats endpoint

## 🗂️ Data Structures

### Rooms Map
```javascript
Map<roomId, Map<socketId, userData>>
```

### User Data
```javascript
{
  id: string,           // Socket ID
  username: string,     // Display name
  userId: string,       // Unique ID
  color: string,        // Hex color
  joinedAt: string      // ISO timestamp
}
```

## 🎨 User Colors

12 predefined colors assigned sequentially:
- Red, Teal, Blue, Salmon, Mint
- Yellow, Purple, Sky Blue, Orange, Green
- Coral, Dark Teal

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "ok",
  "activeRooms": 5,
  "totalUsers": 12,
  "uptime": 3600
}
```

### Detailed Stats
```bash
curl http://localhost:3000/api/stats
```

Includes:
- Server uptime and memory
- Active rooms and users
- Per-room user lists

## 🔒 Security Considerations

### Current Setup (Development)
- CORS configured for localhost
- No authentication required
- Rooms auto-created
- Anyone can join any room

### For Production
Consider adding:
- Authentication (JWT, OAuth)
- Room passwords/permissions
- Rate limiting
- Input validation/sanitization
- HTTPS/WSS only
- Room expiration

## 🚀 Deployment

### Prerequisites
- Node.js >= 18
- Environment variables configured

### Build Client First
```bash
cd ../client
npm run build
```

### Deploy Options

**Railway:**
```bash
railway login
railway init
railway up
```

**Render:**
- Connect GitHub repo
- Set build command: `npm install`
- Set start command: `npm start`
- Add environment variables

**Fly.io:**
```bash
fly launch
fly deploy
```

**Heroku:**
```bash
heroku create
git push heroku main
```

### Environment Variables (Production)
```bash
PORT=3000
NODE_ENV=production
CLIENT_URL=https://your-client-url.com
LOG_LEVEL=INFO
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process
lsof -i :3000

# Kill process
lsof -ti:3000 | xargs kill -9
```

### WebSocket Connection Failed
- Check CORS settings in `.env`
- Verify CLIENT_URL matches frontend
- Ensure both servers are running
- Check firewall/proxy settings

### Empty Room Not Cleaning Up
- Rooms are cleaned every 5 minutes
- Or manually cleaned when last user leaves
- Check server logs for cleanup messages

### High Memory Usage
- Monitor with `/api/stats`
- Check number of active rooms
- Verify rooms are being cleaned up
- Consider adding room limits

## 📝 Logging

Log levels and output:

```javascript
logger.debug('Detailed info');    // 🔍 DEBUG
logger.info('General info');       // ℹ️  INFO
logger.success('Success');         // ✅ SUCCESS
logger.warn('Warning');            // ⚠️  WARN
logger.error('Error');             // ❌ ERROR
logger.connection('Connected');    // 🔌 CONNECTION
logger.room('Room event');         // 🚪 ROOM
logger.user('User action');        // 👤 USER
```

Set level in `.env`:
```bash
LOG_LEVEL=DEBUG  # See everything
LOG_LEVEL=INFO   # Normal operation (default)
LOG_LEVEL=WARN   # Only warnings/errors
LOG_LEVEL=ERROR  # Only errors
```

## 🔄 Graceful Shutdown

Server handles SIGTERM and SIGINT:
```bash
# Ctrl+C or kill signal
- Closes HTTP server
- Disconnects all sockets
- Cleans up resources
- Exits cleanly
```

## 📈 Performance

### Current Limits
- No hard user limit per room
- No hard room limit
- Memory-based storage (rooms in RAM)

### Scaling Considerations
- For 100s of concurrent users: current setup is fine
- For 1000s: consider Redis for room storage
- For 10,000s: need load balancing + Redis pub/sub

### Socket.io Config
```javascript
{
  pingTimeout: 60000,   // 60s - max time without pong
  pingInterval: 25000   // 25s - ping frequency
}
```

## 🤝 Contributing

This is a learning/hobby project, but improvements welcome:
1. Fork the repo
2. Create feature branch
3. Test your changes
4. Submit pull request

## 📄 License

MIT - Use freely for learning and experimentation!
