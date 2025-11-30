// OverrideSecurityLayer.js
// Security gate for override execution

export default class OverrideSecurityLayer {
    constructor() {
        this.authenticated = false;
        console.log("[OverrideSecurityLayer] Security layer initialized.");
    }

    authenticate(passcode) {
        if (passcode === process.env.REACT_APP_OVERRIDE_KEY) {
            this.authenticated = true;
            console.log("[OverrideSecurityLayer] Authentication successful.");
        } else {
            console.warn("[OverrideSecurityLayer] Authentication failed.");
        }
    }

    isAuthenticated() {
        return this.authenticated;
    }
}

export const overrideSecurityLayer = new OverrideSecurityLayer();
