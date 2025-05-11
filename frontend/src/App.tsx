import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from "./pages/LandingPage"
import Game from "./pages/Game"
import './App.css'

function App() {

    return <>

        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/game" element={<Game />} />
            </Routes>
        </Router>

    </>
}

export default App
