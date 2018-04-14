var socket = io();
socket.on('connect', function() {
    console.log('connected to server');

    socket.emit('createMessage',{
        to: 'am@er.com',
        text: 'new msg to am',
        createdAt: 258
    });
});

socket.on('disconnect', function() {
    console.log('disconnected to server');
});

socket.on('newMessage', function(msg) {
    console.log('Msg received', msg)
});