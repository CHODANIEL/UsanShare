// src/pages/Logs.jsx
import { useEffect, useMemo, useState } from "react";
import { API } from "../lib/api"; // ✅ api가 아니라 API 모듈 사용 (토큰 헤더 지원)

export default function Logs() {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState("");

    // 로그인 시 저장해 둔 값 구조에 맞게 파싱 (예: { token, user: {...} })
    const session = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("session") || "null");
        } catch {
            return null;
        }
    }, []);

    const user = session?.user || JSON.parse(localStorage.getItem("user") || "null");
    const token = session?.token || localStorage.getItem("token") || null;

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                // 서버 라우트가 이메일 기준이면 email, userId 기준이면 거기에 맞춰주세요.
                const data = await API.getLogsByUser(user.email, token);
                setLogs(Array.isArray(data) ? data : []);
            } catch (e) {
                setError(e.message || "불러오기 실패");
            }
        })();
    }, [user, token]);

    if (!user) return <div>로그인 후 이용하세요.</div>;
    if (error) {
        // 인증 만료 UX
        if (/(401|403|인증|토큰)/.test(error)) {
            return (
                <div>
                    세션이 만료되었거나 권한이 없습니다. 다시 로그인 해주세요.
                </div>
            );
        }
        return <div>에러: {error}</div>;
    }

    const fmt = (isoLike) => {
        if (!isoLike) return "-";
        const d = new Date(isoLike);
        return isNaN(d.getTime()) ? "-" : d.toLocaleString();
    };

    return (
        <div>
            <h1>{user.email} 님의 대여/반납 내역</h1>
            {logs.length === 0 ? (
                <p>아직 내역이 없습니다.</p>
            ) : (
                <ul>
                    {logs.map((log) => (
                        <li key={log._id}>
                            슬롯 {log.slotNumber ?? "-"} — {log.action === "rent" ? "대여" : "반납"} —{" "}
                            {fmt(log.at || log.createdAt)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}