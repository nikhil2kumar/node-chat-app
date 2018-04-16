const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const publicPath = path.join(__dirname, '../public');
let app = express();
const port = process.env.PORT || 3000;
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            callback('Name and room name are required.');
        }
        socket.join(params.room);

        //io.emit -> io.to().emit
        //socket.broadcast.emit -> socket.broadcast.to().emit
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat group'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} Joined`));
        callback();
    })

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