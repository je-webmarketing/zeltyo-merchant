import dotenv from "dotenv";
dotenv.config();

import admin from "firebase-admin";
import fs from "fs";
import path from "path";

function getServiceAccount() {
  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;

  console.log("FIREBASE_SERVICE_ACCOUNT_FILE =", filePath);

  if (!filePath) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_FILE manquant");
  }

  const fullPath = path.resolve(filePath);
  const file = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(file);
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