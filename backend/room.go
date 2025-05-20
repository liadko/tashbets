package main

import (
	"log"
	"sync"
)

type Room struct {
	code    string
	players map[string]*Player
	mutex   sync.Mutex

	gameRunning bool
}

func NewRoom(code string) *Room {
	return &Room{
		code:        code,
		players:     make(map[string]*Player),
		gameRunning: false,
	}
}

func (r *Room) AddPlayer(p *Player) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	r.players[p.id] = p
}

func (r *Room) RemovePlayer(id string) {
	r.mutex.Lock()

	log.Println(r.players[id].name, "Left the room")
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
	r.mutex.Unlock()

	r.Broadcast(map[string]any{
		"type": "game_start",
	}, "")

}

func (r *Room) CheckReadies() {
	log.Println("Checkin Readies!")

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
		log.Println("Conclusion, Ready")

		r.StartGame()
	} else {

		log.Println("Conclusion, Not Ready")
	}

}

func (r *Room) Broadcast(msg map[string]any, excludee_id string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	log.Println(len(r.players))
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
