package main

import (
	"log"
	"sync"
)

type Hub struct {
	rooms map[string]*Room
	mutex sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		rooms: make(map[string]*Room),
	}
}

func (h *Hub) CreateRoom() (*Room, string) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	var code string

	exists := true
	for exists {
		code = GenerateRoomCode()
		_, exists = h.rooms[code]
	}

	room := NewRoom(code)
	h.rooms[code] = room

	log.Println("Creating Room:", code)

	return room, code
}

func (h *Hub) GetRoom(code string) (*Room, bool) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	room, exists := h.rooms[code]

	return room, exists
}

func (h *Hub) DeleteRoom(code string) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	delete(h.rooms, code)
}
