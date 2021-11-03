import React from 'react';
import { Store, SocketContext, socket } from './context';
import MainView from './pages/MainView';

export default function App() {
  return (
    <Store>
      <SocketContext.Provider value={socket}>
        <MainView />
      </SocketContext.Provider>
    </Store>
  );
}

/*
  APPWIDE SCRATCHES

  SCRATCHPAD THOUGHTS
  -- PIPS: same charging concept as before, static + bonus and dervived from base 'time cost' of moves
   -> all pips consumed on 'charge attack'; # of pips influences effects, which are in turn based on weapon/shield/etc.
  -- CHARGE 
   -> magic pips, sort of, maybe? ... decrease MP cost for magic, enhance effects of magic, or altogether unnecessary fluff? :P
   -> bar vs pips; elemental/conceptual charge icon; per-spell charging effect; some special effects (i.e. Charge Guard) add buffs/changes to charge bar behavior
  -- Simplify * 3 : got a lot going on, scale it back just enough to make it doable

  SCRATCHPAD SIMPLICITY
  -- Realistically, nobody's gonna PLAY this. :P So. ABSOLUTE TECH DEMO. Nothing more. Don't kill yourself on this -- polish LATER.
  -- The goal is to get to PRPL and FLY. And after that, GAMES! And experiences! WHOO

  -- Simplifying: character/user has ONE class equipped across all chats, one currency, one inventory

  -- Define and implement MOST BASIC FORMS:
  !) Basic chat setup and mechanics
    [x] NAME the township/chat
    [x] Add chat privacy (who can join, 'joinRule') of OPEN or PRIVATE
    [x] Add sendable join invites (from all eligible users -- connections, public users)
    [x] Use this information to actually create a new township on the server & in DB with 'standard' setup
    [x] Add ability to VIEW township using same mechanism as current 'big button Zenithica'
    [x] Add list of town structs
    [x] Add ability to send message to township
    [_] Add some visual cue for "this is a pending invite on your list here" 
    [_] Enable SEND TOWNSHIP INVITE for already-created township(s)   
    [_] Enable ACCEPT INVITE for people who are receiving chat requests
    [_] Town struct menu nav interaction logic
    [_] Structure logic for 'play' -- play screen stack(s) concept still my favorite idea for within-township menuing (for township-specific stuff)
    [_] Stat/char screens scaffolding (now 'current mode agnostic' so can be a total overlay; should be ok as long as it is a totally opaque overlay for now)
    [_] If TOKEN found, add "LOADING FROM TOKEN" feedback rather than sitting awkwardly chilling for a split second on login
    [_] Implement some useful version of state/user.activeTownship (for "...")

    ... quick HRM: for a wider screen, chat and 'map'/display stuff can coexist side-by-side, small screens will have to be 'chat-first'/full-screen when chatting
    ... also still don't have a solid idea as to where/what the displays should/will look like, so focus on that after getting the core logic working
  
  OOPS?
  -- unreadTotal defaults to NaN; 'fixed' it, but double check as to why that happens


  CoW
  -- not sure how Ling got stopped on turn 4 going into turn 5?
  -- maybe refrag @ Elena shortly before threshold turn


  
  CURRENTLY:
  -- CREATE TOWNSHIP should make a township exist, & do it with the proper credentials being assigned (and passed down to client)
  -- Generate map-wide factions, features, resources, every basic factor that allows player interaction
  -- Generate details of town (start with a small footprint, expand as you gather materials/flux/etc.)
  MAPSTUFF
  -- each square has its own data; 'meta' concept of sub-biomes might be fun eventually, but for now just dole out +/- X mountains, Y forests, etc. per map
    -> can have 'costs' attached to each 'resource' that's modified by maptype, so during generation the % chance of popping, then modded 'spread'
    -> should ensure at least 'basic levels' even in fairly extreme maps
  -- 'factions' (organized entities): orcs, ogres, trolls, muglins, spectres, dragons
    -> 'color,' 'region' (blue wood troll)
    -> basic attributes per species and per faction (wiggle/randomizer applied to base values) to see how 'aggressive' and other attributes
  -- each square's resources: native critters/monsters, rockiness/rocks, trees, water, plantlife, etc.
    -> critters/monsters for casual hunting trips
  -- 'dungeons': n/a for now? Or really basic text adventures, at most. That could be fun.
  TOWNSTUFF
  -- starter options: general store, town center, barracks, tavern, stockpile, +homes/user camps

  FOR NOW: just populate the data in a broad fashion; can interpret it more specifically later
  -> TOWN can have images, MAP can have images, but each map square is strictly menu-based-only for now
  -> each MAP square dotdotdot









  OG REF
  [ 3 ] Forge the basic UI's: viewing Zenithica's Chat/Township, NOTIFICATION BUTTON (almost always vis?) near top-left, MyStatus Stuff, Create Township, Send Messages
  
  x- Gotta set that socket up :P
  x- Add "Zenithica" ID to all users' townships obj upon server boot-up, if not present
  <doing>
  -- If NOT IN CHAT, robust list of chats (later can differentiate by biome/style/decor of township in the boopables; can add specific notification badges on each township)
  -- WHEN SELECTING A CHAT, set properly on backend which chat is 'active' for socket purposes, and then use the 'activeChat' property on back/front to pop in
  -- CURRENT TOWNSHIP/CHAT SCREEN - TOP interactables, BOTTOM messages, TOP/status notifications, LEFT toggleable list of chats
  -- CHAT MODE ENABLED should populate the 'play screen'/'chat screen' for that given chat
    -> WHOOPS: Fixed server-refreshing issue, but now any saved changes to client OR closing laptop causes it to derp out
      --> I think I figured this out and maybe fixed it before vacation? Check back into it, but I vaguely recall the socket's setup location and/or the token grabbing sxn being involved

  (As we go, consider:)
  -- Simple "township" maps with probably menu-based way to access everything (shops/npcs/events)
  -- CREATE TOWNSHIP: "add participants" (with search), your list of "Connections" is shown to choose from
    -> "choose your class for this township" (with note that you can change classes on the fly for a cost)
    -> actually, choosing starting NPC types based on your "memories" and some defaults versus your Level would be cool... maybe some are preset, like "general store," but those can be edited/de-booped if desired
    -> note we'll be adding stuff in the future, so be sure that the code can handle expansion here
  -- "Manage Township" button (grayed out if you don't have any authority)
  -- Chat box big and bold, chat-app-style for bigger screens on the bottom with "map" up top
   -> as screen shrinks, "chat-first" with toggle for viewing map

  [ 4 ] Basic capabilities: shop (buy and sell for a given 'ship), train, script (basic script: "do X activity for Y time," with more reward-per-time @ short stints)
  -- Money from special tasks given from ZNTH; "deconstructed" township items (flux cost either for this or the process of acquiring items, generally)
  -- Can buy BLUE ITEMS from the ZNTH shop! Yay! And spells, of course. And maybe scripts? I'unno man, you figure it out :P
  -- ZNTH is "chat zero"; all chats have their own "shops" available, with some randomizing

  [ 5 ] Advanced capabilities: server-driven "events" that attach themselves to townships based on various variables ready to be initialized; township 'development' over time
  -- Some/all events don't DO anything yet, but support is there for their creation/doing
  -- Township 'ticks' ... monsters in region moving around, hunting areas tweaking, town and region structures getting built, etc.
    -> Static ticks or individual setTimeouts? (construction events need a startTime and finishTime/array of finishTimes so these can be recalculated on server restart)
  -- "Township Event" is an overlay, just like battles... choose-your-own-adventure!
  -- Add "listeners" to townships that count different variables and use them to mutate the conditions of event generation
  -- Monsters to hunt (camps to find/interact with), wood to chop (ore to mine, herbs to find, materials to gather), stuff to build for the township to upgrade it (add to the CACHE!)
  -- Oh, build caches! (Townships can start with a base cache) ... store supplies for USE!
  -- Who can build? Township Master and designated folks, I guess? Sure! Sounds good.
  -- "Unlimited monster areas" that exchange FLUX for hunting (supplies; subtly changes variables) vs. "acute monster areas" (new camps, big guy coming through, etc.)
  -- Your 'property' is pretty potentially expansive, starting as a little camp-tent and can upgrade to a big ol' home of some sort to hold your local SWAG
  -- Oh, main person(s) can establish where 'building zones' are for folks

  [ 6 ] Add exp gain/level up, skill viewing, equip screens, inventory screens, and ALL THE SCREENS in general

  [ 7 ] First 'minigame': COMBAT! Go, fight, win, yay. Get this done, along with the above, and I think we're pretty much basically launch-ready... well, actually, let's do 8:

  [ 8 ] 'Interactions' ... fun little ways to boost, gift, and exchange with each other throughout the day(s)




  LESSONS LEARNED:
  -- it makes sense to decide on separate components/logic early on BEFORE construction, as it's kind of a pain to dig through and extract separate component logic
    for every single conceptual component from a 'master' component (example from above: createTownship logic)
  -- ...

*/