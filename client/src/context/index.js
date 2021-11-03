import React, { createContext, useReducer } from 'react';
import socketio from 'socket.io-client';
import { SOCKET_URL } from '../config';

// It may make sense to try to set the socket connection up inside the GameFramePage instead? Hmmm...
export const socket = socketio.connect(SOCKET_URL);
export const SocketContext = createContext();

export const actions = {
    UPDATE_APPSTATE: 'update_appstate',
    UPDATE_PLAYSTATE: 'update_playstate',
    LOAD_CHARACTER: 'load_character',
    LOAD_TOWNSHIP: 'load_township',
    UPDATE_UNREAD_TOWNSHIP: 'update_unread_township',
    LOGOUT: 'logout',
    PACKAGE_TO_SERVER: 'package_to_server',
    PACKAGE_FROM_SERVER: 'package_from_server'
};

export const Reducer = (state, action) => {
    switch (action.type) {
        case actions.UPDATE_APPSTATE: {
            return {...state, appState: action.payload};
        }
        case actions.UPDATE_PLAYSTATE: {
            return {...state, playState: action.payload};
        }
        case actions.LOAD_CHARACTER: {
            return {...action.payload, playState: state.playState === undefined ? 'viewTownships' : state.playState};
        }
        case actions.LOAD_TOWNSHIP: {
            let stateTownships = {...state.townships};
            stateTownships[action.payload.townID].unreadTotal = 0;
            return {...state, currentTownship: action.payload, townships: stateTownships};
        }
        case actions.UPDATE_UNREAD_TOWNSHIP: {
            let stateTownships = {...state.townships};
            // console.log(`Reducer says townships before looked like this: ${JSON.stringify(stateTownships)}`);
            stateTownships[action.payload.townID] = action.payload.townshipObj;
            // console.log(`After the update, it should look like this: ${JSON.stringify(stateTownships)}`);
            return {...state, townships: stateTownships};
        }
        case actions.LOGOUT: {
            return {name: undefined, appState: 'login'};
        }
        case actions.PACKAGE_TO_SERVER: {
            // Pending some review and building, but we might not even need this bad boy for this app!
            return state;
        }
        case actions.PACKAGE_FROM_SERVER: {
            return state;
        }
        default:
            return state;
    }
};

const initialState = {
    name: undefined,
    appState: 'login', // to loading by default instead?
    playState: undefined,
    outgoingPackage: undefined,
    incomingPackage: undefined,
    currentTownship: undefined
};

export const Context = createContext(initialState);

export const Store = ({children}) => {
    const [state, dispatch] = useReducer(Reducer, initialState);

    return (
        <Context.Provider value={[state, dispatch]}>
            {children}
        </Context.Provider>
    )
};