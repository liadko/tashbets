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

	fmt.Println("Starting WebSocket Server on :21568")
	err = http.ListenAndServe(":21568", nil)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
