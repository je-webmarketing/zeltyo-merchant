import dotenv from "dotenv";
dotenv.config();

import admin from "firebase-admin";
import fs from "fs";
import path from "path";

function getServiceAccount() {
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!jsonEnv) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON manquant");
  }

  console.log("✅ Firebase chargé depuis variable Render");

  return JSON.parse(jsonEnv);
}
  if (filePath) {
    const fullPath = path.resolve(filePath);
    console.log("📁 Firebase service account chargé depuis fichier :", fullPath);

    const file = fs.readFileSync(fullPath, "utf-8");
    return JSON.parse(file);
  }

  throw new Error(
    "Firebase non configuré : ajoute FIREBASE_SERVICE_ACCOUNT_JSON ou FIREBASE_SERVICE_ACCOUNT_FILE"
  );
}

const serviceAccount = getServiceAccount();

console.log("SERVICE ACCOUNT TYPE =", serviceAccount.type);
console.log("SERVICE ACCOUNT PROJECT ID =", serviceAccount.project_id);
console.log("SERVICE ACCOUNT CLIENT EMAIL =", serviceAccount.client_email);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

export const db = admin.firestore();
export default admin;