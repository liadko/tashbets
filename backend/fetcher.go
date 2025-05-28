package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

func FetchPuzzleJson(date string) (map[string]any, error) {

	client := &http.Client{}

	url := fmt.Sprintf("https://www.nytimes.com/svc/crosswords/v6/puzzle/mini/%s.json", date)

	req, err := http.NewRequest("GET", url, nil)

	if err != nil {
		return nil, fmt.Errorf("failed to create request to %s: %w", url, err)
	}

	req.Header.Set("Cookie", config.NYTCookie)

	resp, err := client.Do(req)

	if err != nil {
		return nil, fmt.Errorf("failed to send request to %s: %w", url, err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("server rejected %s with status %d", url, resp.StatusCode)
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return nil, err
	}

	var puzzle map[string]any
	err = json.Unmarshal(body, &puzzle)
	if err != nil {
		return nil, err
	}

	return puzzle, nil
}

func FetchTodayPuzzle() (map[string]any, error) {

	client := &http.Client{}

	url := "https://www.nytimes.com/svc/crosswords/v6/puzzle/mini.json"

	req, err := http.NewRequest("GET", url, nil)

	if err != nil {
		return nil, fmt.Errorf("failed to create request to %s: %w", url, err)
	}

	resp, err := client.Do(req)

	if err != nil {
		return nil, fmt.Errorf("failed to send request to %s: %w", url, err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("server rejected %s with status %d", url, resp.StatusCode)
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return nil, err
	}

	var puzzle map[string]any
	err = json.Unmarshal(body, &puzzle)
	if err != nil {
		return nil, err
	}

	return puzzle, nil
}

func LoadPuzzleJson(date string) (map[string]any, error) {

	filename := fmt.Sprintf("../minis/%s.json", date)

	data, err := os.ReadFile(filename)

	if err != nil {
		log.Println(err)
	}

	var puzzle map[string]any
	err = json.Unmarshal(data, &puzzle)
	if err != nil {
		return nil, err
	}

	return puzzle, nil
}

func LoadPuzzleJsonRandom() (map[string]any, string, error) {

	dateStr := GetRandomDate()

	puzzle, err := LoadPuzzleJson(dateStr)

	return puzzle, dateStr, err
}

func NytDownloader() {
	for y := 2024; y < 2025; y++ {
		for m := 1; m <= 12; m++ {
			for d := 1; d <= 31; d++ {

				dateTime, err := time.Parse("2006-01-02", fmt.Sprintf("%04d-%02d-%02d", y, m, d))
				if err != nil {
					// it's not a date
					continue
				}

				date := dateTime.Format("2006-01-02")

				puzzle, err := FetchPuzzleJson(date)

				filename := fmt.Sprintf("../minis/%s.json", date)

				data, err := json.Marshal(puzzle)

				err = os.WriteFile(filename, data, 0644)

				fmt.Println("Downloaded:", date)

				if err != nil {
					fmt.Printf("Error On Date %s: %s\n", date, err.Error())
				}

			}
		}
	}
}
