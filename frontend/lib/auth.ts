export const isLoggedIn = async () => {
    const token = localStorage.getItem('access_token');
    if (token === null) return false;
    const response = await fetch('/api/users/me', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.status == 200;
};
