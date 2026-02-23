package main

import (
	"acsm/internal/core"
	"fmt"
)

func main() {
	config, err := core.Load()
	if err != nil {
		panic(err)
	}
	fmt.Println(config)
}
