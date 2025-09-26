// src/pages/Station.jsx
import { useEffect, useMemo, useState } from "react";
import { API } from "../lib/api";
import { useSearchParams } from "react-router-dom";

export default function Station({ id }) {
    const [sp] = useSearchParams();
    const derivedId = id || sp.get("id");
    const token = localStorage.getItem("token");

    const [stand, setStand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [userId, setUserId] = useState(""); // 로그인 시 자동 채움

    // 로그인된 유저 불러오기
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!token) return;
                const me = await API.me(token); // { email, ... }
                if (mounted && me?.email) setUserId(me.email);
            } catch (_) { }
        })();
        return () => { mounted = false; };
    }, [token]);

    // 스테이션 조회
    const fetchStand = async () => {
        if (!derivedId) { setError("스테이션 id가 없습니다."); setLoading(false); return; }
        try {
            setLoading(true);
            const data = await API.getStand(derivedId);
            data.slots?.sort((a, b) => a.number - b.number);
            setStand(data);
        } catch (e) {
            setError(e.message);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchStand(); }, [derivedId]);

    const rentedMap = useMemo(() => {
        const m = new Map();
        stand?.slots?.forEach(s => m.set(s.number, s.rentedBy));
        return m;
    }, [stand]);

    const onToggle = async (slotNumber) => {
        if (!derivedId) return alert("스테이션 ID가 없습니다.");
        if (!userId) return alert("로그인 후 이용하세요. (개발용: 이메일 수동 입력 가능)");

        setBusy(true); setError("");
        try {
            const current = rentedMap.get(slotNumber);
            let res;
            if (!current) {
                // 대여: 백엔드가 토큰의 이메일로 강제 설정
                res = await API.rent(derivedId, slotNumber, userId, token);
            } else if (current === userId) {
                // 반납: 백엔드가 토큰의 이메일과 슬롯 소유자 일치 검증
                res = await API.ret(derivedId, slotNumber, userId, token);
            } else {
                alert(`이미 다른 사용자(${current})가 대여 중입니다.`);
                return;
            }
            res.stand?.slots?.sort((a, b) => a.number - b.number);
            setStand(res.stand);
        } catch (e) {
            setError(e.message);
        } finally { setBusy(false); }
    };

    if (loading) return <div>로딩...</div>;
    if (!stand) return <div>스테이션을 불러오지 못했습니다: {error}</div>;

    return (
        <div>
            <h1>{stand.name || stand.placeId}</h1>
            <div>Station ID: {stand._id}</div>

            {/* 개발용 입력: 토큰 없을 때만 노출 */}
            {!token && (
                <div>
                    <label>
                        사용자 이메일(개발용):
                        <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="test1@example.com" />
                    </label>
                </div>
            )}

            {error && <div>오류: {error}</div>}

            <ul>
                {stand.slots.map(s => {
                    const mine = s.rentedBy && s.rentedBy === userId;
                    const rented = !!s.rentedBy;
                    return (
                        <li key={s.number}>
                            <span>슬롯 {s.number} — {rented ? (mine ? "내가 대여 중" : `대여 중 (${s.rentedBy})`) : "빈 슬롯"}</span>
                            <button onClick={() => onToggle(s.number)} disabled={busy || (rented && !mine)}>
                                {mine ? "반납" : "대여"}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}