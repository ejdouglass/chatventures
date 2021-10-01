import React from 'react';
import { actions } from '../context';

export default function GameFramePage({ state, dispatch }) {

    function logout() {
        localStorage.removeItem('townshipJWT');
        dispatch({type: actions.LOGOUT});
    }

    // import an Alert component to live in here
    return (
        <div>
            <button onClick={logout} style={{position: 'fixed', top: '2rem', right: '2rem', width: '50px', height: '50px', color: 'white', background: '#0AF'}}>LOG OUT</button>
            <h3>Welcome home, {state?.name}.</h3>
        </div>
    )
}