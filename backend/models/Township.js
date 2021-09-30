const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TownshipSchema = new Schema({
    name: {type: String, required: true},
    townID: {type: String, required: true},
    creator: {type: String, required: true},
    admins: {type: Object, required: true},
    members: {type: Object, required: true},
    history: Array,
    creationTime: Date,
    fluxSpent: Number,
    regionMap: Array,
    regionEvents: Object,
    regionStructures: Object,
    townMap: Array,
    townEvents: Object,
    townStructures: Object,
    npcs: Object,
    mobs: Object,
    townSize: Number,

}, { minimize: false });

module.exports = mongoose.model('Township', TownshipSchema);

/*
    Gotta brainstorm Township behavior a little more... what are we missing?

    Ok! Got the 'physical layout' in mind. Now, interactivity...
    TOWNMAP is mostly the 'underlying' attributes... road, grass, forest, whatnot. The 'state' of the land, give or take.

    STRUCTURES: {id: {}}
    -- origin (x,y) of bottom-left of each structure
    -- dimensions (x width, y width) of that struct
    -- properties
    -- appearance (need to img src/construct the visuals for buildings)
    -- upgrade/build state or data?
    -- owners: object with id keys related to each npc/player owner
    -- interactions (stuff you can do with the given structure... buy/sell/train/talk/etc.)
    
    NPCS
    -- {{}} w/key = NPC id
    -- Each NPC obj has npcID, name, gender, appearance, relationships, personality, recruitReqs, spells, techs
        -> can expand to be more dynamic and 'interesting' later
        -> recruitReqs include params to be met to be able to bring this NPC along for stuff
        -> spells & techs are what this NPC can use and/or teach, potentially, but is a little outside of alpha for now
    
    REGIONEVENTS & TOWNEVENTS
    -- special interactables that can be filtered for/booped upon
    -- raids, dungeons, building/construction, visitor(s), encampment(s)
    -- each event has a 'type' for easy filtering




*/