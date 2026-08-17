import axios from 'axios';

const api = axios.create({
    // Relative /api goes through the Next.js rewrite (see next.config.mjs), which
    // points at the deployed backend via BACKEND_URL / NEXT_PUBLIC_API_URL.
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        // We only access localStorage on the client side
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;

export function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const headers = new Headers(init.headers);

    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    return fetch(input, {
        ...init,
        headers,
    });
}
