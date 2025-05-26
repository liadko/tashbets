package main

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"strings"
	"time"
)

func DateToString(dateString string) string {
	date, _ := time.Parse("2006-01-02", dateString)
	formatted := date.Format("January 2")

	// add "st", "nd", "rd", "th"
	day := date.Day()
	suffix := "th"
	if day%10 == 1 && day != 11 {
		suffix = "st"
	} else if day%10 == 2 && day != 12 {
		suffix = "nd"
	} else if day%10 == 3 && day != 13 {
		suffix = "rd"
	}

	return fmt.Sprintf("%s, %s%s, %d", date.Weekday().String(), formatted, suffix, date.Year()) // "Sunday, May 23rd, 2025"

}

func GetAnswerString(puzzleData map[string]any) string {
	bodyRaw, ok := puzzleData["body"].([]any)
	if !ok || len(bodyRaw) == 0 {
		return ""
	}
	grid, ok := bodyRaw[0].(map[string]any)
	if !ok {
		return ""
	}
	cellsRaw, ok := grid["cells"].([]any)
	if !ok {
		return ""
	}

	var sb strings.Builder
	for _, rc := range cellsRaw {
		cell, _ := rc.(map[string]any)
		if ans, ok := cell["answer"].(string); ok {
			sb.WriteString(ans)
		} else {
			sb.WriteByte(' ') // doesn't have an answer, so it's a block cell
		}
	}
	return sb.String()
}

func GetNonSaturday() (string, bool) {
	date := time.Now().Add(-1 * time.Hour)
	today := true

	start := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	end := time.Date(2024, 12, 31, 0, 0, 0, 0, time.UTC)
	delta := end.Unix() - start.Unix()

	for date.Weekday() == time.Saturday {
		today = false // today is saturday

		// get random day
		randomOffsetBig, err := rand.Int(rand.Reader, big.NewInt(delta))

		if err != nil {
			panic(err)
		}

		randomOffset := randomOffsetBig.Int64()

		date = start.Add(time.Duration(randomOffset) * time.Second)
	}

	dateStr := date.Format("2006-01-02")

	return dateStr, today
}

func GenerateRoomCode() string {
	const letters = "ABCDEFGHJKLMNOPQRSTUVWXYZ"
	b := make([]byte, 4)
	rand.Read(b)
	for i := range b {
		b[i] = letters[int(b[i])%len(letters)]
	}
	return string(b)
}

func GenerateUUID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}
