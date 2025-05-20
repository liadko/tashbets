package main

import (
	"log"
	"sync"
)

type Room struct {
	code    string
	players map[string]*Player
	mutex   sync.Mutex
}

func NewRoom(code string) *Room {
	return &Room{
		code:    code,
		players: make(map[string]*Player),
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
