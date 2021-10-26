import React, {useContext, useState, useEffect} from 'react';
import { actions, SocketContext } from '../context';

export default function GameFramePage({ state, dispatch }) {
    const socket = useContext(SocketContext);

    // NOTE: some of these states are 'temporarily' living here for logic-testing purposes and will/should scoot off to separate components in the future
    // new township creation definitely fits that bill :P
    const [newTownshipSpecs, setNewTownshipSpecs] = useState({
        name: '',
        privacy: 'open',
        invitees: {},
        potentialInvitees: []
    });

    function addInvitee(user, index) {
        let newInviteesObj = {...newTownshipSpecs.invitees};
        newInviteesObj[user] = true;
        let newPotentialInvitees = newTownshipSpecs.potentialInvitees;
        newPotentialInvitees.splice(index, 1);
        return setNewTownshipSpecs({...newTownshipSpecs, invitees: newInviteesObj, potentialInvitees: newPotentialInvitees});
    }

    function handleNewTownshipCreation() {
        // may add e to preventDefault() on if refactor to be form-friendly

        if (newTownshipSpecs.name.length > 5) return sendSocketData({event: 'create_township', township: newTownshipSpecs});

    }


    function sendSocketData(dataObj) {
        // so we'd use this fxn by attaching an obj with {event: 'socket_event', OTHERSTUFF, and token: token below}
        return socket.emit('data_from_client', {...dataObj, token: localStorage.getItem('townshipJWT')});
    }

    function logout() {
        localStorage.removeItem('townshipJWT');
        dispatch({type: actions.LOGOUT});
    }

    function selectTownship(townshipID) {
        // THIS: pop over to server, retrieve message/history data, and populate chat while updating playState to township-viewing
        // ERROR CONDITION: closing laptop and opening again borks this (though this function still fires fine); check socket connection in this case
        sendSocketData({event: 'view_township', townshipID: townshipID});
        // socket.emit('view_township', {townshipID: townshipID, token: localStorage.getItem('townshipJWT')});
    }

    useEffect(() => {
        // This component only theoretically mounts when the user is logged in, so we can handle the initial "login" socket logic here

        // OH. We can just socket.emit instead of doing complex shenanigans with package_to_server now, huh? Ok, that's... better. :P
        // The cost appears to be that having "appwide" socket wrapping means server-rerendering allows us to reconnect without 'login' protocols.
        // Let's force the login protocols somehow... let's see...

        socket.emit('login', localStorage.getItem('townshipJWT'));

        socket.on('township_view_data', townshipData => {
            // alert(`Oh you want to look at ${townshipData?.name}! Well, soon. I'll help you with that soon, I promise.`);
            // HERE: set playState to viewSingleTownship?
            //  ... consider how to parse additional sub-layers (i.e. navigating menus within viewSingleTownship; maybe building a 'view stack')
            dispatch({type: actions.UPDATE_PLAYSTATE, payload: 'viewSingleTownship'});
            return dispatch({type: actions.LOAD_TOWNSHIP, payload: townshipData});
            // HERE: dispatch townshipData to context so we can load currentTownship details
        });

        socket.on('invitees_list_data', inviteesArray => {
            setNewTownshipSpecs({...newTownshipSpecs, potentialInvitees: inviteesArray});
        });

        socket.on('alert', alertData => {
            // structure the alertData for type and message/echo
            alert(`Received an alert from the backend!`);
        });

        socket.on('update_user', userData => {
            return dispatch({type: actions.LOAD_CHARACTER, payload: userData});
        });

        return () => {
            // socket.disconnect();
            // ok, yeah, definitely DON'T disconnect here :P
            // socket.off may be prudent, however (worth some further research)
        }

    }, [socket]);

    useEffect(() => {
        if (state?.playState === 'createTownship') {
            sendSocketData({event: 'request_invitees_list'});
        }
    }, [state.playState])

    // for the time being, I think this is the 'root' of the gameplay components, using 'playState' state var to dictate view
    // import an Alert component to live in here ... likely a fixed, high z-indexed fella
    // NOTE: most/all of the separate 'pages' below can be their own little components that inherit SOCKET to comm with backend as needed
    return (
        <div style={{display: 'flex', position: 'relative', width: '100vw', padding: '1.5rem'}}>
            
            <button onClick={logout} style={{position: 'fixed', top: '2rem', right: '2rem', width: '50px', height: '50px', color: 'white', background: '#0AF'}}>LOG OUT</button>
            
            <div style={{position: 'absolute', display: 'flex', padding: '1rem', width: '400px', height: '100px', borderRadius: '0.8rem', border: '1px solid hsla(225,90%,80%,0.8)'}}>
                {state?.name} <br/> Status OK! <br/> 0 money :-0 <br/> 0/0 flux <br/> <button style={{marginLeft: '1rem'}}>Notifications & Such</button>
            </div>

            {/* PLAYSPACE */}
            {/* <div style={{textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '999', position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', background: 'white'}}>
                HERE: basic animation tests<br/>
                Make an 'enemy' div and maybe some buttons that showcase different animations<br/>
                ... probably after getting further in Study Buddies :P
            </div> */}

            {/* VIEW ALL TOWNSHIPS SXN */}
            { state?.playState === 'viewTownships' && 
                <div style={{position: 'absolute', display: 'flex', flexDirection: 'column', border: '1px solid green', borderRadius: '1rem', padding: '1rem', top: '150px', left: '1rem', width: '80vw', marginLeft: '10vw', height: '60vh'}}>
                    <span style={{alignSelf: 'flex-end', marginBottom: '1.5rem', fontSize: 'calc(1rem + 0.5vw)'}}>I LIST THE CHATS :-D</span>
                    <button style={{padding: '1rem', fontWeight: '700', fontSize: '1.5rem', letterSpacing: '2px', marginBottom: '1.5rem'}} onClick={() => selectTownship(0)}>I am ZENITHICA!</button>
                    <button style={{padding: '1rem', fontWeight: '700', fontSize: '1.5rem', letterSpacing: '2px', marginBottom: '1.5rem'}} onClick={() => dispatch({type: actions.UPDATE_PLAYSTATE, payload: 'createTownship'})}>+ Create New Township</button>
                    {Object.keys(state?.townships).map((township, index) => (
                        <button key={index}>{state?.townships[township].name}</button>
                    ))}
                </div>
            }

            {/* CREATE TOWNSHIP SXN */}
            { state?.playState === 'createTownship' &&
            // define name, starting buildings, joinRules?, visibility?, 
                <div style={{position: 'relative', top: '10vh', display: 'flex', border: '1px solid green', borderRadius: '6px', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '1rem'}}>
                    <h1>CREATE A LITTLE TOWN IN A LITTLE WORLD</h1>
                    <button style={{padding: '0.8rem', fontWeight: '600', alignSelf: 'flex-start'}} onClick={() => dispatch({type: actions.UPDATE_PLAYSTATE, payload: 'viewTownships'})}>Back to Viewing</button>

                    <label>Township Name:</label>
                    <input placeholder={'Township name'} style={{marginTop: '1rem', fontSize: '1.2rem', padding: '0.8rem'}} type="text" value={newTownshipSpecs.name} onChange={e => setNewTownshipSpecs({...newTownshipSpecs, name: e.target.value})}></input>
                    
                    
                    <div style={{display: 'flex', border: '1px solid red', width: '50%', marginTop: '1rem', justifyContent: 'space-around'}}>
                        <label>Privacy: </label>
                        <button style={{height: '3rem', color: 'white', background: newTownshipSpecs.privacy === 'open' ? 'green' : 'red'}} onClick={() => setNewTownshipSpecs({...newTownshipSpecs, privacy: 'open'})}>Open</button>
                        <button style={{height: '3rem', color: 'white', background: newTownshipSpecs.privacy === 'private' ? 'green' : 'red'}} onClick={() => setNewTownshipSpecs({...newTownshipSpecs, privacy: 'private'})}>Private</button>
                    </div>

                    <div>
                        <p>Currently inviting: </p>
                        {Object.keys(newTownshipSpecs.invitees).map(user => (<p key={user}>{user}</p>))}
                        <p>Invite some FOLKS:</p>
                        {newTownshipSpecs.potentialInvitees.map((user, index) => (
                            <button key={index} onClick={() => addInvitee(user, index)}>{user}</button>
                        ))}
                    </div>
                    
                    <button style={{marginTop: '1rem'}} onClick={handleNewTownshipCreation}>Create!</button>
                </div>
            }

            {/* VIEW SINGLE TOWNSHIP SXN */}
            { state?.playState === 'viewSingleTownship' && 
                <div style={{position: 'relative', display: 'flex', border: '2px solid #0AF', borderRadius: '6px', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '1rem'}}>
                    <button onClick={() => dispatch({type: actions.UPDATE_PLAYSTATE, payload: 'viewTownships'})}>Back to All Townships</button>
                    <h1>[ {state?.currentTownship?.name} ]</h1>
                    
                    <div id='mapWindow' style={{width: '80%', borderRadius: '1rem', border: '1px solid purple', height: '50vh'}}>
                        {/* 
                            canvas will likely live here
                            need to consider now to 'nest' or stack views so that this is always showing the proper stuff to user
                            it's all client-side info, though; the 'info' will update through the socket, but all the details of zoom, area, rendering live here

                            ... 'drawing' the elements of the town and adding further elements of animation/animationFrames should be a fun challenge!
                        */}
                    </div>
                </div>
            }


        </div>
    )
}