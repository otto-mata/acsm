package utils

func Map[T any, R any](slice []T, fn func(T) R) []R {
	out := make([]R, len(slice))
	for i, e := range slice {
		out[i] = fn(e)
	}
	return out
}
