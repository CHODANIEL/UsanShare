// src/pages/Map.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../lib/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


export default function MapPage() {
    const [stands, setStands] = useState([]);
    const [error, setError] = useState("");

    const mapEl = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);

    // 목록 불러오기
    useEffect(() => {
        (async () => {
            try {
                const list = await API.listStands();
                list.forEach(s => s.slots?.sort((a, b) => a.number - b.number));
                setStands(list);
            } catch (e) {
                setError(e.message);
            }
        })();
    }, []);

    const geoStands = useMemo(
        () => stands.filter(s => typeof s.lat === "number" && typeof s.lng === "number"),
        [stands]
    );

    // 지도 생성 (항상 상단)
    useEffect(() => {
        if (!mapEl.current || mapRef.current) return;

        // 기본 중심: 서울시청
        mapRef.current = L.map(mapEl.current, {
            center: [37.566535, 126.9779692],
            zoom: 13,
        });

        // OSM 타일
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapRef.current);
    }, []);

    // 마커 렌더/업데이트
    useEffect(() => {
        if (!mapRef.current) return;

        // 기존 마커 제거
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // 새 마커 추가
        geoStands.forEach(s => {
            const marker = L.marker([s.lat, s.lng]).addTo(mapRef.current);
            marker.bindPopup(`<b>${s.name || s.placeId}</b>`);
            markersRef.current.push(marker);
        });

        // 경계 맞추기
        if (markersRef.current.length > 0) {
            const group = L.featureGroup(markersRef.current);
            mapRef.current.fitBounds(group.getBounds().pad(0.2));
        }
    }, [geoStands]);

    if (error) return <div>에러: {error}</div>;

    return (
        <div>
            {/* 항상 상단 지도 (height 꼭 지정) */}
            <div ref={mapEl} style={{ width: "100%", height: 480 }} />

            <h1>스테이션 목록</h1>
            {stands.length === 0 ? (
                <p>등록된 스테이션이 없습니다.</p>
            ) : (
                <ul>
                    {stands.map(s => {
                        const total = s.slots?.length ?? 0;
                        const empty = s.slots?.filter(x => !x.rentedBy).length ?? 0;
                        const hasGeo = typeof s.lat === "number" && typeof s.lng === "number";
                        return (
                            <li key={s._id}>
                                <b>{s.name || s.placeId}</b> ({empty}/{total}){" "}
                                <Link to={`/station?id=${s._id}`}>열기</Link>
                                {!hasGeo && <span> — 좌표없음</span>}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}