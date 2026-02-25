package authcontroller

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	AccessToken string `json:"access_token"`
}

type RegisterRequest struct {
	Email                  string `json:"email"`
	Name                   string `json:"name"`
	Role                   string `json:"role"`
	Password               string `json:"password"`
	AdministrativePassword string `json:"admin_password"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type RefreshResponse LoginResponse
