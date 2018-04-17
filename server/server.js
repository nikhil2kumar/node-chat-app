const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { Users } = require('./utils/users');
const { isRealString } = require('./utils/validation');
const publicPath = path.join(__dirname, '../public');
let app = express();
const port = process.env.PORT || 3000;
let server = http.createServer(app);
let io = socketIO(server);

let users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
           return callback('Name and room name are required.');
        }
        params.room = params.room.toLowerCase();
        socket.join(params.room);
        if (users.getUser(socket.id)) users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList',users.getUserList(params.room));
        //io.emit -> io.to().emit
        //socket.broadcast.emit -> socket.broadcast.to().emit
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat group'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} Joined`));
        callback();
    })

    socket.on('createMessage', (msg, callback) => {
       let user = users.getUser(socket.id);
       if(user && isRealString(msg.text)){
        io.to(user.room).emit('newMessage', generateMessage(user.name, msg.text));
        callback();
       }        
    });

    socket.on('createLocationMessage', (coords) => {
        let user = users.getUser(socket.id);
        if(user){
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longititude));
        }       
    })

    socket.on('disconnect', () => {
        let user = users.removeUser(socket.id);
        if(user){
            io.to(user.room).emit('updateUserList',users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`));
        }        
    });
});

server.listen(port, () => {
    console.log(`App is running at server ${port}`);
});