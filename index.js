const express = require('express')
const http = require('http');
const { connect } = require('http2');
const mysql = require('mysql');
const app = express()
const server = http.createServer(app)
const { Server } = require('socket.io')

const io = new Server(server)

const connection = mysql.createConnection({
    host: 'localhost'
    , database: 'app-chat'
    , user: 'root'
    , password: ''
});
connection.connect();


app.get('/:id', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})


app.get('/friends', (req, res) => {
    res.sendFile(__dirname + '/friend.html')
})

let users = [];
let friends = [];

io.on('connection', (socket) => {
    console.log('user connected')

    socket.on('user_connected', data => {
        connection.query("UPDATE users SET socket_id = '" + socket.id + "' WHERE name = '" + data.user_name + "'");
        connection.query("SELECT * FROM users", function (err, result) {
            users = [];
            result.forEach(element => {
                users.push(element);
                if (element.name === data.user_name) {
                    connection.query("SELECT * FROM (SELECT friends.user_send, friends.user_recieved, friends.status, users.* FROM friends, users WHERE friends.user_send = users.id) A WHERE A.user_recieved = " + element.id, function (err, result) {
                        socket.emit('load_friends_table', result);
                    })
                }
            });
            io.emit('load_users_table', users);
        });
    });

    socket.on('friend-request', data => {
        connection.query("SELECT * FROM friends WHERE user_recieved = " + data.received_id + " AND user_send = " + data.send_id, function (err, result) {
            if (result.length === 0) {
                connection.query("SELECT * FROM friends WHERE user_recieved = " + data.send_id + " AND user_send = " + data.received_id, function (err, result) {
                    if (result.length === 0) {
                        connection.query("INSERT INTO friends (user_send, user_recieved, status) VALUES ("
                            + data.send_id + ", " + data.received_id + ", 0)");

                        connection.query("SELECT * FROM (SELECT friends.user_send, friends.user_recieved, friends.status, users.* FROM friends, users WHERE friends.user_send = users.id) A WHERE A.user_recieved = " + data.received_id, function (err, result) {
                            io.to(data.received_socket_id).emit('load_friends_table', result);
                        })

                        io.to(data.received_socket_id).emit('notification', data.send_name + " send you a friend request");
                    }
                })
            }
        })
    });

    socket.on('accept-request', data => {
        connection.query("UPDATE friends SET status = 1 WHERE user_recieved = " + data.received_id + " AND user_send = " + data.send_id, function (err, result) {
            connection.query("SELECT * FROM (SELECT friends.user_send, friends.user_recieved, friends.status, users.* FROM friends, users WHERE friends.user_send = users.id) A WHERE A.user_recieved = " + data.received_id, function (err, result) {
                socket.emit('load_friends_table', result);
            })
        });
        //console.log("UPDATE friends SET status = 1 WHERE user_recieved = " + data.received_id + " AND user_send = " + data.send_id);

        // connection.query("SELECT * FROM friends WHERE user_recieved = " + data.received_id, function (err, result) {
        //     io.to(data.received_socket_id).emit('load_friends_table', result);
        // })
        io.to(data.send_socket_id).emit('notification', data.received_name + " accept your request");
    });

})

server.listen(3000, () => {
    console.log('listening on port 3000')
})