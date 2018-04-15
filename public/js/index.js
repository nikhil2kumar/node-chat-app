var socket = io();
socket.on('connect', function () {
    console.log('connected to server');
});

socket.on('disconnect', function () {
    console.log('disconnected to server');
});

socket.on('newMessage', function (msg) {
    var formattedTime = moment(msg.createdAt).format('h:mm a');
    var li = $('<li></li>');
    li.text(`${msg.from} ${formattedTime}: ${msg.text}`);

    $('#messages').append(li);
});

socket.on('newLocationMessage', function (msg) {
    var formattedTime = moment(msg.createdAt).format('h:mm a');
    var li = $('<li></li>');
    var a = $('<a target="_blank">My Curent Location</a>');

    li.text(`${msg.from} ${formattedTime}: `);
    a.attr('href', msg.url);
    li.append(a);
    $('#messages').append(li);
})

$('#message-form').on('submit', function (e) {
    e.preventDefault();
    var msgTextBox = $('[name=message]');
    socket.emit('createMessage', {
        from: 'User',
        text: msgTextBox.val(),
        createdAt: new Date().getTime
    }, function (data) {
        msgTextBox.val('');
    });
});

var locationButton = $('#send-location');
locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported');
    }
    locationButton.attr('disabled', 'disabled').text('Sending location...');
    navigator.geolocation.getCurrentPosition(function (position) {
        locationButton.removeAttr('disabled').text('Send location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longititude: position.coords.longitude
        })
    }, function () {
        locationButton.removeAttr('disabled').text('Send location');
        alert('Unable to fetch location');
    });

})



