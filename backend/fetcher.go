package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

func downloadDate(date string) error {

	client := &http.Client{}

	url := fmt.Sprintf("https://www.nytimes.com/svc/crosswords/v6/puzzle/mini/%s.json", date)

	req, err := http.NewRequest("GET", url, nil)

	if err != nil {
		return fmt.Errorf("failed to create request to %s: %w", url, err)
	}

	resp, err := client.Do(req)

	if err != nil {
		return fmt.Errorf("failed to send request to %s: %w", url, err)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("server rejected %s with status %d", url, resp.StatusCode)
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return err
	}

	filename := fmt.Sprintf("minis/%s.json", date)

	err = os.WriteFile(filename, body, 0644)

	if err != nil {
		return err
	}

	fmt.Println("Downloaded:", date)

	return nil
}

func nytDownloader() {
	for y := 2024; y < 2025; y++ {
		for m := 12; m <= 12; m++ {
			for d := 25; d <= 31; d++ {

				dateTime, err := time.Parse("2006-01-02", fmt.Sprintf("%04d-%02d-%02d", y, m, d))
				if err != nil {
					// it's not a date
					continue
				}

				date := dateTime.Format("2006-01-02")

				err = downloadDate(date)

				if err != nil {
					fmt.Printf("Error On Date %s: %s\n", date, err.Error())
				}

			}
		}
	}
}
