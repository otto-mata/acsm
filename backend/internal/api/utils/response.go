package apiutils

import (
	"encoding/json"
	"net/http"
)

func AsJson[T any](w http.ResponseWriter, obj T, withCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(withCode)
	json.NewEncoder(w).Encode(obj)
}
