package handlers

import (
	"encoding/json"
	"net/http"
	"time"
)

type HealthInfo struct {
	Status  string `json:"status"`
	Version string `json:"version"`
	Uptime  int64  `json:"uptime"`
}

var startupTime int64 = time.Now().Unix()

func GetHealth(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(HealthInfo{
		Status:  "ok",
		Version: "0.0.1a",
		Uptime:  time.Now().Unix() - startupTime,
	})
}
