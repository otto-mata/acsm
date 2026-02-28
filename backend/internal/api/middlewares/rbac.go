package middlewares

import (
	apiutils "acsm/internal/api/utils"
	"acsm/internal/domain"
	"net/http"
)

const (
	RoleViewer   = "viewer"
	RoleOperator = "operator"
	RoleAdmin    = "admin"
)

// roleLevel maps role names to numeric levels for comparison
var roleLevel = map[string]int{
	RoleViewer:   1,
	RoleOperator: 2,
	RoleAdmin:    3,
}

func RequireRole(
	minRole string,
) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			v, ok := r.Context().Value(domain.ClaimsKey).(domain.MicroContextClaims)
			if !ok {
				apiutils.AsJson(w, map[string]any{
					"error": "invalid context in request (contact admin)",
				}, http.StatusInternalServerError)
				return
			}
			if roleLevel[v.Role] < roleLevel[minRole] {
				apiutils.AsJson(w, map[string]any{
					"error": "Missing permissions",
				}, http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
