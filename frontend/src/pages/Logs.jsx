import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Logs() {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState("");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const data = await api(`/api/logs/${encodeURIComponent(user.email)}`);
                setLogs(Array.isArray(data) ? data : []);
            } catch (e) {
                setError(e.message);
            }
        })();
    }, [user]);

    if (!user) return <div>로그인 후 이용하세요.</div>;
    if (error) return <div>에러: {error}</div>;

    return (
        <div>
            <h1>{user.email} 님의 대여/반납 내역</h1>
            {logs.length === 0 ? (
                <p>아직 내역이 없습니다.</p>
            ) : (
                <ul>
                    {logs.map((log) => (
                        <li key={log._id}>
                            슬롯 {log.slotNumber} — {log.action === "rent" ? "대여" : "반납"} —{" "}
                            {new Date(log.at).toLocaleString()}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}