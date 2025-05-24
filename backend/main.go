package main

import (
	"fmt"
	"net/http"
)

var hub *Hub
var config *Config

func main() {

	var err error
	config, err = LoadConfig("config.json")
	if err != nil {
		fmt.Println("Error Loading Config", err)
	}

	hub = NewHub()

	// turn to WS
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ServeWS(hub, w, r)
	})

	fmt.Println("Starting WebSocket Server on :8080")
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
