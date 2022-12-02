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
const e = require("express");
const siofu = require("socketio-file-upload");

process.env.PWD = process.cwd()

app.use(express.static(process.env.PWD + '/storage'));

io.use(cookieParserIo());


app.use(siofu.router)
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


    var uploader = new siofu();
    uploader.dir = "./storage/";
    uploader.listen(socket);

    // uploader.on("start", function (event) {
    //     let oldname = event.file.name.split('.');
    //     event.file.name = genRandomString(12) + "." + oldname[1];
    // });

    uploader.on("saved", function (event) {
        console.log(event.file.name);
    });

    const users = []

    console.log('a user connected');

    const decoded = await promisify(jwt.verify)(socket.request.cookies.userSave,
        process.env.JWT_SECRET
    );

    db.query("UPDATE users SET socket_id = '" + socket.id + "' WHERE id = " + decoded.id);
    db.query("SELECT * FROM users", function (err, result) {
        result.forEach(element => {
            users.push(element);
        });
        io.emit('load_users_list', users);
    });

    socket.on('joining room', data => {
        db.query("SELECT * FROM users WHERE id = " + decoded.id, function (err, result) {
            socket.broadcast.emit('chat message', { message: result[0].name + " joined the chat", type: "join" })
            io.to(socket.id).emit('set_user_name', result[0].name);
        });
    });

    socket.on('chat message', data => {
        if (data.type === "image") {
            socket.broadcast.emit('chat message', { message: data.message, type: "image", name: data.name });
        }
        else if (data.type === "file") {
            socket.broadcast.emit('chat message', { message: data.message, type: "file", name: data.name });
        }
        else {
            socket.broadcast.emit('chat message', { message: data.message, type: "other", name: data.name });
        }
    });

    socket.on('private message', data => {
        if (data.type === "image") {
            io.to(data.socket_id).emit('private message', { message: data.message, type: "image", socket_id: socket.id });
        }
        else if (data.type === "file") {
            io.to(data.socket_id).emit('private message', { message: data.message, type: "file", socket_id: socket.id });
        }
        else {
            io.to(data.socket_id).emit('private message', { message: data.message, socket_id: socket.id });
        }

    });

});



server.listen(3000, '0.0.0.0', () => {
    console.log('listening on :3000');
});
