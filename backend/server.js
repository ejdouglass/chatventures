const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socketIo = require('socket.io');
const mongoose = require('mongoose');
// const Character = require('./models/Character');
const User = require('./models/User');
const Township = require('./models/Township');
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

let allTownships = {}; // keys are townshipIDs
let allChats = {};
let allUsers = {}; // keys are usernames, as they are protected and unique

function rando(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function generateRandomID(prefix) {
    prefix = prefix ? prefix : 'rnd';
    let dateSeed = new Date();
    let randomSeed = Math.random().toString(36).replace('0.', '');
    // console.log(`Random Seed result: ${randomSeed}`);
    return prefix + dateSeed.getMonth() + '' + dateSeed.getDate() + '' + dateSeed.getHours() + '' + dateSeed.getMinutes() + '' + dateSeed.getSeconds() + '' + randomSeed;
}

function calcDateKey(date) {
    // Returns MM/DD/YYYY, adding a leading '0' where necessary, i.e. 03/07/2021 ; assumes 'today' if no specific date is passed as param
    let dateToKey = date ? date : new Date();
    let monthKey = dateToKey.getMonth() + 1;
    let dateKey = dateToKey.getDate();
    let yearKey = dateToKey.getFullYear();

    return `${(monthKey < 10 ? `0` + monthKey : monthKey)}/${(dateKey < 10 ? `0` + dateKey : dateKey)}/${yearKey}`;
}

function createSalt() {
    return crypto.randomBytes(20).toString('hex');
}

function createHash(password, salt) {
    password = password.length && typeof password === 'string' ? password : undefined;

    if (password && salt) {
        let hash = crypto
            .createHmac('sha512', salt)
            .update(password)
            .digest('hex');

        return hash;
    } else {
        return null;
    }
}

function craftAccessToken(username, id) {
    return jwt.sign({ name: username, userID: id }, process.env.SECRET, { expiresIn: '7d' });
}

function saveUser(user) {
    const filter = { name: user.name };
    const update = { $set: user };
    const options = { new: true, useFindAndModify: false };
    User.findOneAndUpdate(filter, update, options)
        .then(updatedResult => {
            console.log(`${updatedResult.name} has been saved and updated in the database.`);
            // HERE might be a good spot to do the server-user update? user[updatedResult.userID]... though, we'd be pulling stuff we don't want to share, hm
            // nevermind, just do it below
        })
        .catch(err => {
            console.log(`We encountered an error saving the user: ${err}.`);
        });
    
    // we don't need to update the server version of the user in this case of this function being invoked;
    // the server-side character is changed first and passed into this fxn
}

// HERE: saveTownship function, similar to above; like above, takes the full township entry/entity
function saveTownship(township) {
    const filter = { townID: township.townID };
    const update = { $set: township };
    const options = { new: true, useFindAndModify: false };
    Township.findOneAndUpdate(filter, update, options)
        .then(updatedResult => {
            console.log(`${updatedResult.name} has been updated.`);
        })
        .catch(err => {
            console.log(`We encountered an error saving the user: ${err}.`);
        });    
}

function saveNewTownship(township) {
    // we'll set this up if the above doesn't work for a brand-new township
}

io.on('connection', (socket) => {
    let thisUser;
    socket.on('login', userJWT => {
        const decodedUserName = jwt.verify(userJWT, process.env.SECRET).name;
        thisUser = allUsers[decodedUserName];
        // console.log(`Someone has socket-logged-in: ${thisUser.name}. Hi!`);
        if (!thisUser) {
            console.log(`Uh oh. Someone logged in but that user doesn't seem to exist. That can't be good.`);
        }
        // HERE: all imaginable socket.join(SOCKETNAME) goes here
        // Include: personal name socket, all their chats/townships, zenithica of course, ...
        socket.join(thisUser.name);
        Object.keys(thisUser.townships).forEach(townID => {
            socket.join(townID);
        });
        console.log(`${thisUser.name} has joined the game.`);
        
        // HERE: go through all their townships, socket.join their ids, and then zip through their history to get 'unread badge' figures
        // Obviously if a township doesn't have a 'lastVisitTimestamp' variable tagged on it yet, dodge around it and define it later when appropriate
    });

    socket.on('data_from_client', data => {
        // console.log(`Received something from the client: ${JSON.stringify(data)}`);
        // console.log(`AT THIS STAGE I BELIEVE THISUSER LOOKS LIKE THIS: ${thisUser}`);
        if (thisUser === undefined || thisUser.name === undefined) {
            const decodedUserName = jwt.verify(data.token, process.env.SECRET).name;
            thisUser = allUsers[decodedUserName];
        }
        switch (data.event) {
            case 'view_township': {
                // ADD: logic for only passing down the messages the user -should- see, based on how long they've been a member
                // essentially, take the initial township obj, then tweak the history
                // the client can handle parsing what's "new" for the township chat
                allUsers[thisUser.name].activeTownship = data.townshipID;
                console.log(`${allUsers[thisUser.name].name} has changed their active viewing to township with id ${data.townshipID}.`)
                // going to hold off on saving the user's current township for now
                return socket.emit('township_view_data', allTownships[data.townshipID]);
            }
            case 'unview_township': {
                return allUsers[thisUser.name].activeTownship = 'none';
            }
            case 'create_township': {
                // THIS: check to see if name available; if NO, return alert, if YES, create and return alert & instructions to client-nav into new township
                // AKSHULLY, we can just piggyback on that township_view_data above instead of creating a new socket event
                Object.keys(allTownships).forEach(keyID => {
                    if (allTownships[keyID].name.toLowerCase() === data.township.name.toLowerCase()) return socket.emit('alert', `WHOOPS-E-DOODLE`);
                });

                // HERE: gotta do some finagling to set up the initial township details based on the initially provided data plus random shenanigans
                //      ...ultimately, make a fxn whose job is to create a glorious township obj with its own personality and then sail away from there


                console.log(`New township with name ${data.township.name} is being generated!`);
                let newTownship = new Township({
                    name: data.township.name,
                    townID: generateRandomID('twn'),
                    creator: thisUser.name,
                    admins: {},
                    members: {},
                    townStructures: {},
                    privacy: data.township.privacy
                });
                const newTownDate = new Date();
                newTownship.admins[thisUser.name] = {};
                newTownship.members[thisUser.name] = {joined: newTownDate, status: 'admin'};
                Object.keys(data.township.invitees).forEach(invitee => {
                    newTownship.members[invitee] = {status: 'invitee', joined: newTownDate};
                });
                newTownship.townStructures.townSquare = {
                    name: 'Town Square',
                    location: undefined,
                    type: undefined,
                    mods: undefined
                };
                newTownship.townStructures.generalStore = {
                    name: 'General Store',
                    location: undefined,
                    type: undefined,
                    mods: undefined,
                    stock: []
                };
                newTownship.townStructures.tavern = {
                    name: 'Tavern',
                    location: undefined,
                    type: undefined,
                    mods: undefined,
                    stock: [],
                    patrons: []
                };
                newTownship.townStructures.scoutsTent = {
                    name: `Scouts' Tent`,
                    location: undefined,
                    type: undefined,
                    mods: undefined,
                    provisions: [],
                    map: {},
                };
                newTownship.townStructures.stockpile = {
                    name: 'Stockpile',
                    location: undefined,
                    type: undefined,
                    mods: undefined,
                    inventory: {
                        capacity: 500,
                        wood: 10,
                        hardwood: 0,
                        heartwood: 0,
                        rock: 10,
                        bedrock: 0,
                        water: 10,
                        herbs: 0,
                        iron: 0,
                        coal: 0
                    }
                };

                // WHOOPS: gotta add the freshly created township to the creator's list of townships (after save, probably)...
                // ALSO: gotta update everyone that's receiving an INVITE, crunking up their TOWNSHIPS by 1
                //  ... consider: when it's JUST an invite, allow viewing and "ACCEPT," which allows chatting but not playing?

                newTownship.save()
                    .then(createdTownship => {
                        allTownships[createdTownship.townID] = createdTownship;
                        // The township already has records of all members and potential members; below adds references to the township to the users themselves
                        allUsers[thisUser.name].townships[createdTownship.townID] = {
                            status: 'admin',
                            joined: newTownDate,
                            townID: createdTownship.townID,
                            name: createdTownship.name
                        };
                        Object.keys(createdTownship.members).forEach(memberName => {
                            if (memberName !== thisUser.name) allUsers[memberName].townships[createdTownship.townID] = {
                                status: 'invitee', 
                                joined: newTownDate,
                                townID: createdTownship.townID,
                                name: createdTownship.name,
                                history: [],
                                unreadTotal: 0,
                                lastViewTS: newTownDate
                            };
                            saveUser(allUsers[memberName]);
                            // HERE: socket.emit updated user data to this memberName target
                            // use the actions.LOAD_CHARACTER dispatch on the front-ent
                            io.to(memberName).emit('update_user', allUsers[memberName]);
                            // io.to(memberName).emit('console_message', `Hi, you should have received new user data for a TOWNSHIP CREATION event.`);
                        });
                        // ALSO: gotta socket to everybody involved to give them fresh data... can loop through MEMBERS for that

                        socket.emit('alert', `Created a new township.`);
                        allUsers[thisUser.name].activeTownship = createdTownship.townID;
                        return socket.emit('township_view_data', allTownships[createdTownship.townID]);
                    })
                    .catch(err => {
                        return console.log(err);
                    });
        
                
                // for safety, it would behoove us to scoot townID out, generate it, ensure it is UNIQUE, and *then* get to saving                


                /*

                    FIRST PASS: just make the thing; add nuance later

                    township creation: we're getting an object, data.township, with {name, privacy, invitees}
                    - invitees is an object whose keys are usernames

                    we then need to fill out any other township-required info and generate the township/region specs
                    -- REQUIRED: name, townID, creator (string), admins (object), members (object), privacy (data.township.privacy)
                    -- also populate: history (array), creationTime (date), 

                    -- townMap and regionMap are both objects which can include coord keys containing tileset data, as well as townMap.size and other variables
                    -- townStructures can hold the data for interactivity data for structs; townMap can hold image and reference data for said structs

                    -- mods is a new entry that gives, as expected, mods to stuff like lumber yield, healing rate, or whatever else

                    -- STARTING STRUCTS
                        - General Store: weapons, armor, items, tools
                            {stock, mods}
                        - Town Square: announcements, quests, township info, guest NPC's/caravan/merchants
                            {announcements, quests, info, visitors, mods}
                        - Tavern: hang out, traveling NPC's
                            {stock, patrons, mods}
                        - Scouts' Tent: basic healing, basic provisions, scouting info
                            {provisions, map, mods}
                        - Stockpile: building materials, equipment for NPC's
                            {wood, hardwood, heartwood, rock, bedrock, water, herbs, iron, coal}

                    
                */
            }
            case 'request_invitees_list': {
                // since we haven't yet defined 'privacy' and connections, for now, this just blanket grabs every valid user :P
                let validInviteesArray = [];
                Object.keys(allUsers).forEach(userKey => {
                    if (allUsers[userKey] && userKey !== thisUser.name) {
                        validInviteesArray.push(userKey);
                    }
                });
                return socket.emit('invitees_list_data', validInviteesArray);
            }
            case 'send_text_message': {
                // receiving: data.message, data.townID
            
                let rightNow = new Date();
                let historyObj = {
                    timestamp: rightNow,
                    agent: thisUser.name,
                    type: 'message',
                    echo: data.message,
                };
                allTownships[data.townID].history.push(historyObj);
                allTownships[data.townID].lastActivityTS = rightNow;
                saveTownship(allTownships[data.townID]);

                console.log(`BACKEND BEEP BOOP. Interacting with townID ${data.townID}.`);
                console.log(`HEY. This township's members looks like this: ${JSON.stringify(allTownships[data.townID].members)}`)
                Object.keys(allTownships[data.townID].members).forEach(memberName => {
                    console.log(`BACKEND BOOP BEEP. Interacting with member ${memberName}.`);
                    console.log(`This member's current activeTownship is ${allUsers[memberName].activeTownship}.`);
                    if (allUsers[memberName].activeTownship === undefined) allUsers[memberName].activeTownship = 'none';
                    if (allUsers[memberName].activeTownship === data.townID) {
                        console.log(`This member is ACTIVELY IN THE CHAT, so we're handling that...`)
                        // HERE: handle sending client data for user who is currently viewing this township with 'current_township_update' -- update ref with rightNow lastview, pass new history item to be viewed
                        allUsers[memberName].townships[data.townID].lastViewTS = rightNow;
                        // BRUTE FORCE MODE: just for testing, just gonna go ahead and slap the user with the entire new township
                        // can (should) add nuance later :P
                        io.to(memberName).emit('township_view_data', allTownships[data.townID]);

                        // MYSTERY: we both get an ERROR and a SUCCESS right around here? eh?
                        return saveUser(allUsers[memberName]);
                    }
                    // HERE: handle updating user's reference to the township, update their unreadTotal, then send down 'unread_township_update' info
                    console.log(`This member isn't currently in the chat, so we're handling background adjustments.`);
                    allUsers[memberName].townships[data.townID].unreadTotal += 1;
                    return saveUser(allUsers[memberName]);
                });
                
                // hm, sort out making sure user's township refs are core refs, and all MAIN township data such as history contents are in the townships themselves
                // for non-current townships, just have to loop through and add to unreadTotal
                // for current township, 
                // changed 'lastActivityTS' for user into 'unreadTotal,' can just loop and increment for all currently non-viewed

                return;
            }
        }
        // HERE: probably a switch to check data.type - switch (data.type)

    });    

    socket.on('test_message', message => {
        console.log(`A client sent this message: ${message}`);
    });

    socket.on('view_township', townshipRequestObj => {
        const { token, townshipID } = townshipRequestObj;
        

        // ADD: check to make sure townshipID exists before responding to client
        socket.emit('township_view_data', allTownships[townshipID]);
    });



    socket.on('disconnect', () => {
        // handle disconnect logic
        
    });

});

// defunct as of Mongoose 6.0+, which this project apparently uses :P
// const connectionParams = {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true
// };

// NOTE: DB_HOST in this case is not set up properly yet, so... don't use this server yet :P
mongoose.connect(process.env.DB_HOST)
    .then(() => console.log(`Successfully connected to Township Chatventurers database.`))
    .catch(err => console.log(`Error connecting to Township Chatventurers database: ${err}`));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.post('/user/create', (req, res, next) => {
    let { newUser } = req.body;
    console.log(`I have received this newUser: ${JSON.stringify(newUser)}`)

    // We'll set all stats to 15 if we either A) don't receive stats from client or B) total stat number doesn't add up to the 'proper' amount
    // strength+dexterity+vitality+willpower+intelligence+wisdom+spirit = 7 * 15 = 105 total
    let nuStats = newUser.stats;
    if (nuStats.strength === undefined || (nuStats.strength + nuStats.dexterity + nuStats.vitality + nuStats.willpower + nuStats.intelligence + nuStats.wisdom + nuStats.spirit !== 105)) {
        nuStats.strength = 15;
        nuStats.dexterity = 15;
        nuStats.vitality = 15;
        nuStats.willpower = 15;
        nuStats.intelligence = 15;
        nuStats.wisdom = 15;
        nuStats.spirit = 15;
    }
    
    console.log(`Test 1... receiving a user called ${newUser.name} to attempt to create on the backend.`);
 
    // HERE: Make sure newUser.name isn't yet taken (scan DB in characters collection)
    User.findOne({ name: newUser.name })
        .then(searchResult => {
            if (searchResult === null) {
                console.log(`Character name of ${newUser.name} is available! Creating...`);
                const salt = createSalt();
                const hash = createHash(newUser.password, salt);
                let createdUser = new User({
                    name: newUser.name,
                    salt: salt,
                    hash: hash,
                    userID: generateRandomID('usr'),
                    stats: nuStats,
                    townships: {}
                    // HERE, at some point: generate at least a static icon for their character, or iconSheet to animate from
                });
                createdUser.townships['zenithica'] = allTownships['zenithica'];

                createdUser.save()
                    .then(freshUser => {
                        
                        const token = craftAccessToken(freshUser.name, freshUser.userID);
                        let userToLoad = JSON.parse(JSON.stringify(freshUser));
                        userToLoad.appState = 'home';
                        delete userToLoad.salt;
                        delete userToLoad.hash;
                        allUsers[userToLoad.name] = userToLoad;
                        allTownships['zenithica'].members[userToLoad.name] = allUsers[userToLoad.name];
                        // userToLoad.whatDo = 'dashboard';

                        // Can pop a new alert down in the client based off the ECHO here, so we can change that a bit for nuance
                        res.status(200).json({success: true, echo: `${userToLoad.name} is up and ready to go.`, payload: {user: userToLoad, token: token}});
                    })
                    .catch(err => {
                        res.json({success: false, echo: `Something went wrong attempting to save the new character: ${JSON.stringify(err)}`});
                    })
            } else {
                // Name is unavailable! Share the sad news. :P
                res.json({success: false, echo: `That Character Name is already in use. Please choose another.`});
            }
        })
        .catch(err => {
            console.log(err);
            res.json({sucess: false, echo: JSON.stringify(err)});
        });

});

app.post('/user/login', (req, res, next) => {
    if (req.body.userToken !== undefined) {
        const { userToken } = req.body;
        console.log(`Receiving request to log in with a JWT. Processing.`);

        // HERE: handle token login
        const decodedToken = jwt.verify(userToken, process.env.SECRET);
        const { name, userID } = decodedToken;

        // console.log(`It appears we're searching for a user by the name of ${name} and id ${userID}.`);
        User.findOne({ name: name, userID: userID })
            .then(searchResult => {
                if (searchResult === null) {
                    // HERE: handle no such character now
                    console.log(`No such user found. 406 error reported.`);
                    res.status(406).json({type: `failure`, echo: `No such username exists yet. You can create them, if you'd like!`});
                } else {
                    // Token worked! Currently we make a brand-new one here to pass down, but we can play with variations on that later
                    const token = craftAccessToken(searchResult.name, searchResult.userID);
                    const userToLoad = JSON.parse(JSON.stringify(searchResult));
                    delete userToLoad.salt;
                    delete userToLoad.hash;
                    userToLoad.appState = 'home';
                    // if (characters[userToLoad.entityID] !== undefined) characters[userToLoad.entityID].fighting = {main: undefined, others: []};
                    // const alreadyInGame = addCharacterToGame(userToLoad);

                    // if (alreadyInGame) res.status(200).json({type: `success`, echo: `Reconnecting to ${userToLoad.name}.`, payload: {character: characters[userToLoad.entityID], token: token}})
                    // else res.status(200).json({type: `success`, echo: `Good news everyone! ${userToLoad.name} is ready to play.`, payload: {character: userToLoad, token: token}});

                    // console.log(`BACKEND IS LOADING AND SENDING THIS USER DATA: ${JSON.stringify(userToLoad)}`)
                    res.status(200).json({type: `success`, echo: `Good news everyone! ${userToLoad.username} is ready to play.`, payload: {user: userToLoad, token: token}});

                }


            })
            .catch(err => {
                console.log(`Someone had some difficulty logging in with a token: ${err}`);
                res.status(406).json({type: `failure`, echo: `Something went wrong logging in with these credentials.`});
            })        
    }

    if (req.body.userCredentials !== undefined) {
        const { userCredentials } = req.body;
        console.log(`Someone is attempting to log in with these credentials: ${JSON.stringify(userCredentials)}`);

        // HERE: handle credentials login: take userCredentials.charName and userCredentials.password and go boldly:

        User.findOne({ name: userCredentials.name })
            .then(searchResult => {
                if (searchResult === null) {
                    // HERE: handle no such character now
                    res.status(406).json({type: `failure`, echo: `No such character exists yet. You can create them, if you'd like!`});
                } else {
                    let thisHash = createHash(userCredentials.password, searchResult.salt);
                    if (thisHash === searchResult.hash) {
                        // Password is good, off we go!
                        const token = craftAccessToken(searchResult.name, searchResult.userID);
                        let userToLoad = JSON.parse(JSON.stringify(searchResult));
                        delete userToLoad.salt;
                        delete userToLoad.hash;
                        // userToLoad.whatDo = 'dashboard';

                        // This will probably only work a small subset of times, actually; socket disconnection removes the char from the game
                        // const alreadyInGame = addCharacterToGame(charToLoad);

                        // if (alreadyInGame) res.status(200).json({type: `success`, message: `Reconnected to live character.`, payload: {character: characters[charToLoad.entityID], token: token}})
                        // else res.status(200).json({type: `success`, message: `Good news everyone! ${charToLoad.name} is ready to play.`, payload: {character: charToLoad, token: token}});
                        res.status(200).json({type: `success`, echo: `Good news everyone! ${userToLoad.name} is ready to play.`, payload: {user: userToLoad, token: token}});                        


                    } else {
                        // Password is incorrect, try again... if THOU DAREST
                        res.status(401).json({type: `failure`, echo: `The supplied password is incorrect.`});
                    }
                }


            })
            .catch(err => {
                console.log(`Someone had some difficulty logging in: ${err}`);
                res.status(406).json({type: `failure`, message: `Something went wrong logging in with these credentials.`});
            })
    }
});

const PORT = process.env.PORT;

Township.find()
    .then(allAppTownships => {
        for (const township in allAppTownships) {
            // Updated allUsers above, and then adjusted below to match; test later to ensure all townships load properly
            allTownships[allAppTownships[township].townID] = allAppTownships[township];
        }

        // HERE: allTownships[0] should be Zenithica, so if it isn't populated for some reason, init it here AND save it
        if (allTownships['zenithica'] === undefined) {
            console.log(`Server indicates Zenithica is currently A COMPLETE FIGMENT OF IMAGINATION. We should probably fix that...`);
            
            allTownships['zenithica'] = {
                name: 'Zenithica',
                townID: 'zenithica',
                creator: 'Dog',
                admins: 'Dog',
                members: {},
                history: [],
                creationTime: new Date(),
                fluxSpent: 0,
                regionMap: [],
                regionEvents: {},
                regionStructures: {},
                townMap: [],
                townEvents: {},
                townStructures: {}, // can set up first 'shops' and training and such here
                npcs: {},
                mobs: {},
                townSize: 9999,
            }
            // HERE, steps: 
            // 1) create all the basic variables Zenithica should have to function properly via allTownshops[0] = {...}
            // 2) manually save the township into the DB (the saveTownship fxn requires the township to previously exist),
            //  - OR - we can make a saveNewTownship fxn to do it for us, which actually seems wise
            // 3) call saveTownship fxn appropriately
            // 4) profit?
        }

        User.find()
            .then(allAppUsers => {
                for (const user in allAppUsers) {
                    delete allAppUsers[user].salt;
                    delete allAppUsers[user].hash;
                    allUsers[allAppUsers[user].name] = allAppUsers[user];

                    if (allUsers[allAppUsers[user].name].townships === undefined) allUsers[allAppUsers[user].name].townships = {};
                    allUsers[allAppUsers[user].name].townships['zenithica'] = allTownships['zenithica'];
                    const username = allAppUsers[user].name;
                    // can later amend below if/when we add user/character birthday :P
                    allTownships['zenithica'].members[username] = {status: 'member', joined: new Date()};

                    // we can make 'special' rules for Zenithica access since it's a universal chat

                    // HERE: re-calculate what their flux 'should' be, add flux setTimeout
                    // HERE: once we have scripts rolling, scroll through their townships and figure out what the results of -those- should be, too, if applicable
                }

                // UPDATE ZENITHICA - save

                // sometimes townships get deleted; this is a first-pass attempt to control for that on loading
                // can also add a similar check on attempting to access a township that no longer exists from client
                Object.keys(allUsers).forEach(username => {
                    Object.keys(allUsers[username].townships).forEach(townID => {
                        if (allTownships[townID] === undefined) {
                            delete allUsers[username].townships[townID];
                            saveUser(allUsers[username]);
                        }
                    })
                });


                // HERE: final prep work for the app's server boot load -- tbd

                server.listen(PORT, () => console.log(`Township Chatventures is loaded and ready to play!`));

            })
            .catch(err => console.log(`Failed to start server due to error loading users: ${err}`));
    })
    .catch(err => console.log(`Failed to start server due to error loading townships: ${err}`));

// User.find()
//     .then(allAppUsers => {
//         for (const user in allAppUsers) {
//             delete allAppUsers[user].salt;
//             delete allAppUsers[user].hash;
//             allUsers[allAppUsers[user].name] = allAppUsers[user];
//             // HERE: re-calculate what their flux 'should' be, add flux setTimeout
//             // HERE: once we have scripts rolling, scroll through their townships and figure out what the results of -those- should be, too, if applicable
//         }
//         Township.find()
//             .then(allAppTownships => {
//                 for (const township in allAppTownships) {
//                     // Updated allUsers above, and then adjusted below to match; test later to ensure all townships load properly
//                     allTownships[allAppTownships[township].townID] = allAppTownships[township];
//                 }

//                 // HERE: allTownships[0] should be Zenithica, so if it isn't populated for some reason, init it here AND save it
//                 if (allTownships[0] === undefined) {
//                     console.log(`Server indicates Zenithica is currently A COMPLETE FIGMENT OF IMAGINATION. We should probably fix that...`);
//                     allTownships[0] = {
//                         name: 'Zenithica',
//                         townID: 0,
//                         creator: 'Dog',
//                         admins: 'Dog',
//                         members: 'everyone',
//                         history: [],
//                         creationTime: new Date(),
//                         fluxSpent: 0,
//                         regionMap: [],
//                         regionEvents: {},
//                         regionStructures: {},
//                         townMap: [],
//                         townEvents: {},
//                         townStructures: {}, // can set up first 'shops' and training and such here
//                         npcs: {},
//                         mobs: {},
//                         townSize: 9999,
//                     }
//                     // HERE, steps: 
//                     // 1) create all the basic variables Zenithica should have to function properly via allTownshops[0] = {...}
//                     // 2) manually save the township into the DB (the saveTownship fxn requires the township to previously exist),
//                     //  - OR - we can make a saveNewTownship fxn to do it for us, which actually seems wise
//                     // 3) call saveTownship fxn appropriately
//                     // 4) profit?
//                 }

//                 // HERE: final prep work for the app -- tbd

//                 server.listen(PORT, () => console.log(`Township Chatventures is loaded and ready to play!`));

//             })
//             .catch(err => console.log(`Failed to start server due to error loading townships: ${err}`));
//     })
//     .catch(err => console.log(`Failed to start server due to error loading users: ${err}`));


// Before letting the port listen, we want to fetch all USERS and TOWNSHIPS into live server memory.
// IF Zenithica doesn't exist... which should only be true for the very first run of the server for each major version... it needs to be populated (and saved) ASAP.