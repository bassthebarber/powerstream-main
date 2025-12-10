import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Feed from "./pages/Feed.jsx";
import Gram from "./pages/Gram.jsx";
import Reel from "./pages/Reel.jsx";
import PowerLine from "./pages/PowerLine.jsx";

class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError:false, error:null }; }
  static getDerivedStateFromError(error){ return { hasError:true, error }; }
  componentDidCatch(err, info){ console.error("App crashed:", err, info); }
  render(){
    if(this.state.hasError){
      return (
        <div style={{padding:24}}>
          <h2>Something broke in this route.</h2>
          <pre style={{whiteSpace:"pre-wrap"}}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function Nav(){
  const item = { padding:"8px 12px", border:"1px solid #d4a02a", borderRadius:12, marginRight:8, textDecoration:"none", color:"#ffd16b" };
  return (
    <div style={{padding:"12px 16px", borderBottom:"1px solid #3a2a00", position:"sticky", top:0, background:"#0a0a0a", zIndex:10}}>
      <Link to="/home" style={{...item, fontWeight:700}}>Home</Link>
      <Link to="/feed" style={item}>Feed</Link>
      <Link to="/gram" style={item}>Gram</Link>
      <Link to="/reel" style={item}>Reel</Link>
      <Link to="/powerline" style={item}>PowerLine</Link>
    </div>
  );
}

function Home(){
  return (
    <div style={{padding:24, maxWidth:860, margin:"0 auto"}}>
      <h1 style={{marginBottom:12}}>Welcome to PowerStream</h1>
      <p>Gold/black UI shell is loaded. Use the nav to test pages.</p>
    </div>
  );
}

export default function App(){
  return (
    <BrowserRouter>
      <Nav />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/gram" element={<Gram />} />
          <Route path="/reel" element={<Reel />} />
          <Route path="/powerline" element={<PowerLine />} />
          <Route path="*" element={<div style={{padding:24}}>Not found</div>} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
