package api

import (
	api_common "acsm/internal/api/common"
	"acsm/internal/domain"
	"encoding/json"
	"net/http"
)

type ApiResponse http.ResponseWriter

func AsJson[T any](w http.ResponseWriter, obj T, withCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(withCode)
	json.NewEncoder(w).Encode(obj)
}

func Error500(w http.ResponseWriter, err string) {
	AsJson(w, map[string]string{
		"error": err,
	}, http.StatusInternalServerError)
}

func Error404(w http.ResponseWriter) {
	AsJson(w, map[string]string{
		"error": domain.ErrNotFound,
	}, http.StatusNotFound)
}

func Error409(w http.ResponseWriter, conflict string) {
	AsJson(w, map[string]string{
		"error": conflict,
	}, http.StatusConflict)
}

func Error400(w http.ResponseWriter, reason string) {
	AsJson(w, map[string]string{
		"error": reason,
	}, http.StatusBadRequest)
}

func Error401(w http.ResponseWriter) {
	AsJson(w, map[string]string{
		"error": "You are not authorized to access this endpoint. Please log in.",
	}, http.StatusUnauthorized)
}

func Error403(w http.ResponseWriter) {
	AsJson(w, map[string]string{
		"error": "You do not have access to this endpoint.",
	}, http.StatusForbidden)
}

func Success200[T any](w http.ResponseWriter, data T) {
	AsJson(w, api_common.Response[T]{
		Data: data,
	}, http.StatusOK)
}
func Success201[T any](w http.ResponseWriter, data T) {
	AsJson(w, api_common.Response[T]{
		Data: data,
	}, http.StatusCreated)
}
func Success204(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
}
