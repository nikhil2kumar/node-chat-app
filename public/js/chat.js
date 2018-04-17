var socket = io();
socket.on('connect', function () {
    console.log('connected to server');
});

socket.on('disconnect', function () {
    console.log('disconnected to server');
});

function scrollToBottom() {
    var messages = $('#messages');
    var newMessage = messages.children('li:last-child');

    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

socket.on('connect', function() {
    var params = $.deparam(window.location.search);

    socket.emit('join', params, function(err) {
        if(err){
            alert(err);
            window.location.href = '/';
        } else {
            console.log('No error');
        }
    })
});

socket.on('updateUserList', function(userList){
    console.log(userList);
    var ol = $('<ol></ol>');

    userList.forEach(user => {
        ol.append($('<li></li>').text(user));
    });

    $('#users').html(ol);
})

socket.on('newMessage', function (msg) {
    var formattedTime = moment(msg.createdAt).format('h:mm a');
    var template = $('#message-template').html();
    var html = Mustache.render(template, {
        text: msg.text,
        createdAt: formattedTime,
        from: msg.from
    });
    $('#messages').append(html);
    scrollToBottom();
});

socket.on('newLocationMessage', function (msg) {
    var formattedTime = moment(msg.createdAt).format('h:mm a');
    var template = $('#location-message-template').html();
    var html = Mustache.render(template, {
        url: msg.url,
        createdAt: formattedTime,
        from: msg.from
    });
    $('#messages').append(html);
    scrollToBottom();
})

$('#message-form').on('submit', function (e) {
    e.preventDefault();
    var msgTextBox = $('[name=message]');
    if (msgTextBox.val() !== '') {
        socket.emit('createMessage', {
            from: 'User',
            text: msgTextBox.val(),
            createdAt: new Date().getTime
        }, function (data) {
            msgTextBox.val('');
        });
    }
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



