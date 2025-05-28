package main

import (
	"log"
	"time"
)

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

		if room.gameRunning {
			p.send <- map[string]any{
				"type":      "room_active",
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
			"type":       "room_info",
			"players":    playerList,
			"puzzleData": p.room.puzzleData,
			"puzzleDate": p.room.puzzleDate,
		}

	case "update_state":

		// extract the raw map (one check)
		stateMap, ok := msg["ghostState"].(map[string]any)
		if !ok {
			log.Println("missing ghostState")
			return
		}

		// build GhostState directly from the map
		rawCells := stateMap["filledCells"].([]any) // panic if bad
		ghost := GhostState{
			FilledCells:       make([]bool, len(rawCells)),
			SelectedCellIndex: int(stateMap["selectedCellIndex"].(float64)),
		}
		for i, v := range rawCells {
			ghost.FilledCells[i] = v.(bool)
		}

		// extract ready flag (no check, will panic if wrong)
		p.ready = msg["ready"].(bool)
		p.ghostState = ghost

		success := false
		timeToWin := 0
		if p.room.gameRunning {

			log.Printf("%s guessed %s", p.name, msg["answerString"])
			log.Printf("should've guessed %s", p.room.answerString)
			success = msg["answerString"].(string) == p.room.answerString
			timeToWin = int(time.Now().Unix() - p.room.startTime.Unix())
		}

		// broadcast
		p.room.Broadcast(map[string]any{
			"type":       "player_update",
			"id":         p.id,
			"ready":      p.ready,
			"ghostState": ghost,
			"success":    success,
			"timeToWin":  timeToWin,
		}, p.id)

		p.room.CheckReadies()

		if success && !p.done {
			log.Printf("%s won!", p.name)

			p.done = true
			p.send <- map[string]any{
				"type":         "you_won",
				"timeToWin":    timeToWin,
				"answerString": p.room.answerString,
			}
		}

	case "leave_room":
		log.Println(p.id, " left room")

		p.room.RemovePlayer(p.id)

	default:
		log.Printf("Unhandled message type: %s from player %s", msgType, p.id)

	}

}
