const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {type: String, required: true},
    gender: String,
    appearance: Object,
    userID: {type: String, required: true},
    salt: {type: String, required: true},
    hash: {type: String, required: true},
    classes: Object,
    combatTarget: String,
    inspectTarget: String,
    playState: String,
    appState: String,
    stats: {type: Object, required: true},
    spells: Object,
    techs: Object,
    effects: Array,
    perks: Object,
    achievements: Object,
    achieveMetrics: Object,
    lastLoginDate: String,
    memories: Array,
    vault: Array,
    privacy: String,
    connections: Object,
    activeChat: String, // id of township/chat being stared at currently, if applicable
    townships: Object,
    chats: Object
}, { minimize: false });

module.exports = mongoose.model('User', UserSchema);

/*
    TO ADD:
    -- flux and flux regen logic support


    DECONSTRUCT:
    townships: {
        TOWNSHIP_ID_0001: {
            currentScript: undefined -OR- {},
            equipped: {head: undefined, body: undefined, rightHand: undefined, leftHand: undefined, accessory: undefined, trinket: undefined},
            inventory: [],
            currency: 0,
            class: CLASSNAME,
            fluxSpent: ___,
            bookmark: undefined // miiiight add this? -- basically if someone is within an in-township event, we can "bookmark" it here for referencing
        }
    }
*/