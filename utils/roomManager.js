/**
 * Room Management Utilities
 * Handles room operations and user management
 */

// User color palette for collaboration
const USER_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Orange
  '#52B788', // Green
  '#E76F51', // Coral
  '#2A9D8F', // Dark Teal
];

/**
 * Generate a random room ID
 */
function generateRoomId() {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

/**
 * Get a user color based on index
 */
function getUserColor(index) {
  return USER_COLORS[index % USER_COLORS.length];
}

/**
 * Get all users in a room
 */
function getRoomUsers(rooms, roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.values());
}

/**
 * Get room statistics
 */
function getRoomStats(rooms) {
  return {
    totalRooms: rooms.size,
    totalUsers: Array.from(rooms.values()).reduce((acc, room) => acc + room.size, 0),
    rooms: Array.from(rooms.entries()).map(([roomId, users]) => ({
      roomId,
      userCount: users.size,
      users: Array.from(users.values()).map(u => ({
        id: u.id,
        username: u.username,
        joinedAt: u.joinedAt
      }))
    }))
  };
}

/**
 * Clean up empty rooms
 */
function cleanupEmptyRooms(rooms, roomMetadata) {
  const emptyRooms = [];

  rooms.forEach((users, roomId) => {
    if (users.size === 0) {
      rooms.delete(roomId);
      roomMetadata.delete(roomId);
      emptyRooms.push(roomId);
    }
  });

  return emptyRooms;
}

/**
 * Validate room ID format
 */
function isValidRoomId(roomId) {
  return typeof roomId === 'string' &&
    roomId.length > 0 &&
    roomId.length < 100 &&
    /^[a-zA-Z0-9-_]+$/.test(roomId);
}

/**
 * Sanitize username
 */
function sanitizeUsername(username) {
  if (!username || typeof username !== 'string') {
    return `Guest-${Date.now()}`;
  }

  const sanitized = username
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 50);

  return sanitized || `Guest-${Date.now()}`;
}

/**
 * Get room metadata summary
 */
function getRoomMetadata(rooms, roomMetadata, roomId) {
  const room = rooms.get(roomId);
  const metadata = roomMetadata.get(roomId);

  if (!room) return null;

  return {
    roomId,
    userCount: room.size,
    users: getRoomUsers(rooms, roomId),
    createdAt: metadata?.createdAt,
    createdBy: metadata?.createdBy
  };
}

module.exports = {
  USER_COLORS,
  generateRoomId,
  getUserColor,
  getRoomUsers,
  getRoomStats,
  cleanupEmptyRooms,
  isValidRoomId,
  sanitizeUsername,
  getRoomMetadata
};
