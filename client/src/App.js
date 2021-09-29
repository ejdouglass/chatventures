import React from 'react';
import { Store } from './context';
import MainView from './pages/MainView';

export default function App() {
  return (
    <Store>
      <MainView />
    </Store>
  );
}