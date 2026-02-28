package domain

type UserPost struct {
	Email    string `json:"email" validate:"required,email"`
	Name     string `json:"name" validate:"required"`
	Role     string `json:"role" validate:"oneof=admin operator viewer"`
	Password string `json:"password" validate:"max=64,min=12"`
}

type UpdateUser struct {
	Name string `json:"name"`
	Role string `json:"role"`
}
