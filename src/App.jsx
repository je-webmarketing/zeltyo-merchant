import AppLive from "./AppLive.jsx";
import ResetPassword from "./ResetPassword.jsx";
import { app } from "./firebase";

export default function App() {
  const path = window.location.pathname;

  if (path === "/reset-password") {
    return <ResetPassword />;
  }

  return <AppLive />;
}