export const getAuth = () => {
    const login = localStorage?.getItem('username');
    const password = localStorage?.getItem('password');
    return {
        auth: {
            username: login,
            password: password
        },
        headers: {
            Authorization: btoa(unescape(encodeURIComponent(`${login}:${password}`)))
        }
    }
    
}