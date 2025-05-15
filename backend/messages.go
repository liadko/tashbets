package main

import "log"

func HandleMessage(p *Player, msg map[string]any) {
	msgType, ok := msg["type"].(string)
	if !ok {
		log.Println("Invalid Message Type")

		return
	}

	switch msgType {
	case "create_room":
		name, _ := msg["name"].(string)
		p.name = name

		room, code := hub.CreateRoom()

		p.room = room
		room.AddPlayer(p)

		p.send <- map[string]any{
			"type":      "room_created",
			"room_code": code,
			"players": []map[string]string{
				{"id": p.id, "name": p.name},
			},
		}
	}
}
