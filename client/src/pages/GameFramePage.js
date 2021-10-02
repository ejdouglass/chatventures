import React, {useContext, useEffect} from 'react';
import { actions, SocketContext } from '../context';

export default function GameFramePage({ state, dispatch }) {
    const socket = useContext(SocketContext);

    function logout() {
        localStorage.removeItem('townshipJWT');
        dispatch({type: actions.LOGOUT});
    }

    function selectTownship(township) {
        // THIS: pop over to server, retrieve message/history data, and populate chat while updating playState to township-viewing
    }

    useEffect(() => {
        // This component only theoretically mounts when the user is logged in, so we can handle the initial "login" socket logic here
        // Test works! Neat. Socket is alive. Now, then...
        // socket.emit('test_message', 'Hello serverman!');

        // OH. We can just socket.emit instead of doing complex shenanigans with package_to_server now, huh? Ok, that's... better. :P

        socket.emit('login', localStorage.getItem('townshipJWT'));
    }, []);

    // for the time being, I think this is the 'root' of the gameplay components, using 'playState' state var to dictate view
    // import an Alert component to live in here ... likely a fixed, high z-indexed fella
    // 
    return (
        <div style={{display: 'flex', position: 'relative', width: '100vw', padding: '1.5rem'}}>
            <button onClick={logout} style={{position: 'fixed', top: '2rem', right: '2rem', width: '50px', height: '50px', color: 'white', background: '#0AF'}}>LOG OUT</button>
            
            <div style={{position: 'absolute', display: 'flex', padding: '1rem', width: '400px', height: '100px', borderRadius: '0.8rem', border: '1px solid hsla(225,90%,80%,0.8)'}}>
                {state?.name} <br/> Status OK! <br/> 0 money :-0 <br/> <button style={{marginLeft: '1rem'}}>Notifications & Such</button>
            </div>

            { state?.playState === 'viewTownships' && 
                <div style={{position: 'absolute', display: 'flex', flexDirection: 'column', border: '1px solid green', borderRadius: '1rem', padding: '1rem', top: '150px', left: '1rem', width: '80vw', marginLeft: '10vw', height: '60vh'}}>
                    <span style={{alignSelf: 'flex-end', marginBottom: '1.5rem', fontSize: 'calc(1rem + 0.5vw)'}}>I LIST THE CHATS :-D</span>
                    <button style={{padding: '1rem', fontWeight: '700', fontSize: '1.5rem', letterSpacing: '2px', marginBottom: '1.5rem'}} onClick={() => selectTownship('zenithica')}>I am ZENITHICA!</button>
                    <button style={{padding: '1rem', fontWeight: '700', fontSize: '1.5rem', letterSpacing: '2px', marginBottom: '1.5rem'}} onClick={() => dispatch({type: actions.UPDATE_PLAYSTATE, payload: 'createTownship'})}>+ Create New Township</button>
                </div>
            }

            { state?.playState === 'createTownship' &&
                <div style={{position: 'relative', top: '10vh'}}>
                    <h1>CREATE A LITTLE TOWN IN A LITTLE WORLD</h1>
                    <button onClick={() => dispatch({type: actions.UPDATE_PLAYSTATE, payload: 'viewTownships'})}>Back to Viewing</button>
                </div>
            }


        </div>
    )
}