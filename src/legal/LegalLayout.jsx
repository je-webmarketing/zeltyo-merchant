import React from "react";
import "./Legal.css";

export default function LegalLayout({ title, children }) {
  return (
    <main className="legal-page">
      <section className="legal-shell">
        <div className="legal-badge">Zeltyo · Informations légales</div>

        <h1>{title}</h1>

        <nav className="legal-nav">
          <a href="/mentions-legales">Mentions légales</a>
          <a href="/confidentialite">Confidentialité</a>
          <a href="/cgu">CGU</a>
          <a href="/cgv">CGV</a>
          <a href="/cookies">Cookies</a>
        </nav>

        <div className="legal-content">{children}</div>
      </section>
    </main>
  );
}