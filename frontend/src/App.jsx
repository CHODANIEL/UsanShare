import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
function Home(){ return <h1>USAN Front</h1>; }
function About(){ return <h2>About</h2>; }
export default function App(){
  return (
    <BrowserRouter>
      <nav style={{display:"flex",gap:8}}>
        <Link to="/">Home</Link><Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/about" element={<About/>}/>
      </Routes>
    </BrowserRouter>
  );
}