package main

import "sync"

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
	defer r.mutex.Unlock()

	delete(r.players, id)

}

func (r *Room) Broadcast(msg map[string]any) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	for _, player := range r.players {
		player.send <- msg
	}
}

func (r *Room) IsEmpty() bool {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	return len(r.players) == 0
}
