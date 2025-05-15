package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func ServeWS(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	player := &Player{
		id:   GenerateUUID(),
		conn: conn,
		send: make(chan map[string]any, 256),
	}

	log.Println("Initializing Player with id:", player.id)

	go player.WritePump()
	go player.ReadPump()
}
