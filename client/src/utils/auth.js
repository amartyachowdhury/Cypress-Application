// Auth utility functions
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const setToken = (token) => {
    localStorage.setItem('token', token);
};

export const removeToken = () => {
    localStorage.removeItem('token');
};

export const getUserId = () => {
    return localStorage.getItem('userId');
};

export const setUserId = (userId) => {
    localStorage.setItem('userId', userId);
};

export const removeUserId = () => {
    localStorage.removeItem('userId');
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
};

export const getUserInfo = () => {
    return {
        token: getToken(),
        userId: getUserId(),
        role: localStorage.getItem('userRole'),
        name: localStorage.getItem('userName')
    };
};

export const setUserInfo = (userInfo) => {
    if (userInfo.token) setToken(userInfo.token);
    if (userInfo.userId) setUserId(userInfo.userId);
    if (userInfo.role) localStorage.setItem('userRole', userInfo.role);
    if (userInfo.name) localStorage.setItem('userName', userInfo.name);
};
