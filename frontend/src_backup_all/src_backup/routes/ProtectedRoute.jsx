// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getEulaAccepted, isOldEnough, getParentConsent } from "../utils/policy";

export default function ProtectedRoute({ element }) {
  const hasEula = getEulaAccepted();
  if (!hasEula) return <Navigate to="/eula" replace />;

  const ageOk = isOldEnough(); // true | false | null
  const parentOk = getParentConsent();

  if (ageOk === false && !parentOk) {
    return <Navigate to="/age" replace />;
  }

  // ageOk === true OR parentOk === true OR unknown (no DOB yet):
  // If unknown and no parent consent, we still send them to /age via the EULA next-step.
  return element;
}


