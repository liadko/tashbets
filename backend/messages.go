package main

import (
	"encoding/json"
	"log"
)

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
			"id":        p.id,
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
			"id":        p.id,
		}

		p.room.Broadcast(
			map[string]any{
				"type": "new_player_joined",
				"id":   p.id,
				"name": p.name,
			},
			p.id,
		)

	case "get_room_info":
		log.Println(p.id, " asked for room info ")

		if p.room == nil {
			log.Println(p.id, " has no room. not giving him his room_info.")
			return
		}

		playerList := []map[string]any{}
		for _, player := range p.room.players {
			playerList = append(playerList, map[string]any{
				"id":         player.id,
				"name":       player.name,
				"ready":      player.ready,
				"ghostState": player.ghostState,
			})
		}

		p.send <- map[string]any{
			"type":    "room_info",
			"players": playerList,
		}
	case "update_state":
		stateRaw, ok := msg["ghostState"]
		if !ok {
			log.Println("No state field")
			return
		}

		// Marshal the `map[string]any` back to JSON bytes
		stateBytes, err := json.Marshal(stateRaw)
		if err != nil {
			log.Println("Failed to re-marshal state:", err)
			return
		}

		// Unmarshal into struct
		var ghost GhostState
		if err := json.Unmarshal(stateBytes, &ghost); err != nil {
			log.Println("Invalid ghost state JSON:", err)
			return
		}

		// IsReady
		ready, ok := msg["ready"].(bool)
		if !ok {
			log.Println("Ready Could not Be parsed")
			return
		}

		// Save it
		p.ghostState = ghost
		p.ready = ready
		p.room.Broadcast(map[string]any{
			"type":       "player_update",
			"id":         p.id,
			"ready":      ready,
			"ghostState": ghost,
		}, p.id)

		log.Printf("%s updated ghost state %v", p.name, p.ready)
	default:
		log.Printf("Unhandled message type: %s from player %s", msgType, p.id)

	}

}
