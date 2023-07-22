export const isLoggedIn = () => {
    const user = localStorage.getItem('token');
    return user !== null;
};