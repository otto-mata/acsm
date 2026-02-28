package api_common

type Response[T any] struct {
	Data T `json:"data"`
}
