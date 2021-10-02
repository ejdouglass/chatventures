import React, { createContext, useReducer } from 'react';
import socketio from 'socket.io-client';
import { SOCKET_URL } from '../config';

export const socket = socketio.connect(SOCKET_URL);
export const SocketContext = createContext();

export const actions = {
    UPDATE_APPSTATE: 'update_appstate',
    UPDATE_PLAYSTATE: 'update_playstate',
    LOAD_CHARACTER: 'load_character',
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
            return {...action.payload, playState: 'viewTownships'};
        }
        case actions.LOGOUT: {
            return {name: undefined, appState: 'login'};
        }
        case actions.PACKAGE_TO_SERVER: {
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
    incomingPackage: undefined
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