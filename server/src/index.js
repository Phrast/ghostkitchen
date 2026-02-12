const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { PORT } = require('./config/env');
const { setupSocket } = require('./socket/socketHandler');

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: 'http://localhost:5173' },
});

setupSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
