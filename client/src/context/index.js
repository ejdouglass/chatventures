import React, { createContext, useReducer } from 'react';

export const actions = {
    UPDATE_APPSTATE: 'update_appstate'
};

export const Reducer = (state, action) => {
    switch (action.type) {
        case actions.UPDATE_APPSTATE: {
            return {...state, appState: action.payload};
        }
        default:
            return state;
    }
};

const initialState = {
    username: undefined,
    appState: 'login'
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