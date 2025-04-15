import React from "react";
import LandingPage from "./pages/LandingPage";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Data from "./pages/data";
import SignUpPage from "./pages/signup";
import Update from "../components/Update";
import Delete from "../components/Delete";
import LoginPage from "./pages/login";
import HomePage from "./pages/homePage";
import ChatPage from "./pages/ChatPage";
import PrivateChatPage from "./pages/PrivateChatPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/" element={<Data />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/update/:email" element={<Update />} />
        <Route path="/delete/:email" element={<Delete />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/homePage" element={<HomePage />} />
        <Route path="/ChatPage" element={<ChatPage />} />
        <Route path="/private-chat/:recipientId" element={<PrivateChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;