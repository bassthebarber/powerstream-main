// middleware/SessionGuard.js
import verifyXXToken from "../utils/VerifyXXToken";

export default function sessionGuard(WrappedComponent) {
  return function GuardedComponent(props) {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const result = verifyXXToken(token);

      if (!result.valid) {
        console.warn("SessionGuard blocked access:", result.reason);
        window.location.href = "/login";
        return null;
      }
    }
    return <WrappedComponent {...props} />;
  };
}
