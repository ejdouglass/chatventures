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