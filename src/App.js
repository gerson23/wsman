import logo from './logo.svg';
import './App.css';
import Main from './classes/Main.js';
import { useEffect } from 'react';


function App() {
  useEffect(() => {
    document.title = "Wsman"
  })
  return (
    <Main></Main>
  );
}

export default App;
