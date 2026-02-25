package apiutils

import (
	"encoding/json"
	"net/http"
)

func AsJson[T any](w http.ResponseWriter, obj T) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(obj)
}
