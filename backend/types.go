package main

type Cell struct {
	Guess   string `json:"guess"`
	IsBlock bool   `json:"isBlock"`
}

type PuzzleBody struct {
	Cells []Cell `json:"cells"`
}

type Puzzle struct {
	Body []PuzzleBody `json:"body"`
}
