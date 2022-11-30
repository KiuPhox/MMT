const express = require("express");
const path = require("path")
const http = require('http');
const mysql = require("mysql");
const app = express();
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const cookieParserIo = require('socket.io-cookie-parser');
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

io.use(cookieParserIo());



app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'html');
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("MYSQL CONNECTED")
    }
})
// Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

io.on('connection', async (socket) => {
    console.log('a user connected');

    const decoded = await promisify(jwt.verify)(socket.request.cookies.userSave,
        process.env.JWT_SECRET
    );

    db.query("UPDATE users SET socket_id = '" + socket.id + "' WHERE id = " + decoded.id);
    db.query("SELECT * FROM users", function (err, result) {
        users = [];
        result.forEach(element => {
            users.push(element);
            if (element.socket_id === socket.id) {
                db.query("SELECT * FROM (SELECT friends.user_send, friends.user_recieved, friends.status, users.* FROM friends, users WHERE friends.user_send = users.id) A WHERE A.user_recieved = " + element.id, function (err, result) {
                    socket.emit('load_friends_table', result);
                })
            }
        });

        io.emit('load_users_table', users);
    });


    socket.on('friend-request', data => {

        db.query("SELECT * FROM friends WHERE user_recieved = " + data.received_id + " AND user_send = " + data.send_id, function (err, result) {
            if (result.length === 0) {

                db.query("SELECT * FROM friends WHERE user_recieved = " + data.send_id + " AND user_send = " + data.received_id, function (err, result) {
                    if (result.length === 0) {
                        db.query("INSERT INTO friends (user_send, user_recieved, status) VALUES ("
                            + data.send_id + ", " + data.received_id + ", 0)");
                        console.log("a");
                        db.query("SELECT * FROM (SELECT friends.user_send, friends.user_recieved, friends.status, users.* FROM friends, users WHERE friends.user_send = users.id) A WHERE A.user_recieved = " + data.received_id, function (err, result) {
                            io.to(data.received_socket_id).emit('load_friends_table', result);

                        })

                        io.to(data.received_socket_id).emit('notification', data.send_name + " send you a friend request");
                    }
                })
            }
        })
    });

    socket.on('accept-request', data => {
        db.query("UPDATE friends SET status = 1 WHERE user_recieved = " + data.received_id + " AND user_send = " + data.send_id, function (err, result) {
            db.query("SELECT * FROM (SELECT friends.user_send, friends.user_recieved, friends.status, users.* FROM friends, users WHERE friends.user_send = users.id) A WHERE A.user_recieved = " + data.received_id, function (err, result) {
                socket.emit('load_friends_table', result);

            })
        });
        //console.log("UPDATE friends SET status = 1 WHERE user_recieved = " + data.received_id + " AND user_send = " + data.send_id);

        // connection.query("SELECT * FROM friends WHERE user_recieved = " + data.received_id, function (err, result) {
        //     io.to(data.received_socket_id).emit('load_friends_table', result);
        // })
        io.to(data.send_socket_id).emit('notification', data.received_name + " accept your request");
    });

    socket.on('joining room', data => {
        db.query("SELECT * FROM users WHERE id = " + decoded.id, function (err, result) {
            io.emit('chat message', { message: result[0].name + " joined the chat", type: "join" })
            io.to(socket.id).emit('set_user_name', result[0].name);
        });
    });

    socket.on('chat message', data => {
        socket.broadcast.emit('chat message', { message: data.message, type: "other", name: data.name });         //sending message to all except the sender
    });
});

server.listen(5000, () => {
    console.log('listening on :5000');


});
