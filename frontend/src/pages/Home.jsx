import { Link } from "react-router-dom";

export default function Home() {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    return (
        <div>
            <h1>USAN Front</h1>

            {user ? (
                <>
                    <p>로그인된 사용자: {user.email}</p>
                    <ul>
                        <li><Link to="/logs">내역보기</Link></li>
                        <li><Link to="/map">지도(스테이션 목록)</Link></li>
                        <li><Link to="/station">스테이션(단일 테스트)</Link></li>
                    </ul>
                </>
            ) : (
                <>
                    <p>로그인하지 않았습니다.</p>
                    <ul>
                        <li><Link to="/login">로그인</Link></li>
                        <li><Link to="/signup">회원가입</Link></li>
                    </ul>
                </>
            )}
        </div>
    );
}