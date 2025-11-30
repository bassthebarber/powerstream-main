import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Feed from "./pages/Feed.jsx";
import Gram from "./pages/Gram.jsx";
import Reel from "./pages/Reel.jsx";
import PowerLine from "./pages/PowerLine.jsx";
import Network from "./pages/Network.jsx";
import SignIn from "./pages/SignIn.jsx";
import Register from "./pages/Register.jsx";
import "./styles/theme.css";

export default function App(){
  return (
    <BrowserRouter>
      <Header/>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/feed" element={<Feed/>}/>
        <Route path="/gram" element={<Gram/>}/>
        <Route path="/reel" element={<Reel/>}/>
        <Route path="/powerline" element={<PowerLine/>}/>
        <Route path="/network" element={<Network/>}/>
        <Route path="/signin" element={<SignIn/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="*" element={<main className="page"><h1>Not found</h1></main>}/>
      </Routes>
      <footer className="footer"> 2025 PowerStream  All Rights Reserved</footer>
    </BrowserRouter>
  );
}
