package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func setupRoutes() {
	http.HandleFunc("/ws", wsHandler)
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	// Upgrade the HTTP connection to a WebSocket connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error upgrading:", err)
		return
	}
	defer conn.Close()

	fmt.Println("Client Connected. Waiting For Messages...")

	// Listen for incoming messages
	for {
		var msg map[string]interface{}

		// Wait for message
		if err := conn.ReadJSON(&msg); err != nil {
			log.Println("Read error:", err)
			break
		}
		log.Println("Received from client:", msg)

		// Echo back to client
		if err := conn.WriteJSON(msg); err != nil {
			log.Println("Write error:", err)
			break
		}
	}
}

func main() {

	fmt.Println("Starting WebSocket Server on :8080")

	setupRoutes()

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
