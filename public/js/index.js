var socket = io();
socket.on('connect', function () {
    console.log('connected to server');
});

socket.on('disconnect', function () {
    console.log('disconnected to server');
});

socket.on('newMessage', function (msg) {
    console.log(msg);
    var li = $('<li></li>');
    li.text(`${msg.from}: ${msg.text}`);

    $('#messages').append(li);
});

socket.on('newLocationMessage', function (msg) {
    var li = $('<li></li>');
    var a = $('<a target="_blank">My Curent Location</a>');

    li.text(`${msg.from}: `);
    a.attr('href', msg.url);
    li.append(a);
    $('#messages').append(li);
})

$('#message-form').on('submit', function (e) {
    e.preventDefault();

    socket.emit('createMessage', {
        from: 'User',
        text: $('[name=message]').val(),
        createdAt: new Date().getTime
    }, function (data) {
        console.log(data);
    });
});

var locationButton = $('#send-location');
locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported');
    }

    navigator.geolocation.getCurrentPosition(function (position) {
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longititude: position.coords.longitude
        })
    }, function () {
        alert('Unable to fetch location');
    });

})



