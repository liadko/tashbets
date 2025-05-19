import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from "./pages/LandingPage"
import Game from "./pages/Game"
import { useWebSocket } from './hooks/useWebSocket';
import { useCallback } from 'react';
import './App.css'
import { SessionProvider } from './context/SessionContext';

function App() {

    const { sendMessage, setMessageHandler: setHandler } = useWebSocket('ws://localhost:8080/ws')


    return <>
        <SessionProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage sendMessage={sendMessage} setMessageHandler={setHandler} />} />
                    <Route path="/game" element={<Game sendMessage={sendMessage} setMessageHandler={setHandler}/>} />
                </Routes>
            </Router>
        </SessionProvider>

    </>
}

export default App
