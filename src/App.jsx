import AppLive from "./AppLive.jsx";
import ResetPassword from "./ResetPassword.jsx";

import MentionsLegales from "./legal/MentionsLegales.jsx";
import PolitiqueConfidentialite from "./legal/PolitiqueConfidentialite.jsx";
import CGU from "./legal/CGU.jsx";
import Cookies from "./legal/Cookies.jsx";
import Contact from "./legal/Contact.jsx";

import "./firebase";

export default function App() {
  const path = window.location.pathname;

  switch (path) {
    case "/reset-password":
      return <ResetPassword />;

    case "/mentions-legales":
      return <MentionsLegales />;

    case "/confidentialite":
      return <PolitiqueConfidentialite />;

    case "/cgu":
      return <CGU />;

    case "/cookies":
      return <Cookies />;

    case "/contact":
      return <Contact />;

    default:
      return <AppLive />;
  }
}