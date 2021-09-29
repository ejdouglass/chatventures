const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socketIo = require('socket.io');
const mongoose = require('mongoose');
// const Character = require('./models/Character');
const User = require('./models/User');
// const bodyParser = require('body-parser');
// const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:8081',
        methods: ['GET', 'POST']
    }
});

let chats = {};
let users = {};

function rando(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function generateRandomID() {
    let dateSeed = new Date();
    let randomSeed = Math.random().toString(36).replace('0.', '');
    // console.log(`Random Seed result: ${randomSeed}`);
    return dateSeed.getMonth() + '' + dateSeed.getDate() + '' + dateSeed.getHours() + '' + dateSeed.getMinutes() + '' + dateSeed.getSeconds() + '' + randomSeed;
}

const connectionParams = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
};

// NOTE: DB_HOST in this case is not set up properly yet, so... don't use this server yet :P
mongoose.connect(process.env.DB_HOST, connectionParams)
    .then(() => console.log(`Successfully connected to Goalin Girls database. That'll come in handy!`))
    .catch(err => console.log(`Error connecting to Goalin Girls database: ${err}`));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.json());
app.use(express.urlencoded({extended: false}));

