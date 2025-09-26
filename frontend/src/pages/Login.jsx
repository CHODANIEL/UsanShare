import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API } from "../lib/api";

export default function Login() {
    const nav = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr(""); setLoading(true);
        try {
            // ✅ API.login 사용
            const { token, user } = await API.login(form);
            console.log("로그인 응답:", { token, user }); // 확인용

            if (!token) throw new Error("토큰이 응답에 없습니다.");

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            window.dispatchEvent(new Event("auth-changed"));

            nav("/"); // 홈으로 이동
        } catch (e) {
            setErr(e.message);
        } finally { setLoading(false); }
    };

    return (
        <div>
            <h1>로그인</h1>
            <form onSubmit={onSubmit}>
                <label>이메일<input name="email" type="email" value={form.email} onChange={onChange} required /></label>
                <label>비밀번호<input name="password" type="password" value={form.password} onChange={onChange} required /></label>
                {err && <p>{err}</p>}
                <button disabled={loading}>{loading ? "처리중..." : "로그인"}</button>
            </form>
            <p>계정이 없나요? <Link to="/signup">회원가입</Link></p>
        </div>
    );
}