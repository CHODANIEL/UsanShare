import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Station from "./pages/Station";
import Logs from "./pages/Logs";
import MapPage from "./pages/Map";
import Home from "./pages/Home";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const sync = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    window.location.href = "/";
  };

  return (
    <BrowserRouter>

      <nav>
        <Link to="/">홈</Link>
        <Link to="/map">지도</Link>

        {!token && (
          <>
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
          </>
        )}

        {token && (
          <>
            <Link to="/dashboard">마이페이지</Link>
            <Link to="/logs">내역보기</Link>
            <button onClick={handleLogout}>로그아웃</button>
          </>
        )}
      </nav>

      {/* ✅ 라우트 */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/station" element={<Station />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </BrowserRouter>
  );
}