const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const publicPath = path.join(__dirname, '../public');
let app = express();
const port = process.env.PORT || 3000;
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat group'));
    socket.broadcast.emit('newMessage', generateMessage('Admin', 'New User Joined'));

    socket.on('createMessage', (msg, callback) => {
        console.log('New msg created by client', msg);
        io.emit('newMessage', generateMessage(msg.from, msg.text));
        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longititude));
    })

    socket.on('disconnect', () => {
        console.log('disconnected to client');
    });
});

server.listen(port, () => {
    console.log(`App is running at server ${port}`);
});