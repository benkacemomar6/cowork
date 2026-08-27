const { Server } = require('socket.io');

let io = null;

function initSocket(server, corsOptions) {
    io = new Server(server, { cors: corsOptions });

    io.on('connection', (socket) => {
        console.log('socket connected:', socket.id);

        // frontend calls socket.emit('register', userId) right after login
        socket.on('register', (userId) => {
            socket.join(userId);
            console.log(`user ${userId} joined their room`);
        });

        socket.on('disconnect', () => {
            console.log('socket disconnected:', socket.id);
        });
    });

    return io;
}

// Returns null if called before initSocket() — callers should handle that
// (e.g. services exercised directly via `node -e` without booting server.js).
function getIO() {
    return io;
}

module.exports = { initSocket, getIO };
