package userservice

import "acsm/internal/store"

func StoreToBusinessUser(user store.User) User {
	return User{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		Role:  user.Role,
	}
}
