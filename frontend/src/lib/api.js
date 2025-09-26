// src/lib/api.js
const BASE = import.meta.env.VITE_API_URL;

export async function api(path, { method = "GET", body, token } = {}) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = data?.message || `HTTP ${res.status}`;
        throw new Error(msg);
    }
    return data;
}

// --------------------
// 엔드포인트별 함수 모음
// --------------------
export const API = {
    // 스탠드 관련
    getStand: (id) => api(`/api/stands/${id}`),
    getStands: () => api("/api/stands"),
    rent: (id, slotNumber, userId, token) =>
        api(`/api/stands/${id}/rent`, {
            method: "POST",
            body: { slotNumber, userId },
            token,
        }),
    ret: (id, slotNumber, userId, token) =>
        api(`/api/stands/${id}/return`, {
            method: "POST",
            body: { slotNumber, userId },
            token,
        }),
    listStands: () => api(`/api/stands`),


    // 로그 관련
    getLogsByUser: (userId, token) =>
        api(`/api/logs/${encodeURIComponent(userId)}`, { token }),

    // 인증 관련
    me: (token) => api(`/api/auth/me`, { token }),
    register: (body) => api(`/api/auth/register`, { method: "POST", body }),
    login: (body) => api(`/api/auth/login`, { method: "POST", body }),
    logout: () => api(`/api/auth/logout`, { method: "POST" }),
};