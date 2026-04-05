// Simple module-level token holder — avoids circular imports and SSR issues.
// Updated by authStore on login/logout; read by axios interceptors.
let _token = null;

export const setApiToken = (token) => { _token = token; };
export const getApiToken = () => _token;
