import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../lib/api";

export default function Dashboard() {
    const nav = useNavigate();
    const [me, setMe] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            nav("/login");
            return;
        }
        (async () => {
            try {
                const data = await API.me(token); // ✅ 내 정보 조회
                setMe(data);
            } catch (err) {
                console.error("내 정보 조회 실패:", err);
                nav("/login");
            }
        })();
    }, [token, nav]);

    if (!token) return null;

    return (
        <div className="container">
            <h1>대시보드</h1>
            {me ? (
                <div className="card">
                    <p><b>ID:</b> {me._id}</p>
                    <p><b>Email:</b> {me.email}</p>
                    <p><b>닉네임:</b> {me.displayName || "-"}</p>
                </div>
            ) : (
                <p>불러오는 중...</p>
            )}
            <button
                onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.dispatchEvent(new Event("auth-changed"));
                    nav("/login");
                }}
            >
                로그아웃
            </button>
        </div>
    );
}