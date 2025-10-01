// src/lib/api.js
const rawBase = import.meta.env.VITE_API_URL || "http://localhost:3000"; // ✅ 기본값
// "http://localhost:3000/" 같은 경우 슬래시 제거
const BASE = rawBase.replace(/\/+$/, "");

function buildUrl(path) {
    // path 앞의 중복 슬래시 제거
    const clean = path.startsWith("/") ? path : `/${path}`;
    return `${BASE}${clean}`; // ✅ 항상 BASE + /path
}

export async function api(path, { method = "GET", body, token } = {}) {
    const url = buildUrl(path);

    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials: "include",
    });

    // 응답이 JSON이 아닐 수도 있으니 안전하게 처리
    let data = {};
    try {
        data = await res.json();
    } catch (_) {
        // no-op
    }

    if (!res.ok) {
        // 서버 메시지가 있으면 그대로 노출
        const msg = data?.message || `${res.status} ${res.statusText}`;
        // 개발 시 무엇을 보냈는지 빠르게 추적하고 싶다면:
        // console.error("[API ERROR]", method, url, "body:", body, "->", msg);
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
    rent: (id, slotNumber, _userId, token) =>
        api(`/api/stands/${id}/rent`, {
            method: "POST",
            body: { slotNumber }, // ✅ userId 필요 없음(서버가 토큰으로 식별)
            token,
        }),
    // 반납은 이제 바디 필요 없음(서버가 유저의 대여 슬롯을 찾아 해제)
    ret: (id, _slotNumber, _userId, token) =>
        api(`/api/stands/${id}/return`, {
            method: "POST",
            token,
        }),
    listStands: () => api(`/api/stands`),

    // 로그 관련
    getLogsByUser: (userId, token) =>
        api(`/api/logs/${encodeURIComponent(userId)}`, { token }),

    // 인증 관련
    me: (token) => api(`/api/auth/me`, { token }),
    register: (body) => api(`/api/auth/register`, { method: "POST", body }),
    login: ({ email, password }) =>
        api(`/api/auth/login`, { method: "POST", body: { email, password } }), // ✅ 키 이름 보장
    logout: () => api(`/api/auth/logout`, { method: "POST" }),
};