import './App.css'
import PuzzleViewer from "./components/PuzzleViewer"

function App() {

    function buttonClick() {
        console.log("Fetching");

        fetch("https://www.nytimes.com/svc/crosswords/v6/puzzle/mini.json")
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                return response.json();
            }).then((data) => {
                console.log(data);
            }).catch((error) => {
                console.error("Fetch Failed:", error);
            })
    }

    return <>

        <PuzzleViewer />

    </>
}

export default App
