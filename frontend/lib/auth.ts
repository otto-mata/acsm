export const isLoggedIn = async (token: string) => {
    const response = await fetch(process.env.BACKEND_URL + '/api/users/me', {
        headers: {
            Authorization: 'Bearer ' + token,
        },
    });
    return response.status == 200;
};
