const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
let app = express();
const port = process.env.PORT || 3000;
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.emit('newMessage',{
        from: 'nikhil@er.com',
        text: 'new msg',
        createdAt: 456
    });

    socket.on('createMessage', (msg) => {
        console.log('New sg created by client', msg);
    });

    socket.on('disconnect', () => {
        console.log('disconnected to client');
    });
});

server.listen(port, () => {
    console.log(`App is running at server ${port}`);
});