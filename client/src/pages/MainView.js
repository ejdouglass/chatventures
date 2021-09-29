import React, { useState, useEffect, useContext } from 'react';
import { Context, actions } from '../context';
// components to define/add: UserAlert
import LoginPage from './LoginPage'
import CreateChatventurerPage from './CreateChatventurerPage';

export default function MainView() {
    const [state, dispatch] = useContext(Context);

    // Interesting concept. Gotta spend a sec to think about how we'll deal with 'overlays' in this format.
    // Well, for 'universal' overlays, we can still do it at the root/App level?
        // Can also just have each 'branch' below have its own 'stack' of components that receives only precisely what it needs. Let's try that.
    // Gotta look into 'tracking' components as a relatively next investment, see what does and does not re-render.
    switch (state.appState) {
        case 'login': {
            return <LoginPage dispatch={dispatch} />
        }
        case 'createChatventurer': {
            return <CreateChatventurerPage dispatch={dispatch} />
        }
        default: {
            return (
                <div>
                    NO STATE DEFINED. WHAT AM I? beep boop
                </div>
            )
        }
    }
    
};