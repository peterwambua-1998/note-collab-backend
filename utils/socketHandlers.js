/**
 * Socket.io Event Handlers
 * Centralized event handling for collaboration features
 */

const {
  getUserColor,
  getRoomUsers,
  sanitizeUsername,
  isValidRoomId
} = require('./roomManager');

/**
 * Setup socket event handlers
 */
function setupSocketHandlers(io, socket, rooms, roomMetadata) {

  // Join a room (note session)
  socket.on('join-room', ({ roomId, username, userId }) => {
    try {
      // Validate room ID
      if (!isValidRoomId(roomId)) {
        socket.emit('error', { message: 'Invalid room ID' });
        return;
      }

      // Leave any existing rooms first
      Array.from(socket.rooms).forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
          handleUserLeaving(io, socket, rooms, roomMetadata, room);
        }
      });

      // Join the new room
      socket.join(roomId);

      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
        roomMetadata.set(roomId, {
          createdAt: new Date().toISOString(),
          createdBy: socket.id
        });
      }

      // Get current room size to assign color
      const room = rooms.get(roomId);
      const colorIndex = room.size;

      // Store user info with color
      const userData = {
        id: socket.id,
        username: sanitizeUsername(username),
        userId: userId || socket.id,
        color: getUserColor(colorIndex),
        joinedAt: new Date().toISOString()
      };

      room.set(socket.id, userData);

      console.log(`👤 ${userData.username} joined room: ${roomId} (${room.size} users)`);

      // Send current users list to the newly joined user
      socket.emit('room-users', getRoomUsers(rooms, roomId));

      // Notify others in the room that someone joined
      socket.to(roomId).emit('user-joined', userData);

      // Broadcast updated users list to everyone in the room
      io.to(roomId).emit('room-users', getRoomUsers(rooms, roomId));

      // Send success confirmation
      socket.emit('join-success', {
        roomId,
        userData,
        userCount: room.size
      });

    } catch (error) {
      console.error(`❌ Error joining room: ${error.message}`);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle Yjs document updates (sync between clients)
  socket.on('yjs-update', ({ roomId, update }) => {
    // Broadcast the update to all other users in the room
    socket.to(roomId).emit('yjs-update', { update, from: socket.id });
  });

  // Handle awareness updates (cursor positions, selections, etc.)
  socket.on('awareness-update', ({ roomId, update }) => {
    // Broadcast awareness to all other users in the room
    socket.to(roomId).emit('awareness-update', { update, from: socket.id });
  });

  // Handle cursor position updates
  socket.on('cursor-update', ({ roomId, position }) => {
    const room = rooms.get(roomId);
    if (room && room.has(socket.id)) {
      const userData = room.get(socket.id);
      socket.to(roomId).emit('cursor-update', {
        userId: socket.id,
        username: userData.username,
        color: userData.color,
        position
      });
    }
  });

  // Handle user typing indicator
  socket.on('typing', ({ roomId, isTyping }) => {
    const room = rooms.get(roomId);
    if (room && room.has(socket.id)) {
      const userData = room.get(socket.id);
      socket.to(roomId).emit('user-typing', {
        userId: socket.id,
        username: userData.username,
        isTyping
      });
    }
  });

  // Request sync from other peers (when joining late)
  socket.on('request-sync', ({ roomId }) => {
    console.log(`🔄 ${socket.id} requesting sync for room: ${roomId}`);
    socket.to(roomId).emit('sync-requested', { from: socket.id });
  });

  // Send sync data to a specific peer
  socket.on('send-sync', ({ to, roomId, state }) => {
    io.to(to).emit('receive-sync', {
      from: socket.id,
      roomId,
      state
    });
  });

  // Leave room explicitly
  socket.on('leave-room', ({ roomId }) => {
    handleUserLeaving(io, socket, rooms, roomMetadata, roomId);
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${socket.id} (${reason})`);

    // Remove user from all rooms
    rooms.forEach((users, roomId) => {
      if (users.has(socket.id)) {
        handleUserLeaving(io, socket, rooms, roomMetadata, roomId);
      }
    });
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
}

/**
 * Handle user leaving a room
 */
function handleUserLeaving(io, socket, rooms, roomMetadata, roomId) {
  const room = rooms.get(roomId);
  if (room && room.has(socket.id)) {
    const user = room.get(socket.id);
    room.delete(socket.id);

    console.log(`👋 ${user.username} left room: ${roomId} (${room.size} remaining)`);

    // Notify others in the room
    socket.to(roomId).emit('user-left', {
      userId: socket.id,
      username: user.username
    });

    // Broadcast updated users list
    if (room.size > 0) {
      io.to(roomId).emit('room-users', getRoomUsers(rooms, roomId));
    } else {
      // Clean up empty rooms
      rooms.delete(roomId);
      roomMetadata.delete(roomId);
      console.log(`🗑️  Room ${roomId} deleted (empty)`);
    }

    socket.leave(roomId);
  }
}

module.exports = { setupSocketHandlers, handleUserLeaving };
