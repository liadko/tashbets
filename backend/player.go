package main

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

type GhostState struct {
	FilledCells       []bool `json:"filledCells"`
	SelectedCellIndex int    `json:"selectedCellIndex"`
}

type Player struct {
	id   string
	name string

	ready      bool
	ghostState GhostState
	done       bool

	conn *websocket.Conn
	send chan map[string]any

	room *Room
}

const (
	pongWait   = 40 * time.Second
	pingPeriod = (pongWait * 9) / 10
)

func NewPlayer(id, name string, conn *websocket.Conn, room *Room) *Player {
	return &Player{
		id:   id,
		name: name,
		conn: conn,
		send: make(chan map[string]any, 256),
		room: room,
	}
}

func (p *Player) ReadPump() {
	defer func() {
		log.Println(p.id, "Disconnected")
		if p.room != nil {
			p.room.RemovePlayer(p.id)
		}
		p.conn.Close()
		close(p.send)
	}()

	for {
		var msg map[string]any
		if err := p.conn.ReadJSON(&msg); err != nil {
			break
		}
		HandleMessage(p, msg)
	}
}

func (p *Player) WritePump() {
	defer p.conn.Close()

	for msg := range p.send {

		if err := p.conn.WriteJSON(msg); err != nil {
			break
		}
	}

}
