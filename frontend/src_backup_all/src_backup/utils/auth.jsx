// utils/auth.js

export const setToken = (token) => {
  localStorage.setItem('powerstream_token', token);
};

export const getToken = () => {
  return localStorage.getItem('powerstream_token');
};

export const removeToken = () => {
  localStorage.removeItem('powerstream_token');
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};


