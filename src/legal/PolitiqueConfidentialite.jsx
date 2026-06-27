import React from "react";
import LegalLayout from "./LegalLayout";

export default function PolitiqueConfidentialite() {
  return (
    <LegalLayout title="Politique de confidentialité">
      <p>Dernière mise à jour : Juin 2026</p>

      <h2>1. Préambule</h2>
      <p>
        La présente politique de confidentialité explique comment JE-Webmarketing
        collecte, utilise, conserve et protège les données personnelles traitées
        dans le cadre de l’utilisation de Zeltyo.
      </p>

      <h2>2. Responsable du traitement</h2>
      <p>
        Le responsable du traitement est :
        <br />
        <strong>JE-Webmarketing</strong>
        <br />
        Eric JARRY
        <br />
        494 rue Léon Blum, 34000 Montpellier, France
        <br />
        Email : contact@je-webmarketing.com
      </p>

      <h2>3. Données collectées</h2>
      <p>Zeltyo peut collecter les données suivantes :</p>
      <ul>
        <li>nom et prénom du commerçant ou utilisateur ;</li>
        <li>adresse email professionnelle ;</li>
        <li>numéro de téléphone ;</li>
        <li>nom, adresse et informations de l’établissement ;</li>
        <li>horaires, services, menus, images et contenus publiés ;</li>
        <li>données de connexion et journaux techniques ;</li>
        <li>réservations, demandes clients et données de fidélisation ;</li>
        <li>informations liées aux équipes et aux rôles utilisateurs.</li>
      </ul>

      <h2>4. Finalités du traitement</h2>
      <p>Les données sont utilisées pour :</p>
      <ul>
        <li>créer et gérer les comptes utilisateurs ;</li>
        <li>permettre l’accès sécurisé à Zeltyo ;</li>
        <li>gérer les établissements, réservations, clients et promotions ;</li>
        <li>envoyer des emails transactionnels, notamment de réinitialisation ;</li>
        <li>assurer le support et la maintenance ;</li>
        <li>améliorer la sécurité et la fiabilité du service.</li>
      </ul>

      <h2>5. Base juridique</h2>
      <p>
        Les traitements reposent, selon les cas, sur l’exécution du contrat,
        l’intérêt légitime de JE-Webmarketing, le respect d’obligations légales
        ou le consentement lorsque celui-ci est nécessaire.
      </p>

      <h2>6. Prestataires utilisés</h2>
      <p>
        Pour fournir Zeltyo, JE-Webmarketing s’appuie sur plusieurs prestataires
        techniques :
      </p>
      <ul>
        <li>Netlify pour l’hébergement frontend ;</li>
        <li>Render pour l’hébergement backend ;</li>
        <li>Brevo pour les emails transactionnels ;</li>
        <li>Google Maps pour certaines fonctionnalités de localisation.</li>
      </ul>

      <h2>7. Durée de conservation</h2>
      <p>
        Les données sont conservées pendant la durée nécessaire à l’utilisation
        de Zeltyo et à la gestion de la relation commerciale.
      </p>
      <p>
        Certaines données peuvent être conservées plus longtemps lorsqu’une
        obligation légale l’impose ou lorsqu’elles sont nécessaires à la preuve,
        à la sécurité ou à la résolution d’un litige.
      </p>

      <h2>8. Sécurité</h2>
      <p>
        JE-Webmarketing met en œuvre des mesures raisonnables pour protéger les
        données : accès sécurisés, HTTPS, mots de passe chiffrés, limitation des
        accès et surveillance des erreurs techniques.
      </p>
      <p>
        Aucun système informatique ne pouvant garantir une sécurité absolue,
        l’utilisateur reconnaît les risques inhérents à tout service en ligne.
      </p>

      <h2>9. Emails transactionnels</h2>
      <p>
        Les emails liés au fonctionnement du compte, notamment les emails de
        réinitialisation de mot de passe, sont envoyés via Brevo. Ces emails sont
        nécessaires au bon fonctionnement du service.
      </p>

      <h2>10. Google Maps</h2>
      <p>
        Certaines fonctionnalités peuvent intégrer Google Maps afin d’afficher ou
        localiser un établissement. Dans ce cadre, Google peut traiter certaines
        données techniques selon sa propre politique de confidentialité.
      </p>

      <h2>11. Cookies</h2>
      <p>
        Zeltyo utilise uniquement les cookies ou stockages techniques nécessaires
        au fonctionnement de la plateforme, notamment pour maintenir la session
        utilisateur et sécuriser l’accès.
      </p>
      <p>
        Aucun cookie publicitaire ou outil d’analyse marketing n’est actuellement
        utilisé.
      </p>

      <h2>12. Transferts hors Union européenne</h2>
      <p>
        Certains prestataires techniques, notamment Netlify, Render ou Google,
        peuvent traiter des données en dehors de l’Union européenne. Ces
        traitements sont encadrés par les garanties prévues par la réglementation
        applicable.
      </p>

      <h2>13. Droits des utilisateurs</h2>
      <p>
        Conformément au RGPD, chaque utilisateur dispose d’un droit d’accès, de
        rectification, d’effacement, d’opposition, de limitation et de portabilité
        de ses données.
      </p>
      <p>
        Pour exercer ces droits, l’utilisateur peut écrire à :
        <br />
        contact@je-webmarketing.com
      </p>

      <h2>14. Réclamation</h2>
      <p>
        En cas de difficulté, l’utilisateur peut introduire une réclamation
        auprès de la CNIL.
      </p>

      <h2>15. Modification</h2>
      <p>
        JE-Webmarketing se réserve le droit de modifier la présente politique de
        confidentialité afin de tenir compte des évolutions légales, techniques
        ou fonctionnelles de Zeltyo.
      </p>

      <h2>16. Contact</h2>
      <p>
        Pour toute question relative à la protection des données :
        <br />
        contact@je-webmarketing.com
      </p>
    </LegalLayout>
  );
}