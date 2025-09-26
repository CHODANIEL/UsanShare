// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", displayName: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [sp] = useSearchParams();
const derivedId = id || sp.get("id") || "68d61116c7596d09d9f12b7b"; // ← 기본 ID

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await api("/api/auth/register", { method: "POST", body: form });
      // ✅ 회원가입 성공 후 로그인 페이지로
      nav("/login");
    } catch (e) {
      setErr(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h1>회원가입</h1>
      <form onSubmit={onSubmit}>
        <label>이메일<input name="email" type="email" value={form.email} onChange={onChange} required /></label>
        <label>비밀번호<input name="password" type="password" value={form.password} onChange={onChange} required /></label>
        <label>닉네임<input name="displayName" value={form.displayName} onChange={onChange} /></label>
        {err && <p>{err}</p>}
        <button disabled={loading}>{loading ? "처리중..." : "가입하기"}</button>
      </form>
      <p>이미 계정이 있나요? <Link to="/login">로그인</Link></p>
    </div>
  );
}