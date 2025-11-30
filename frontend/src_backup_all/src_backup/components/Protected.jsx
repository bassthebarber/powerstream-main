import React from "react";
import { isAuthed } from "../lib/api/auth";
import { Navigate } from "react-router-dom";

export default function Protected({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}


