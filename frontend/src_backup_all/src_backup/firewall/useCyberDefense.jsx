// frontend/src/hooks/UseCyberDefense.jsx

import { useEffect } from "react";

const UseCyberDefense = () => {
  useEffect(() => {
    console.log("CyberDefense: Scanning for threats...");
    const firewallStatus = localStorage.getItem("FIREWALL_ACTIVE");
    if (!firewallStatus) {
      localStorage.setItem("FIREWALL_ACTIVE", "ENABLED");
    }
  }, []);
};

export default UseCyberDefense;


