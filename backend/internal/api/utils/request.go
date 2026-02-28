package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

func ParseRequest[T any](r *http.Request) (*T, error) {
	var reqBody T
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		return nil, err
	}
	return &reqBody, nil
}

func ParseAndValidateRequest[T any](r *http.Request) (*T, error) {
	var reqBody T
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		return nil, err
	}
	if err := validator.New().Struct(&reqBody); err != nil {
		return nil, err
	}
	return &reqBody, nil
}

func ResourceIDFromRequest(r *http.Request) (uuid.UUID, error) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		return uuid.UUID{}, err
	}
	return id, err
}
