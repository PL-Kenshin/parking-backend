const express = require("express")
const app = express()
const cors = require("cors")
const http = require('http').Server(app);
const config = require('./config').config;
const items = require('./config').items;
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});
const mongoose = require('mongoose')
const mongo = require('./service/mongo')
const parkingSpaceSchema = require('./schema/parkingSpaceSchema')
const jwt = require('jsonwebtoken');
const userSchema = require("./schema/userSchema");
const passwordHash = require('password-hash');

app.use(cors())

process.on('SIGINT', () => {
    mongoose.connection.close(function () {
        console.error('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

socketIO.on('connection', (socket) => {
    console.log(`${socket.id} user just connected!`)

    socket.on("getParking", async (callback) => {
        try {
            let parking = await parkingSpaceSchema.find().sort({ "id": 1 }).limit(20)
            callback({
                parking: parking
            })
        } catch (e) {
            console.log('error sending parking: ', e)
        }
    })

    socket.on("changeParkingStatus", async (parkingSpace, callback) => {
        try {
            await parkingSpaceSchema.findOneAndUpdate({ "id": parkingSpace.id }, { "$set": { "taken": parkingSpace.taken, "license": parkingSpace.license, "user": parkingSpace.user } })
            let parking = { id: parkingSpace.id, taken: parkingSpace.taken, license: parkingSpace.license, user: parkingSpace.user }
            socket.broadcast.emit("parkingChange", parking)
            callback({
                parking: parking
            })
        } catch (e) {
            console.log('error sending parking status change: ', e)
        }
    })

    socket.on("restart", async () => {
        try {
            await parkingSpaceSchema.updateMany({ "taken": true }, { "$set": { "taken": false, "license": "", "user": "" } })
        } catch (e) {
            console.log('error restarting parking: ', e)
        }
    })

    socket.on("signUp", async (user, callback) => {
        try {
            let isTaken = await userSchema.findOne({ "username": user.username }).count() > 0 ? true : false
            if (isTaken) {
                callback({
                    isTaken: isTaken
                })
            } else {
                user.password = passwordHash.generate(user.password)
                user.active = true
                user.isAdmin = false
                await userSchema.create(user)
                callback({
                    created: true
                })
            }
        } catch (e) {
            console.log('account creation error: ', e)
        }
    })

    socket.on("authenticate", async (credentials, callback) => {
        try {
            let user = await userSchema.findOne({ "username": credentials.username })
            let verified = passwordHash.verify(credentials.password, user.password)

            if (user != null && verified == true && user.active == true) {
                let token = jwt.sign(user.toJSON(), "Kokos123", { expiresIn: 10800 })
                callback({
                    isAuthenticated: true,
                    token: token
                })
            } else {
                callback({
                    isAuthenticated: false,
                    isBanned: !user.active
                })
            }
        } catch (e) {
            console.log('authentication error: ', e)
        }
    })

    socket.on('getUsers', async (callback) => {
        try {
            let userList = await userSchema.find().sort({ "username": 1 })
            callback({
                userList: userList
            })
        } catch (e) {
            console.log('error sending users: ', e)
        }
    })

    socket.on('changeUserStatus', async (user, status, callback) => {
        try {
            await userSchema.findOneAndUpdate({ "username": user.username }, { "$set": { "active": status } })
            user.active = status
            if(status == false){
                socket.broadcast.emit('userBanned', user.username)
            }
            callback({
                user: user
            })
        } catch (e) {
            console.log('error changing user status: ', e)
        }
    })


    socket.on('disconnect', () => {
        console.log('A user disconnected')
        socket.disconnect()
    });
});


http.listen(config.port, async () => {
    console.log(`Server listening on ${config.port}`);
    await mongo().then(async (mongoose) => {
        console.log('connected to database')
    })
});