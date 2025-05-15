package main

import (
	"fmt"
	"net/http"
)

var hub *Hub

func main() {

	hub = NewHub()

	// turn to WS
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ServeWS(hub, w, r)
	})

	fmt.Println("Starting WebSocket Server on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
