package main

import (
	"log"
	"sync"
	"time"
)

type Room struct {
	code    string
	players map[string]*Player
	mutex   sync.Mutex

	gameRunning bool
	startTime   time.Time

	puzzleData   map[string]any // raw json
	puzzleDate   string
	answerString string
}

func NewRoom(code string) *Room {

	puzzleDate, today := GetNonSaturday()
	var puzzleData map[string]any
	var err error

	if today {
		puzzleData, err = FetchTodayPuzzle()
	} else {
		puzzleData, err = LoadPuzzleJson(puzzleDate)
	}

	if err != nil {
		log.Panicf("Room Creation Failed %v", err)
	}

	answerString := GetAnswerString(puzzleData)

	return &Room{
		code:         code,
		players:      make(map[string]*Player),
		gameRunning:  false,
		puzzleData:   puzzleData,
		puzzleDate:   DateToString(puzzleDate),
		answerString: answerString,
	}
}

func (r *Room) AddPlayer(p *Player) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	r.players[p.id] = p
}

func (r *Room) RemovePlayer(id string) {
	r.mutex.Lock()

	log.Println(id, "Left the room")
	delete(r.players, id)

	r.mutex.Unlock()

	r.Broadcast(map[string]any{
		"type": "player_left",
		"id":   id,
	}, id)

}

func (r *Room) StartGame() {
	log.Println("Starting Game")

	r.mutex.Lock()
	r.gameRunning = true
	r.startTime = time.Now()
	r.mutex.Unlock()

	r.Broadcast(map[string]any{
		"type":       "game_start",
		"start_time": r.startTime.Unix(),
	}, "")

}

func (r *Room) CheckReadies() {

	r.mutex.Lock()

	// not enough players or already running
	if len(r.players) <= 1 || r.gameRunning {
		r.mutex.Unlock()
		return
	}

	allReady := true

	for _, player := range r.players {
		if !player.ready {
			allReady = false
		}
	}

	r.mutex.Unlock()

	if allReady {
		r.StartGame()
	}

}

func CheckWin(answerString string) {

}

func (r *Room) Broadcast(msg map[string]any, excludee_id string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	for _, player := range r.players {
		if player.id != excludee_id {
			player.send <- msg
		}
	}
}

func (r *Room) IsEmpty() bool {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	return len(r.players) == 0
}
