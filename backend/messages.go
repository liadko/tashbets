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
		log.Println("create_room by ", p.id)

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

	case "join_room":
		log.Println(p.id, " trynna join_room ", msg["code"])

		name, _ := msg["name"].(string)
		p.name = name

		code, _ := msg["code"].(string)

		room, exists := hub.GetRoom(code)

		if !exists {
			p.send <- map[string]any{
				"type":      "room_invalid",
				"room_code": code,
			}

			return
		}

		p.room = room
		room.AddPlayer(p)

		p.send <- map[string]any{
			"type":      "room_joined",
			"room_code": code,
			"players": []map[string]string{
				{"id": p.id, "name": p.name},
			},
		}
	default:
		log.Printf("Unhandled message type: %s from player %s", msgType, p.id)

	}

}
