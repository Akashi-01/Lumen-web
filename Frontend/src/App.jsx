// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import TalkDetail from "./pages/TalkDetail.jsx";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/talk/:videoId" element={<TalkDetail />} />
      </Routes>
    </BrowserRouter>
  );
}