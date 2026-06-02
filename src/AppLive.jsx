import { useMemo, useState, useEffect } from "react";
import { buildApiUrl } from "./config/api";
import QRCodeScanner from "./components/QRCodeScanner";
import BusinessContentManager from "./components/BusinessContentManager";
import TeamPlanning from "./components/TeamPlanning";

function authFetch(path, options = {}) {
  const rawAuth = localStorage.getItem("zeltyo_merchant_auth");

  let auth = null;

  try {
    auth = rawAuth ? JSON.parse(rawAuth) : null;
  } catch {
    localStorage.removeItem("zeltyo_merchant_auth");
  }

  const token = auth?.token || "";

  return fetch(buildApiUrl(path), {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  }).then(async (response) => {
    if (response.status === 401) {
      localStorage.removeItem("zeltyo_merchant_auth");

      window.dispatchEvent(
        new CustomEvent("zeltyo-session-expired")
      );

      throw new Error("Session expirée. Merci de vous reconnecter.");
    }

    return response;
  });
}

import { QRCodeSVG } from "qrcode.react";
import BookingsManager from "./components/BookingsManager";
import MenuUploader from "./components/MenuUploader";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import JournalModule from "./modules/journal/JournalModule";
import ClientsModule from "./modules/clients/ClientsModule";
import TeamModule from "./modules/team/TeamModule";
import PromosModule from "./modules/promos/PromosModule";

const STORAGE_AUTH = "zeltyo_merchant_auth";
const STORAGE_MERCHANT_CONTACT = "zeltyo_merchant_contact";
const STORAGE_PROGRAM_SETTINGS = "zeltyo_program_settings";
const STORAGE_MENU = "zeltyo_menu";

const COLORS = {
  bg: "#050505",
  bgSoft: "#090909",
  surface: "#111111",
  surfaceSoft: "#161616",
  surfaceElevated: "#1A1A1A",
  border: "#2A2A2A",
  borderSoft: "rgba(242, 208, 107, 0.12)",
  gold: "#D4AF37",
  goldLight: "#F2D06B",
  copper: "#D97A32",
  copperLight: "#F2A65A",
  copperSoft: "rgba(217,122,50,0.12)",
  red: "#C94B32",
  redLight: "#E06A4C",
  text: "#F7F4EA",
  textSoft: "#CFC7B0",
  textMuted: "#A89F8A",
  green: "#22c55e",
  greenBg: "rgba(34,197,94,0.14)",
  blueBg: "rgba(59,130,246,0.14)",
  orangeBg: "rgba(217,122,50,0.14)",
  overlay: "rgba(0,0,0,0.35)",
};

const BUSINESS_CONFIG = {
  "BUS-2": {
  name: "Barber Club",
  rewardGoal: 6,
  rewardLabel: "1 coupe -50%",
  primaryColor: "#D4AF37",
  country: "CH",
  city: "Lausanne",
  region: "Vaud",
  zoneLabel: "Lausanne Centre",
  latitude: "46.5197",
  longitude: "6.6323",
  radiusKm: "2",
},
  "BUS-1": {
  name: "Le Café du Centre",
  rewardGoal: 10,
  rewardLabel: "1 boisson offerte",
  primaryColor: "#D4AF37",
  country: "CH",
  city: "Genève",
  region: "Genève",
  zoneLabel: "Genève Centre",
  latitude: "46.2044",
  longitude: "6.1432",
  radiusKm: "1.5",
},
};

const TABS = [
  { key: "dashboard", label: "Tableau de bord", icon: "◈" },
  { key: "clients", label: "Clients", icon: "◎" },
  { key: "promos", label: "Promotions", icon: "✦" },
  { key: "team", label: "Équipe & contrôle", icon: "▣" },
  { key: "settings", label: "Paramètres", icon: "⚙" },
  { key: "onboarding", label: "Démarrage", icon: "🚀" },
];

export default function App() {
  if (window.location.pathname === "/reset-password") {
  return <ResetPasswordPage />;
}
  const poweredByLabel = "Zeltyo by JE-Webmarketing";
  const poweredByUrl = "https://ericjarry34.systeme.io/je-webmarketing";

const savedProgramSettings = (() => {
  const saved = localStorage.getItem(STORAGE_PROGRAM_SETTINGS);

  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem(STORAGE_PROGRAM_SETTINGS);
    return null;
  }
})();

const [businessName, setBusinessName] = useState(
  savedProgramSettings?.businessName || ""
);

const [rewardGoal, setRewardGoal] = useState(
  savedProgramSettings?.rewardGoal || ""
);

const [rewardLabel, setRewardLabel] = useState(
  savedProgramSettings?.rewardLabel || ""
);

const [primaryColor, setPrimaryColor] = useState(
  savedProgramSettings?.primaryColor || ""
);

  const [search, setSearch] = useState("");
  const [scanId, setScanId] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notification, setNotification] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

 const [currentUser, setCurrentUser] = useState({
  name: "",
  role: "",
  email: "",
  businessId: "",
});

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({
  email: "",
  password: "",
});
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [promo, setPromo] = useState({
  title: "",
  code: "",
  description: "",
  channel: "Instagram",
  ctaLabel: "",
  ctaUrl: "",
});

  const [locationSettings, setLocationSettings] = useState(
  savedProgramSettings?.locationSettings || {
    country: "",
    city: "",
    region: "",
    zoneLabel: "",
    latitude: "",
    longitude: "",
    radiusKm: "",
  }
);

const [customers, setCustomers] = useState(() => {
  const saved = localStorage.getItem("zeltyo_customers");

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem("zeltyo_customers");
    return [];
  }
});

useEffect(() => {
  if (customers.length > 0 && !customers.some((c) => c.id === scanId)) {
    setScanId(customers[0].id);
  }
}, [customers, scanId]);

useEffect(() => {
  localStorage.setItem("zeltyo_customers", JSON.stringify(customers));
}, [customers]);

useEffect(() => {
  if (!isAuthenticated || !currentUser?.businessId) return;

  async function loadBusinessFromBackend() {
    try {
      const response = await authFetch(`/businesses/${currentUser.businessId}`);
      const data = await response.json();

      if (!response.ok || !data.ok || !data.business) return;

      const business = data.business;
      console.log("COMMERCE BACKEND CHARGÉ =", business);

      setBusinessName(business.name || "");
      setRewardGoal(business.rewardGoal || "");
      setRewardLabel(business.rewardLabel || "");

      setLocationSettings({
        country: business.country || "",
        city: business.city || "",
        region: business.region || "",
        zoneLabel: business.zoneLabel || "",
        latitude: business.latitude || "",
        longitude: business.longitude || "",
        radiusKm: business.radiusKm || "",
      });

      saveProgramSettings({
        businessName: business.name || "",
        rewardGoal: business.rewardGoal || "",
        rewardLabel: business.rewardLabel || "",
        primaryColor,
        locationSettings: {
          country: business.country || "",
          city: business.city || "",
          region: business.region || "",
          zoneLabel: business.zoneLabel || "",
          latitude: business.latitude || "",
          longitude: business.longitude || "",
          radiusKm: business.radiusKm || "",
        },
        businessId: currentUser.businessId,
      });
    } catch (error) {
      console.error("Erreur chargement commerce connecté :", error);
    }
  }

  loadBusinessFromBackend();
}, [isAuthenticated, currentUser?.businessId]);

const [promotions, setPromotions] = useState(() => {
  const saved = localStorage.getItem("zeltyo_promotions");

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem("zeltyo_promotions");
    return [];
  }
});

useEffect(() => {
  localStorage.setItem("zeltyo_promotions", JSON.stringify(promotions));
}, [promotions]);

const [merchantContact, setMerchantContact] = useState(() => {
  const fallback = {
    shopName: "",
    ownerName: "",
    phone: "",
    email: "",
    address: "",
    postalCode: "",
    city: "",
    country: "",
    website: "",
    vatNumber: "",
    reviewUrl: "",
  };

  const saved = localStorage.getItem(STORAGE_MERCHANT_CONTACT);

  if (!saved) return fallback;

  try {
    return {
      ...fallback,
      ...JSON.parse(saved),
    };
  } catch {
    localStorage.removeItem(STORAGE_MERCHANT_CONTACT);
    return fallback;
  }
});

const [employees, setEmployees] = useState(() => {
  const saved = localStorage.getItem("zeltyo_employees");

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem("zeltyo_employees");
    return [];
  }
});

useEffect(() => {
  localStorage.setItem("zeltyo_employees", JSON.stringify(employees));
}, [employees]);

const [activityLog, setActivityLog] = useState(() => {
  const saved = localStorage.getItem("zeltyo_activity_log");

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem("zeltyo_activity_log");
    return [];
  }
});

useEffect(() => {
  localStorage.setItem("zeltyo_activity_log", JSON.stringify(activityLog));
}, [activityLog]);

const [menuItems, setMenuItems] = useState(() => {
  const saved = localStorage.getItem("zeltyo_menu");

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem("zeltyo_menu");
    return [];
  }
});

useEffect(() => {
  function handleSessionExpired() {
    setIsAuthenticated(false);
    setCurrentUser({
      name: "",
      role: "",
      email: "",
      businessId: "",
    });
    showNotification("Session expirée, merci de vous reconnecter");
  }

  window.addEventListener("zeltyo-session-expired", handleSessionExpired);

  return () => {
    window.removeEventListener("zeltyo-session-expired", handleSessionExpired);
  };
}, []);

const [planning, setPlanning] = useState(() => {
  const saved = localStorage.getItem("zeltyo_planning");
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem("zeltyo_planning");
    return [];
  }
});

useEffect(() => {
  localStorage.setItem("zeltyo_planning", JSON.stringify(planning));
}, [planning]);

const [newMenuItem, setNewMenuItem] = useState({
  name: "",
  description: "",
  price: "",
  category: "Snacking",
  active: true,
});  

 const [newEmployee, setNewEmployee] = useState({
  name: "",
  email: "",
  role: "employee",
  hourlyCost: "",
});

 const [menuImage, setMenuImage] = useState(
  localStorage.getItem("merchant_menu_image") || ""
);

const [shifts, setShifts] = useState(() => {
  const saved = localStorage.getItem("zeltyo_shifts");

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem("zeltyo_shifts");
    return [];
  }
});

function saveShifts(nextShifts) {
  setShifts(nextShifts);
  localStorage.setItem("zeltyo_shifts", JSON.stringify(nextShifts));
}

function startShift(employeeId) {
  if (isWorking(employeeId)) {
    showNotification("Cet employé est déjà en service");
    return;
  }

  const newShift = {
    id: `SHIFT-${Date.now()}`,
    employeeId,
    start: new Date().toISOString(),
    end: null,
  };

  saveShifts([...shifts, newShift]);
  showNotification("Prise de service enregistrée");
}

function endShift(employeeId) {
  const updated = shifts.map((shift) => {
    if (shift.employeeId === employeeId && !shift.end) {
      return { ...shift, end: new Date().toISOString() };
    }

    return shift;
  });

  saveShifts(updated);
  showNotification("Fin de service enregistrée");
}

function isWorking(employeeId) {
  return shifts.some((shift) => shift.employeeId === employeeId && !shift.end);
}

function getTodayShifts() {
  const today = new Date().toISOString().slice(0, 10);
  return shifts.filter((shift) => shift.start.startsWith(today));
}

async function handleMenuUpload(content) {
  const item = {
    ...content,
    businessId: currentUser?.businessId || "",
  };

  try {
  const response = await authFetch("/business-content", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  const json = await response.json();

  if (json.ok && json.item) {
    setMenuItems((prev) => [json.item, ...prev]);
  }
} catch (err) {
  console.error(err);
  showNotification("Erreur sauvegarde contenu");
}

  if (content.mimeType?.startsWith("image/")) {
    setMenuImage(content.fileData);
    localStorage.setItem("merchant_menu_image", content.fileData);
  }

  showNotification("Contenu importé avec succès");
}

function handleDeleteMenuItem(itemId) {
  setMenuItems((prev) =>
    prev.filter((item) => item.id !== itemId)
  );

  showNotification("Contenu supprimé");
}

 function applyBusinessConfig(businessId) {
  const config = BUSINESS_CONFIG[businessId];
  if (!config) return;

  setBusinessName(config.name);
  setRewardGoal(config.rewardGoal);
  setRewardLabel(config.rewardLabel);
  setPrimaryColor(config.primaryColor);
  setLocationSettings({
  country: config.country,
  city: config.city,
  region: config.region || "",
  zoneLabel: config.zoneLabel,
  latitude: config.latitude,
  longitude: config.longitude,
  radiusKm: config.radiusKm,
});
}

function handleUpdateMenuItem(itemId, updatedItem) {
  setMenuItems((prev) =>
    prev.map((item) =>
      item.id === itemId ? updatedItem : item
    )
  );
}

  function saveProgramSettings(settings) {
  localStorage.setItem(STORAGE_PROGRAM_SETTINGS, JSON.stringify(settings));
}

function loadProgramSettings() {
  const raw = localStorage.getItem(STORAGE_PROGRAM_SETTINGS);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Erreur lecture réglages programme:", error);
    localStorage.removeItem(STORAGE_PROGRAM_SETTINGS);
    return null;
  }
}

  async function handleLogin() {
    try {
      const response = await fetch(buildApiUrl("/auth/merchant-login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        showNotification(data.error || "Identifiants incorrects");
        return;
      }

      localStorage.setItem(STORAGE_AUTH, JSON.stringify(data));

       setCurrentUser({
        name: data.user.name,
        role: data.user.role === "merchant_admin" ? "admin" : "employee",
        email: data.user.email,
        businessId: data.user.businessId,
      });

      // applyBusinessConfig(data.user.businessId);
      setIsAuthenticated(true);
      setNotification("");
    } catch (error) {
      console.error("Erreur login:", error);
      showNotification("Erreur de connexion au serveur");
    }
  }


  function handleLogout() {
    localStorage.removeItem(STORAGE_AUTH);
    setIsAuthenticated(false);
    setLoginForm({ email: "", password: "" });
    setNotification("");
  }

  function getNowISO() {
  return new Date().toISOString();
}

function formatDate(value) {
  if (!value) return "Date non disponible";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date non disponible";
  }

  return date.toLocaleString("fr-FR");
}

function addLog(action, detail) {
  const logItem = {
    id: Date.now(),
    actor: currentUser.name,
    role: currentUser.role,
    action,
    detail,
    date: new Date().toISOString(),
    archived: false,
    archivedAt: null,
  };

  setActivityLog((prev) => {
    const safePrev = Array.isArray(prev) ? prev : [];
    return [logItem, ...safePrev].slice(0, 50);
  });

  setEmployees((prev) =>
    prev.map((employee) =>
      employee.name === currentUser.name
        ? { ...employee, lastAction: detail }
        : employee
    )
  );
}

function archiveLog(logId) {
  setActivityLog((prev) =>
    prev.map((log) =>
      log.id === logId
        ? { ...log, archived: true, archivedAt: new Date().toISOString() }
        : log
    )
  );

  showNotification("Action archivée");
}

function restoreLog(logId) {
  setActivityLog((prev) =>
    prev.map((log) =>
      log.id === logId
        ? { ...log, archived: false, archivedAt: null }
        : log
    )
  );

  showNotification("Action restaurée");
}

function purgeOldLogs() {
  const now = Date.now();

  setActivityLog((prev) =>
    prev.filter((log) => {
      if (!log.archived) return true;

      const archivedTime = new Date(log.archivedAt || log.date).getTime();
      if (Number.isNaN(archivedTime)) return true;

      return (now - archivedTime) / 86400000 <= 30;
    })
  );

  showNotification("Purge du journal effectuée");
}

  function showNotification(message) {
    setNotification(message);
    setTimeout(() => setNotification(""), 2200);
  }

  function getTier(points) {
    if (points >= 20) return "Or";
    if (points >= 10) return "Argent";
    return "Bronze";
  }

 async function addCustomer() {
  if (!newCustomer.name.trim()) {
    showNotification("Nom du client obligatoire");
    return;
  }

  const id = `CL-${Date.now()}`;

  const customer = {
  id,
  loyaltyId: id,
  businessId: currentUser?.businessId || "",
  name: newCustomer.name.trim(),
  email: newCustomer.email.trim(),
  phone: newCustomer.phone.trim(),
  points: 0,
  visits: 0,
  rewardsAvailable: 0,
  tier: getTier(0),
  lastVisit: "Nouveau",
};

  const response = await authFetch("/clients", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(customer),
});

let data = {};

try {
  data = await response.json();
} catch {
  data = {};
}

if (!response.ok || !data.ok) {
  showNotification(data.error || "Erreur création client backend");
  return;
}

const savedCustomer = data.client || customer;

 setCustomers((prev) => {
  const safePrev = Array.isArray(prev) ? prev : [];
  return [savedCustomer, ...safePrev];
});

  setNewCustomer({
    name: "",
    email: "",
    phone: "",
  });

  addLog("A ajouté un client", `${customer.name} (${customer.id})`);
  showNotification(`Client ajouté par ${currentUser.name}`);
}
async function rewardVisit(targetId = scanId) {
    if (targetId?.nativeEvent || targetId?.target) {
    targetId = scanId;
  }
  
  if (!targetId) {
    showNotification("Sélectionne un client");
    return;
  }

  try {
    console.log("VALIDATION VISITE =", {
      clientId: targetId,
      businessId: currentUser?.businessId,
    });

    const response = await authFetch("/clients/visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: targetId,
        loyaltyId: targetId,
        businessId: currentUser?.businessId || "",
        points: 1,
      }),
    });

    const data = await response.json();

    console.log("REPONSE VISITE =", data);

    if (!response.ok || !data.ok) {
      showNotification(data.error || "Erreur validation visite");
      return;
    }

    if (data.client) {
      setCustomers((prev) =>
        prev.map((customer) =>
          String(customer.id) === String(data.client.id) ||
          String(customer.loyaltyId) === String(data.client.loyaltyId)
            ? data.client
            : customer
        )
      );
    }

    if (Array.isArray(data.clients)) {
      setCustomers(data.clients);
      localStorage.setItem("zeltyo_customers", JSON.stringify(data.clients));
    }

    addLog(
      "A validé une visite",
      `${data.client?.name || "Client"} (${targetId})`
    );

    showNotification(`+1 point ajouté pour ${data.client?.name || "le client"}`);
  } catch (error) {
    console.error("Erreur validation visite :", error);
    showNotification("Erreur connexion backend");
  }
}

 function useReward(customerId) {
  const customerFound = customers.find((c) => c.id === customerId);

  if (!customerFound || Number(customerFound.rewardsAvailable || 0) <= 0) {
    showNotification("Aucune récompense disponible");
    return;
  }

  setCustomers((prev) =>
    prev.map((c) => {
      if (c.id !== customerId) return c;

      const nextPoints = Math.max(0, Number(c.points || 0) - Number(rewardGoal || 10));
      const nextRewards = Math.floor(nextPoints / Number(rewardGoal || 10));

      return {
        ...c,
        points: nextPoints,
        rewardsAvailable: nextRewards,
      };
    })
  );

  addLog("A utilisé une récompense", `${customerFound.name} (${customerFound.id})`);
  showNotification(`Récompense utilisée pour ${customerFound.name}`);
}

  function getNowLabel() {
  return new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

  async function addPromotion() {
    if (!["admin", "merchant_admin"].includes(currentUser.role)) {
      showNotification("Seul l’administrateur peut créer une promotion");
      return;
    }

    if (!promo.title.trim() || !promo.description.trim()) return;

   const now = new Date();
const validUntil = new Date();
validUntil.setDate(now.getDate() + 30);

const newPromo = {
  id: Date.now(),
  title: promo.title,
  code: promo.code || `PROMO${promotions.length + 1}`,
  description: promo.description,
  channel: promo.channel,
  status: "Active",
  createdBy: currentUser.name,
  createdAt: getNowLabel(),
 validUntil: promo.validUntil || validUntil.toISOString(),
  ctaLabel: promo.ctaLabel,
  ctaUrl: promo.ctaUrl,
};
    setPromotions([newPromo, ...promotions]);

    const response = await authFetch("/promotions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    ...newPromo,
    businessId: currentUser.businessId || "",
  }),
});

let data = {};

try {
  data = await response.json();
} catch {
  data = {};
}

if (!response.ok || !data.ok) {
  showNotification(data.error || "Erreur publication promotion");
  return;
}

    setPromo({
      title: "",
      code: "",
      description: "",
      channel: "Instagram",
    });

    addLog("A créé une promotion", `Promotion créée : ${newPromo.title}`);
    showNotification("Promotion publiée avec succès");
  }

 function addMenuItem() {
  if (!newMenuItem.name.trim() || !newMenuItem.price) {
    showNotification("Nom et prix obligatoires pour le menu");
    return;
  }

  const item = {
    id: `MENU-${Date.now()}`,
    businessId: currentUser?.businessId || "",
    name: newMenuItem.name.trim(),
    description: newMenuItem.description.trim(),
    price: Number(newMenuItem.price),
    category: newMenuItem.category,
    active: Boolean(newMenuItem.active),
  };

  setMenuItems((prev) => {
  const safePrev = Array.isArray(prev) ? prev : [];
  return [item, ...safePrev];
});

  setNewMenuItem({
    name: "",
    description: "",
    price: "",
    category: "Snacking",
    active: true,
  });

  addLog(
    "A ajouté un produit au menu",
    `${item.name} (${item.price.toFixed(2)} €)`
  );

  showNotification("Produit ajouté au menu");

}

function toggleMenuItem(menuId) {
  setMenuItems((prev) =>
    prev.map((item) =>
      item.id === menuId
        ? { ...item, active: !item.active }
        : item
    )
  );

  const found = menuItems.find((item) => item.id === menuId);
  if (found) {
    addLog(
      "A modifié un produit du menu",
      `${found.name} → ${found.active ? "Inactif" : "Actif"}`
    );
  }

  showNotification("Menu mis à jour");
}

function archiveMenuItem(menuId) {
  const confirmed = window.confirm(
    "Archiver ce produit ? Il pourra être restauré."
  );

  if (!confirmed) return;

  const found = menuItems.find((item) => item.id === menuId);

  setMenuItems((prev) =>
    prev.map((item) =>
      item.id === menuId
        ? {
            ...item,
            archived: true,
            archivedAt: new Date().toISOString(),
            archivedBy: currentUser.email,
          }
        : item
    )
  );

  if (found) {
    addLog("A archivé un produit", found.name);
  }

  showNotification("Produit archivé");
}

  function addEmployee() {
    if (currentUser.role !== "admin") {
      showNotification(
        "Seul l’administrateur peut ajouter un membre de l’équipe"
      );
      return;
    }

    if (!newEmployee.name.trim() || !newEmployee.email.trim()) {
      showNotification("Nom et email requis pour ajouter un membre");
      return;
    }

    const employee = {
  id: `EMP-${Date.now()}`,
  businessId: currentUser.businessId,
  name: newEmployee.name.trim(),
  email: newEmployee.email.trim(),
  password: newEmployee.role === "admin" ? "admin123" : "employe123",
  role: newEmployee.role,
  status: "Actif",
  lastAction: "Compte créé",
  hourlyCost: Number(newEmployee.hourlyCost || 0),
};

    setEmployees((prev) => [...prev, employee]);
    addLog(
      "A ajouté un membre de l’équipe",
      `${employee.name} — ${
        employee.role === "admin" ? "Administrateur" : "Employé"
      }`
    );
    setNewEmployee({
  name: "",
  email: "",
  role: "employee",
  hourlyCost: "",
});
    showNotification("Membre ajouté avec succès");
  }

 
 async function togglePromotionStatus(promoId) {
  if (!["admin", "merchant_admin"].includes(currentUser.role)) {
    showNotification("Seul l’administrateur peut modifier une promotion");
    return;
  }

  const targetPromo = promotions.find((p) => p.id === promoId);
  if (!targetPromo) return;

  const nextStatus = targetPromo.status === "Active" ? "Pause" : "Active";

  setPromotions((prev) =>
    prev.map((p) =>
      p.id === promoId
        ? { ...p, status: nextStatus }
        : p
    )
  );

  const response = await authFetch(`/promotions/${promoId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: nextStatus,
    }),
  });

  if (!response.ok) {
  showNotification("Erreur modification promotion");
  return;
}

  addLog(
    "A modifié une promotion",
    `${targetPromo.title} → ${nextStatus}`
  );

  showNotification("Statut de la promotion mis à jour");
}

async function archivePromotion(promoId) {
  if (!["admin", "merchant_admin"].includes(currentUser.role)) {
    showNotification("Seul l’administrateur peut archiver une promotion");
    return;
  }

  const targetPromo = promotions.find((p) => p.id === promoId);
  if (!targetPromo) return;

  setPromotions((prev) =>
    prev.map((p) =>
      p.id === promoId
        ? {
            ...p,
            status: "Archivée",
            archivedAt: getNowLabel(),
          }
        : p
    )
  );

  const response = await authFetch(`/promotions/${promoId}/archive`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
  showNotification("Erreur archivage promotion");
  return;
}

  addLog("A archivé une promotion", `${targetPromo.title}`);
  showNotification("Promotion archivée");
}

  function generateMessage(customer) {
  const remaining =
    rewardGoal - (customer.points % rewardGoal || rewardGoal);

  // CAS 1 : récompense disponible
  if (customer.rewardsAvailable > 0) {
    return `Bonjour ${customer.name} 👋

🎉 Bonne nouvelle !

Vous avez ${customer.rewardsAvailable} récompense(s) disponible(s) :
👉 ${rewardLabel}

Passez en profiter dès aujourd’hui !

${
  merchantContact.reviewUrl
    ? `⭐ Vous pouvez aussi laisser un avis ici :
${merchantContact.reviewUrl}`
    : ""
}`;
  }

  // CAS 2 : pas encore de récompense
  return `Bonjour ${customer.name} 👋

Vous avez actuellement ${customer.points} point(s).

Encore ${remaining} point(s) avant votre récompense :
🎁 ${rewardLabel}

À très vite chez ${businessName} !

${
  merchantContact.reviewUrl
    ? `⭐ Votre avis compte beaucoup :
${merchantContact.reviewUrl}`
    : ""
}`;
}

  function openWhatsApp(customer) {
    const message = generateMessage(customer);
    const phone = (customer.phone || "").replace("+", "");
    if (!phone) {
      showNotification("Numéro de téléphone manquant pour ce client");
      return;
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    addLog(
      "A préparé une relance WhatsApp",
      `${customer.name} (${customer.id})`
    );
    window.open(url, "_blank");
  }

  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return customers;

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(q) ||
        customer.email.toLowerCase().includes(q) ||
        customer.id.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const totalClients = customers.length;
  const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);
  const totalVisits = customers.reduce((sum, c) => sum + c.visits, 0);
  const totalRewards = customers.reduce(
    (sum, c) => sum + c.rewardsAvailable,
    0
  );
  const activePromos = promotions.filter((p) => p.status === "Active").length;

  const topCustomers = [...customers]
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);

  const clientsToRelance = customers.filter((c) => {
    const remaining = rewardGoal - (c.points % rewardGoal || rewardGoal);
    return remaining <= 2 && c.rewardsAvailable === 0;
  });

  const inactiveClients = customers.filter((c) => {
  const lastVisit = c.lastVisit || c.lastVisitAt || c.updatedAt || c.createdAt;

  if (!lastVisit) return false;
  if (lastVisit === "Aujourd'hui" || lastVisit === "Nouveau") return false;

  const lastDate = lastVisit.includes("/")
    ? new Date(lastVisit.split("/").reverse().join("-"))
    : new Date(lastVisit);

  if (Number.isNaN(lastDate.getTime())) return false;

  const now = new Date();
  const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

  return diffDays >= 7;
});

  const sendSmart = async (type) => {
    try {
      const rawAuth = localStorage.getItem(STORAGE_AUTH);
      if (!rawAuth) {
        alert("Session invalide");
        return;
      }

      const token = JSON.parse(rawAuth)?.token;

      const response = await authFetch(
  "/automation-segmented/send-smart-promo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            },
          body: JSON.stringify({ type }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erreur envoi");
        return;
      }

      alert(`Promo envoyée à ${data.count} clients 🚀`);
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    }
  };

  const sendPromo = async () => {
  try {
    const rawAuth = localStorage.getItem(STORAGE_AUTH);
    if (!rawAuth) {
      alert("Vous devez être connecté");
      return;
    }

    const auth = JSON.parse(rawAuth);
    const token = auth?.token;

    if (!token) {
      alert("Session invalide");
      return;
    }

    const response = await authFetch(
  "/notifications-advanced/send-to-subscription",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          },
        body: JSON.stringify({
          subscriptionId: "a67b1b72-bc4c-431b-a3b8-9bf9d79d3079",
          message: "🔥 Promo du jour : Croissant + café à -20% ☕🥐",
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      alert("Erreur lors de l'envoi");
      return;
    }

    alert("Promo envoyée 🚀");
  } catch (error) {
    console.error(error);
    alert("Erreur réseau");
  }
};

useEffect(() => {
  const raw = localStorage.getItem(STORAGE_AUTH);

  if (raw) {
    try {
      const auth = JSON.parse(raw);

      if (!auth?.token || !auth?.user) {
        localStorage.removeItem(STORAGE_AUTH);
        return;
      }

      setCurrentUser({
        id: auth.user.id,
        name: auth.user.name,
        role: auth.user.role === "merchant_admin" ? "admin" : "employee",
        email: auth.user.email,
        businessId: auth.user.businessId,
      });

      fetch(buildApiUrl(`/businesses/${auth.user.businessId}`), {
  headers: {
    Authorization: `Bearer ${auth.token}`,
  },
})
  .then((res) => res.json())
  .then((data) => {
    console.log("COMMERCE BACKEND SESSION =", data);

    if (data.ok && data.business) {
      setBusinessName(data.business.name || "");
      setRewardGoal(data.business.rewardGoal || 10);
      setRewardLabel(data.business.rewardLabel || "");
      setLocationSettings({
        country: data.business.country || "",
        city: data.business.city || "",
        region: data.business.region || "",
        zoneLabel: data.business.zoneLabel || "",
        latitude: data.business.latitude || "",
        longitude: data.business.longitude || "",
        radiusKm: data.business.radiusKm || "",
      });
    }
  });

      if (!auth.user.businessId) {
        setActiveTab("onboarding");
      }

      const savedProgramSettings = loadProgramSettings();

   if (savedProgramSettings?.businessId === auth.user.businessId) {

  setBusinessName(savedProgramSettings.businessName || "");
  setRewardGoal(savedProgramSettings.rewardGoal || "");
  setRewardLabel(savedProgramSettings.rewardLabel || "");
  setPrimaryColor(savedProgramSettings.primaryColor || "");

  setLocationSettings(
    savedProgramSettings.locationSettings || {
      country: "",
      city: "",
      region: "",
      zoneLabel: "",
      latitude: "",
      longitude: "",
      radiusKm: "",
    }
  );
}else {
        setLocationSettings({
  country: "",
  city: "",
  region: "",
  zoneLabel: "",
  latitude: "",
  longitude: "",
  radiusKm: "",
});
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error("Erreur lecture session:", error);
      localStorage.removeItem(STORAGE_AUTH);
    }
  }
     
}, []);

useEffect(() => {
  if (!isAuthenticated) return;
  if (!currentUser?.businessId) return;
  if (!businessName || !businessName.trim()) return;

  saveProgramSettings({
    businessName,
    rewardGoal,
    rewardLabel,
    primaryColor,
    locationSettings,
    businessId: currentUser.businessId,
  });
}, [
  isAuthenticated,
  currentUser?.businessId,
  businessName,
  rewardGoal,
  rewardLabel,
  primaryColor,
  locationSettings,
]);

useEffect(() => {
  if (!isAuthenticated) return;

  async function loadCustomersFromBackend() {
  try {
    const rawAuth = localStorage.getItem(STORAGE_AUTH);
    const token = rawAuth ? JSON.parse(rawAuth)?.token : "";

    const response = await authFetch("/clients", {
  method: "GET",
});

   let data = {};

try {
  data = await response.json();
} catch {
  data = {};
}

if (!response.ok || !data.ok) {
  showNotification(data.error || "Impossible de charger les clients");
  return;
}

if (Array.isArray(data.clients)) {
  setCustomers(data.clients);
}
  } catch (error) {
    console.error("Erreur chargement clients backend :", error);
  }
}

  loadCustomersFromBackend();
}, [isAuthenticated]);

async function handleSaveMerchantContact() {
  try {
    const businessId = currentUser?.businessId || "";

    if (!businessId) {
      showNotification("Business ID manquant");
      return;
    }

    const payload = {
      ...merchantContact,
      businessId,
      shopName: merchantContact.shopName.trim(),
      ownerName: merchantContact.ownerName.trim(),
      phone: merchantContact.phone.trim(),
      email: merchantContact.email.trim(),
      address: merchantContact.address.trim(),
      postalCode: merchantContact.postalCode.trim(),
      city: merchantContact.city.trim(),
      country: merchantContact.country.trim(),
      website: merchantContact.website.trim(),
      vatNumber: merchantContact.vatNumber.trim(),
      reviewUrl: merchantContact.reviewUrl.trim(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_MERCHANT_CONTACT, JSON.stringify(payload));

    if (payload.shopName) {
      setBusinessName(payload.shopName);
    }

    console.log("LOCATION SETTINGS =", locationSettings);
    console.log("BUSINESS PAYLOAD =", {
  name: payload.shopName,
  country: payload.country,
  city: payload.city,
  region: locationSettings.region,
  zoneLabel: locationSettings.zoneLabel,
  radiusKm: locationSettings.radiusKm,
  latitude: locationSettings.latitude,
  longitude: locationSettings.longitude,
});
console.log("ENVOI BACKEND BUSINESS =", businessId);
    const response = await authFetch(`/businesses/${businessId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  name: payload.shopName,
  country: payload.country,
  city: payload.city,
  region: locationSettings.region,
  zoneLabel: locationSettings.zoneLabel,
  radiusKm: locationSettings.radiusKm,
  latitude: locationSettings.latitude,
  longitude: locationSettings.longitude,
  rewardGoal,
  rewardLabel,

  reviewUrl: payload.reviewUrl,
  website: payload.website,
  phone: payload.phone,
  email: payload.email,
  address: payload.address,
}),

    });
const data = await response.json();

console.log("REPONSE BACKEND BUSINESS =", data);

if (!response.ok || !data.ok) {
  showNotification(data.error || "Erreur sauvegarde commerce backend");
  return;
}

showNotification("Coordonnées enregistrées et synchronisées");

    if (!response.ok || !data.ok) {
      showNotification(data.error || "Erreur sauvegarde commerce backend");
      return;
    }

    showNotification("Coordonnées enregistrées et synchronisées");
  } catch (error) {
    console.error("Erreur sauvegarde coordonnées :", error);
    showNotification("Erreur sauvegarde");
  }
  showNotification("Commerce synchronisé avec succès");
} 

const socialPreview = `🎁 ${
  promo.title || "Votre offre fidélité"
}

${
  promo.description ||
  "Décrivez ici votre promotion en quelques lignes claires et rassurantes."
}

Présentez votre carte fidélité chez ${businessName}.
Code : ${promo.code || "PROMO10"}

${
  merchantContact.reviewUrl
    ? `⭐ Donnez votre avis ici :
${merchantContact.reviewUrl}`
    : ""
}`;

  const styles = {
    page: {
      minHeight: "100vh",
      background:
        "radial-gradient(circle at top, rgba(242,166,90,0.08), transparent 28%), linear-gradient(180deg, #050505 0%, #070707 100%)",
      padding: "24px",
      fontFamily: "Inter, Arial, sans-serif",
      color: COLORS.text,
    },
    container: {
      maxWidth: "1380px",
      margin: "0 auto",
    },
    glass: {
      background: "rgba(17,17,17,0.88)",
      backdropFilter: "blur(10px)",
      border: `1px solid ${COLORS.border}`,
      boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
    },
    topbar: {
      display: "grid",
      gridTemplateColumns: "minmax(320px, 1.2fr) minmax(300px, 1fr)",
      gap: "18px",
      marginBottom: "18px",
      alignItems: "stretch",
    },
    brandCard: {
      display: "flex",
      alignItems: "center",
      gap: "18px",
      background:
        "linear-gradient(135deg, rgba(17,17,17,0.95), rgba(11,11,11,0.98))",
      padding: "18px 20px",
      borderRadius: "24px",
      border: `1px solid ${COLORS.border}`,
      boxShadow: "0 12px 28px rgba(0,0,0,0.32)",
      minHeight: "112px",
    },
brandLogoWrap: {
  padding: "10px",
  borderRadius: "26px",
  background: "transparent",
  border: "none",
  boxShadow: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
},

brandLogo: {
  width: "130px",
  height: "130px",
  borderRadius: "22px",
  background: "transparent",
  padding: "0",
  objectFit: "contain",
  display: "block",
},
    brandOverline: {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "6px 12px",
  borderRadius: "999px",
  background: "rgba(242,166,90,0.10)",
  border: `1px solid ${COLORS.copper}`,
  color: COLORS.copperLight,
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  marginBottom: "10px",
},

brandTitle: {
  fontSize: "34px",
  fontWeight: 900,
  lineHeight: 1,
  color: COLORS.goldLight,
  marginBottom: "8px",
  letterSpacing: "-0.03em",
},

brandText: {
  color: COLORS.textSoft,
  fontSize: "15px",
  lineHeight: 1.6,
  margin: 0,
  maxWidth: "520px",
},
    sessionCard: {
      background:
        "linear-gradient(135deg, rgba(17,17,17,0.95), rgba(14,14,14,0.98))",
      padding: "18px 20px",
      borderRadius: "24px",
      border: `1px solid ${COLORS.border}`,
      boxShadow: "0 12px 28px rgba(0,0,0,0.32)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      gap: "14px",
    },
    sessionTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "12px",
      flexWrap: "wrap",
    },
    sessionTitle: {
      fontSize: "13px",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: COLORS.textMuted,
      fontWeight: 800,
      marginBottom: "8px",
    },
    sessionName: {
      fontSize: "22px",
      fontWeight: 900,
      color: COLORS.text,
      marginBottom: "6px",
    },
    sessionMeta: {
      color: COLORS.textSoft,
      fontSize: "14px",
      lineHeight: 1.5,
    },
    topActions: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      alignItems: "center",
    },
    userSelect: {
      width: "100%",
      padding: "13px 14px",
      borderRadius: "14px",
      border: `1px solid ${COLORS.border}`,
      boxSizing: "border-box",
      fontSize: "14px",
      outline: "none",
      background: COLORS.surfaceSoft,
      color: COLORS.text,
      minWidth: "250px",
    },
    buttonGhost: {
      border: `1px solid ${COLORS.border}`,
      background: COLORS.surfaceSoft,
      color: COLORS.text,
      padding: "12px 16px",
      borderRadius: "14px",
      fontWeight: 700,
      cursor: "pointer",
      transition: "0.2s ease",
    },
    buttonPrimary: {
      border: "none",
      background: "linear-gradient(135deg, #D97A32, #F2A65A)",
      color: "#111111",
      padding: "12px 16px",
      borderRadius: "14px",
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: "0 12px 24px rgba(217,122,50,0.18)",
    },
    hero: {
      display: "grid",
      gridTemplateColumns: "1.4fr 0.9fr",
      gap: "18px",
      background:
        "linear-gradient(135deg, rgba(17,17,17,0.96), rgba(10,10,10,0.98))",
      borderRadius: "28px",
      padding: "28px",
      color: COLORS.text,
      marginBottom: "18px",
      boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
      border: `1px solid ${COLORS.border}`,
      position: "relative",
      overflow: "hidden",
    },
    heroGlow: {
      position: "absolute",
      top: "-80px",
      right: "-40px",
      width: "240px",
      height: "240px",
      borderRadius: "999px",
      background: "radial-gradient(circle, rgba(242,166,90,0.16), transparent 65%)",
      pointerEvents: "none",
    },
    heroLeft: {
      position: "relative",
      zIndex: 1,
    },
    heroRight: {
      position: "relative",
      zIndex: 1,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      alignContent: "start",
    },
    heroBadge: {
      display: "inline-block",
      padding: "8px 14px",
      borderRadius: "999px",
      background: "rgba(212,175,55,0.10)",
      border: `1px solid ${COLORS.gold}`,
      marginBottom: "16px",
      fontSize: "12px",
      fontWeight: 800,
      color: COLORS.goldLight,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    },
    heroTitle: {
      fontSize: "46px",
      lineHeight: 1.02,
      margin: "0 0 12px 0",
      fontWeight: 900,
      color: COLORS.goldLight,
      letterSpacing: "-0.04em",
    },
    heroText: {
      margin: 0,
      maxWidth: "880px",
      lineHeight: 1.7,
      fontSize: "17px",
      color: COLORS.textSoft,
    },
    heroStat: {
      background: "rgba(22,22,22,0.9)",
      borderRadius: "18px",
      padding: "16px",
      border: `1px solid ${COLORS.border}`,
      minHeight: "104px",
    },
    heroStatLabel: {
      fontSize: "12px",
      color: COLORS.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      fontWeight: 800,
      marginBottom: "8px",
    },
    heroStatValue: {
      fontSize: "24px",
      fontWeight: 900,
      color: COLORS.text,
      marginBottom: "6px",
    },
    heroStatMeta: {
      color: COLORS.textSoft,
      fontSize: "13px",
      lineHeight: 1.5,
    },
    stickyShell: {
      position: "sticky",
      top: "12px",
      zIndex: 30,
      marginBottom: "18px",
    },
    stickyCard: {
      background: "rgba(11,11,11,0.88)",
      backdropFilter: "blur(12px)",
      border: `1px solid ${COLORS.border}`,
      borderRadius: "22px",
      padding: "14px",
      boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
    },
    nav: {
      display: "flex",
      gap: "10px",
      marginBottom: "12px",
      flexWrap: "wrap",
    },
    navBtn: (active) => ({
      border: active ? "none" : `1px solid ${COLORS.border}`,
      background: active
        ? "linear-gradient(135deg, #D97A32, #F2A65A)"
        : "rgba(17,17,17,0.95)",
      color: active ? "#111111" : COLORS.text,
      padding: "12px 18px",
      borderRadius: "14px",
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: active ? "0 10px 24px rgba(217,122,50,0.18)" : "none",
      transition: "0.2s ease",
    }),
    quickRow: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },
    quickButton: {
      border: `1px solid ${COLORS.border}`,
      background: COLORS.surfaceSoft,
      color: COLORS.textSoft,
      padding: "10px 14px",
      borderRadius: "12px",
      fontWeight: 700,
      cursor: "pointer",
    },
    sectionBanner: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
      marginBottom: "18px",
      padding: "16px 18px",
      borderRadius: "18px",
      background: "rgba(17,17,17,0.72)",
      border: `1px solid ${COLORS.border}`,
    },
    sectionBannerTitle: {
      fontSize: "18px",
      fontWeight: 900,
      color: COLORS.goldLight,
      marginBottom: "4px",
    },
    sectionBannerText: {
      color: COLORS.textSoft,
      fontSize: "14px",
      lineHeight: 1.6,
    },
    grid5: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
      gap: "16px",
      marginBottom: "20px",
    },
    grid2: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
      gap: "18px",
      marginBottom: "20px",
    },
    grid3: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "16px",
      marginBottom: "20px",
    },
    card: {
      background:
        "linear-gradient(180deg, rgba(17,17,17,0.96), rgba(12,12,12,0.98))",
      borderRadius: "24px",
      padding: "24px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      border: `1px solid ${COLORS.border}`,
    },
    cardTitle: {
      fontSize: "28px",
      fontWeight: 900,
      margin: "0 0 18px 0",
      color: COLORS.goldLight,
      letterSpacing: "-0.03em",
    },
    sectionTitle: {
      fontSize: "20px",
      fontWeight: 900,
      margin: "0 0 16px 0",
      color: COLORS.goldLight,
    },
    input: {
      width: "100%",
      padding: "14px 14px",
      borderRadius: "14px",
      border: `1px solid ${COLORS.border}`,
      marginBottom: "12px",
      boxSizing: "border-box",
      fontSize: "15px",
      outline: "none",
      background: COLORS.surfaceSoft,
      color: COLORS.text,
    },
    textarea: {
      width: "100%",
      padding: "14px 14px",
      borderRadius: "14px",
      border: `1px solid ${COLORS.border}`,
      marginBottom: "12px",
      boxSizing: "border-box",
      fontSize: "15px",
      minHeight: "120px",
      resize: "vertical",
      fontFamily: "inherit",
      outline: "none",
      background: COLORS.surfaceSoft,
      color: COLORS.text,
    },
    buttonFull: {
      width: "100%",
      border: "none",
      background: "linear-gradient(135deg, #D97A32, #F2A65A)",
      color: "#111111",
      padding: "14px 16px",
      borderRadius: "14px",
      fontWeight: 900,
      cursor: "pointer",
      boxShadow: "0 12px 24px rgba(217,122,50,0.16)",
    },
    buttonSecondary: {
      width: "100%",
      border: `1px solid ${COLORS.gold}`,
      background: COLORS.surfaceSoft,
      color: COLORS.goldLight,
      padding: "12px 14px",
      borderRadius: "12px",
      fontWeight: 800,
      cursor: "pointer",
      marginTop: "10px",
    },
    buttonWhatsapp: {
      width: "100%",
      border: "none",
      background: "linear-gradient(135deg, #D97A32, #F2A65A)",
      color: "#111111",
      padding: "12px 14px",
      borderRadius: "12px",
      fontWeight: 800,
      cursor: "pointer",
      marginTop: "8px",
    },
    buttonReward: {
      width: "100%",
      border: "none",
      background: "linear-gradient(135deg, #C94B32, #E06A4C)",
      color: "white",
      padding: "12px 14px",
      borderRadius: "12px",
      fontWeight: 800,
      cursor: "pointer",
      marginTop: "10px",
    },
    buttonDanger: {
  width: "100%",
  border: "none",
  background: "linear-gradient(135deg, #C94B32, #E06A4C)",
  color: "#FFFFFF",
  padding: "14px 16px",
  borderRadius: "14px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(201,75,50,0.18)",
  marginTop: "12px",
},
    helper: {
      marginTop: "14px",
      color: COLORS.textSoft,
      lineHeight: 1.7,
      fontSize: "14px",
    },
    previewBox: {
      background: "#0B0B0B",
      borderRadius: "18px",
      padding: "22px",
      color: COLORS.text,
      minHeight: "140px",
      border: `1px solid ${COLORS.border}`,
    },
    customerGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "16px",
    },
    customerCard: {
      border: `1px solid ${COLORS.border}`,
      borderRadius: "20px",
      padding: "18px",
      background:
        "linear-gradient(180deg, rgba(22,22,22,0.95), rgba(15,15,15,0.98))",
    },
    rowBetween: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "10px",
      marginBottom: "10px",
      flexWrap: "wrap",
    },
    badge: {
      display: "inline-block",
      background: COLORS.surfaceSoft,
      color: COLORS.text,
      border: `1px solid ${COLORS.border}`,
      borderRadius: "999px",
      padding: "6px 10px",
      fontSize: "12px",
      fontWeight: 800,
    },
    badgeGreen: {
      display: "inline-block",
      background: COLORS.greenBg,
      color: "#86efac",
      border: `1px solid ${COLORS.border}`,
      borderRadius: "999px",
      padding: "6px 10px",
      fontSize: "12px",
      fontWeight: 800,
    },
    badgeBlue: {
      display: "inline-block",
      background: COLORS.blueBg,
      color: "#93c5fd",
      border: `1px solid ${COLORS.border}`,
      borderRadius: "999px",
      padding: "6px 10px",
      fontSize: "12px",
      fontWeight: 800,
    },
    badgeOrange: {
      display: "inline-block",
      background: COLORS.orangeBg,
      color: COLORS.copperLight,
      border: `1px solid ${COLORS.border}`,
      borderRadius: "999px",
      padding: "6px 10px",
      fontSize: "12px",
      fontWeight: 800,
    },
    searchWrap: {
      display: "grid",
      gridTemplateColumns: "1.5fr 1fr",
      gap: "16px",
      marginBottom: "18px",
    },
    kpiLine: {
      color: COLORS.textSoft,
      lineHeight: 1.9,
      fontSize: "15px",
    },
    promoCard: {
      border: `1px solid ${COLORS.border}`,
      borderRadius: "18px",
      padding: "16px",
      marginBottom: "12px",
      background:
        "linear-gradient(180deg, rgba(22,22,22,0.95), rgba(15,15,15,0.98))",
    },
    promoTitle: {
      fontSize: "18px",
      fontWeight: 900,
      marginBottom: "8px",
      color: COLORS.text,
    },
    muted: {
      color: COLORS.textSoft,
      fontSize: "14px",
      lineHeight: 1.6,
    },
    notif: {
      background: "linear-gradient(135deg, #D97A32, #F2A65A)",
      color: "#111111",
      padding: "13px 16px",
      borderRadius: "14px",
      marginBottom: "16px",
      textAlign: "center",
      fontWeight: 900,
      boxShadow: "0 12px 24px rgba(217,122,50,0.16)",
    },
    fakeQrWrap: {
      margin: "14px 0",
      background: "#0B0B0B",
      border: `1px solid ${COLORS.border}`,
      borderRadius: "16px",
      padding: "14px",
      textAlign: "center",
    },
    tableLike: {
      display: "grid",
      gap: "12px",
    },
    footer: {
      marginTop: "28px",
      textAlign: "center",
      color: COLORS.textSoft,
      fontSize: "13px",
      lineHeight: 1.8,
      paddingBottom: "10px",
    },
    loginPage: {
      minHeight: "100vh",
      background:
        "radial-gradient(circle at top, rgba(242,166,90,0.10), transparent 28%), linear-gradient(135deg, #050505, #111111)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "Inter, Arial, sans-serif",
    },
    loginGrid: {
      width: "100%",
      maxWidth: "1120px",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      gap: "20px",
    },
    loginPanel: {
      background: "linear-gradient(135deg, #111111, #0B0B0B)",
      color: COLORS.text,
      borderRadius: "30px",
      padding: "34px",
      boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
      border: `1px solid ${COLORS.border}`,
    },
    loginLogoRow: {
      display: "flex",
      alignItems: "center",
      gap: "18px",
      marginBottom: "22px",
      flexWrap: "wrap",
    },
loginLogoWrap: {
  width: "170px",
  height: "170px",
  margin: "0 auto 24px auto",
  borderRadius: "30px",
  background: "transparent",
  border: "none",
  boxShadow: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},

loginLogo: {
  width: "145px",
  height: "145px",
  objectFit: "contain",
  display: "block",
},
    loginTitle: {
      fontSize: "42px",
      margin: "0 0 12px 0",
      lineHeight: 1.02,
      color: COLORS.goldLight,
      fontWeight: 900,
      letterSpacing: "-0.04em",
    },
    loginBody: {
      lineHeight: 1.75,
      fontSize: "16px",
      margin: 0,
      color: COLORS.textSoft,
    },
    loginCard: {
      background:
        "linear-gradient(180deg, rgba(17,17,17,0.96), rgba(12,12,12,0.98))",
      borderRadius: "30px",
      padding: "30px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      border: `1px solid ${COLORS.border}`,
      color: COLORS.text,
    },
    loginInput: {
      width: "100%",
      padding: "14px 14px",
      borderRadius: "14px",
      border: `1px solid ${COLORS.border}`,
      marginBottom: "12px",
      boxSizing: "border-box",
      fontSize: "15px",
      outline: "none",
      background: "#ffffff",
      color: "#111111",
    },
    loginNotif: {
      background: "rgba(201,75,50,0.16)",
      color: "#f5b09f",
      padding: "12px",
      borderRadius: "12px",
      marginBottom: "14px",
      fontWeight: 700,
      border: `1px solid ${COLORS.border}`,
    },
    loginHelperBox: {
      marginTop: "22px",
      background: "#111111",
      borderRadius: "18px",
      padding: "18px",
      lineHeight: 1.9,
      border: `1px solid ${COLORS.border}`,
      color: COLORS.textSoft,
    },
    forgotBox: {
      marginTop: "16px",
      padding: "16px",
      borderRadius: "14px",
      background: "#111",
      border: `1px solid ${COLORS.border}`,
    },
    poweredLink: {
      color: COLORS.goldLight,
      textDecoration: "none",
      fontWeight: 700,
    },
    pushBox: {
      marginBottom: "20px",
      padding: "18px",
      borderRadius: "18px",
      background:
        "linear-gradient(135deg, rgba(217,122,50,0.12), rgba(242,166,90,0.08))",
      border: `1px solid ${COLORS.border}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
    },
    pushText: {
      color: COLORS.textSoft,
      fontSize: "14px",
      lineHeight: 1.6,
      maxWidth: "760px",
    },
  };

 function resetBusinessData(newShopName = "Mon Commerce") {
  setBusinessName(newShopName);

  setRewardGoal("");
  setRewardLabel("");
  setPrimaryColor("");

 setLocationSettings({
  country: "",
  city: "",
  region: "",
  zoneLabel: "",
  latitude: "",
  longitude: "",
  radiusKm: "",
});

  setMerchantContact({
    shopName: newShopName,
    ownerName: "",
    phone: "",
    email: "",
    address: "",
    postalCode: "",
    city: "",
    country: "",
    website: "",
    vatNumber: "",
    reviewUrl: "",
  });

  setCustomers([]);
  setPromotions([]);
  setEmployees([]);
  setActivityLog([]);

  setNewCustomer({
    name: "",
    email: "",
    phone: "",
  });

  setPromo({
    title: "",
    code: "",
    description: "",
    channel: "Instagram",
    ctaLabel: "",
    ctaUrl: "",
  });

  setNewEmployee({
    name: "",
    email: "",
    role: "employee",
  });

  setScanId("");
  setSearch("");
}

function handleCreateNewBusiness() {
  const confirmed = window.confirm(
    "Créer une nouvelle entreprise va réinitialiser les clients, promotions, employés, journal d’activité et réglages actuels. Continuer ?"
  );

  if (!confirmed) return;

  const nextShopName =
    merchantContact.shopName?.trim() || "Nouvelle entreprise";

  localStorage.removeItem(STORAGE_MERCHANT_CONTACT);
  localStorage.removeItem(STORAGE_PROGRAM_SETTINGS);
  localStorage.removeItem("zeltyo_promotions");

  resetBusinessData(nextShopName);

  showNotification("Nouvelle entreprise initialisée");
}

const activePromotionList = promotions.filter((p) => p.status === "Active");
const pausedPromotionList = promotions.filter((p) => p.status === "Pause");
const archivedPromotionList = promotions.filter((p) => p.status === "Archivée");

const shiftsToday = getTodayShifts();

// ===== KPI BUSINESS =====

const averageTicket = 12; // panier moyen (modifiable plus tard)

const estimatedRevenue = totalVisits * averageTicket;

const totalWorkHours = shiftsToday.reduce((total, shift) => {
  if (!shift.end) return total;
  return total + (new Date(shift.end) - new Date(shift.start));
}, 0) / 3600000;

const totalPayrollCost = shiftsToday.reduce((total, shift) => {
  if (!shift.end) return total;

  const employee = employees.find(e => e.id === shift.employeeId);
  const duration = new Date(shift.end) - new Date(shift.start);
  const hours = duration / 3600000;

  return total + (hours * (employee?.hourlyCost || 0));
}, 0);

const profitEstimate = estimatedRevenue - totalPayrollCost;

// ===== ALERTES INTELLIGENTES =====

const workingEmployees = employees.filter((employee) => isWorking(employee.id));

const expensiveEmployees = employees.filter(
  (employee) => Number(employee.hourlyCost || 0) >= 30
);

const openShifts = shiftsToday.filter((shift) => !shift.end);

const businessAlerts = [
  ...(profitEstimate < 0
    ? [
        {
          type: "danger",
          title: "Résultat estimé négatif",
          message: "Le coût équipe dépasse le CA estimé aujourd’hui.",
        },
      ]
    : []),

  ...(openShifts.length > 0
    ? [
        {
          type: "warning",
          title: "Service en cours",
          message: `${openShifts.length} employé(s) sont actuellement en service.`,
        },
      ]
    : []),

  ...(expensiveEmployees.length > 0
    ? [
        {
          type: "warning",
          title: "Coût horaire élevé",
          message: `${expensiveEmployees.length} employé(s) ont un coût horaire supérieur ou égal à 30 €.`,
        },
      ]
    : []),

  ...(clientsToRelance.length > 0
    ? [
        {
          type: "success",
          title: "Clients à relancer",
          message: `${clientsToRelance.length} client(s) sont proches d’une récompense.`,
        },
      ]
    : []),

  ...(inactiveClients.length > 0
    ? [
        {
          type: "warning",
          title: "Clients inactifs",
          message: `${inactiveClients.length} client(s) n’ont pas été vus récemment.`,
        },
      ]
    : []),
];

const totalByEmployee = shiftsToday.reduce((acc, shift) => {
  if (!shift.end) return acc;

  const duration =
    new Date(shift.end) - new Date(shift.start);

  if (!acc[shift.employeeId]) {
    acc[shift.employeeId] = 0;
  }

  acc[shift.employeeId] += duration;

  return acc;
}, {});


function restoreMenuItem(menuId) {
  setMenuItems((prev) =>
    prev.map((item) =>
      item.id === menuId
        ? { ...item, archived: false }
        : item
    )
  );

  showNotification("Produit restauré");
}

const currentMonth = new Date().toISOString().slice(0, 7);

const monthlyHoursByEmployee = shifts.reduce((acc, shift) => {
  if (!shift.end || !shift.start) return acc;

  if (!shift.start.startsWith(currentMonth)) return acc;

  const duration = new Date(shift.end) - new Date(shift.start);

  if (duration <= 0 || Number.isNaN(duration)) return acc;

  if (!acc[shift.employeeId]) {
    acc[shift.employeeId] = 0;
  }

  acc[shift.employeeId] += duration / 3600000;

  return acc;
}, {});

const displayBusinessName =
  businessName ||
  merchantContact.shopName ||
  currentUser.name?.replace(/admin/gi, "").trim() ||
  currentUser.businessId ||
  "Commerce";

const displayRewardGoal = rewardGoal || 10;

  if (!isAuthenticated) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginGrid}>
          <div style={styles.loginPanel}>
            <div style={styles.heroBadge}>Connexion sécurisée</div>

            <div style={styles.loginLogoRow}>
              <div style={styles.loginLogoWrap}>
                <img src="/logo.png" alt="Zeltyo" style={styles.loginLogo} />
              </div>

              <div>
                <div style={styles.brandOverline}>Zeltyo Merchant Suite</div>
                <div style={styles.brandTitle}>Zeltyo Commerçant</div>
                <p style={{ ...styles.brandText, maxWidth: "520px" }}>
                  Un espace premium pour piloter la fidélité, les promotions, les
                  visites et le contrôle de l’équipe sans perdre la simplicité
                  d’usage en point de vente.
                </p>
              </div>
            </div>

            <h1 style={styles.loginTitle}>Pilotez votre commerce avec clarté</h1>

            <p style={styles.loginBody}>
              Chaque membre de l’équipe se connecte avec son propre accès.
              L’administrateur conserve la maîtrise des promotions, des rôles et
              du journal d’activité.
            </p>

            <div style={styles.loginHelperBox}>
              <div>
                <strong>Démo administrateur</strong> : admin@barberclub.ch /
                Zeltyo123!
              </div>
              <div>
                <strong>Démo employé</strong> : employee@barberclub.ch /
                Zeltyo123!
              </div>
            </div>
          </div>

          <div style={styles.loginCard}>
            <div style={styles.brandOverline}>Version Pro</div>

            <h2 style={{ marginTop: 8, fontSize: "34px", marginBottom: "12px" }}>
              Connexion
            </h2>

            <p
              style={{
                color: COLORS.textSoft,
                lineHeight: 1.7,
                marginBottom: "18px",
              }}
            >
              Connectez-vous en tant qu’administrateur ou employé pour accéder
              aux fonctions adaptées à votre rôle.
            </p>

            {notification && <div style={styles.loginNotif}>{notification}</div>}

            <input
              style={styles.loginInput}
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
            />

            <input
              type="password"
              style={styles.loginInput}
              placeholder="Mot de passe"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
            />

            <button style={styles.buttonFull} onClick={handleLogin}>
              Se connecter
            </button>

            <div
              style={{
                marginTop: "12px",
                textAlign: "center",
              }}
            >
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: COLORS.goldLight,
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {showForgot && (
              <div style={styles.forgotBox}>
                <div style={{ marginBottom: "10px", fontWeight: 800 }}>
                  Réinitialiser le mot de passe
                </div>

                <input
                  style={styles.loginInput}
                  placeholder="Votre email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />

                <button
  style={styles.buttonFull}
  onClick={async () => {
    try {
      if (!forgotEmail.trim()) {
        showNotification("Email requis");
        return;
      }

      const response = await fetch(
        buildApiUrl("/auth/forgot-password"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: forgotEmail }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showNotification(data.error || "Erreur serveur");
        return;
      }

      // ✅ UX PRO
      showNotification("📩 Email de réinitialisation envoyé");

      setShowForgot(false);
      setForgotEmail("");

    } catch (error) {
      console.error(error);
      showNotification("Erreur de connexion");
    }
  }}
>
  Envoyer le lien
</button>
              </div>
            )}

            <div
              style={{
                marginTop: "18px",
                textAlign: "center",
                color: COLORS.textSoft,
                fontSize: "13px",
                lineHeight: 1.8,
              }}
            >
              <div>{poweredByLabel}</div>
              <a
                href={poweredByUrl}
                target="_blank"
                rel="noreferrer"
                style={styles.poweredLink}
              >
                je-webmarketing.com
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

 
  const currentTabLabel =
    TABS.find((tab) => tab.key === activeTab)?.label || "Tableau de bord";

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topbar}>
  <div style={styles.brandCard}>
    <div style={styles.brandLogoWrap}>
      <img src="/logo.png" alt="Zeltyo" style={styles.brandLogo} />
    </div>

    <div style={{ flex: 1 }}>
      <div style={styles.brandOverline}>Espace commerçant</div>
      <div style={styles.brandTitle}>Zeltyo</div>
      <p style={styles.brandText}>
        Fidélité, promotions, équipe et pilotage dans une interface premium.
      </p>
    </div>
  </div>

  <div style={styles.sessionCard}>
    <div style={styles.sessionTop}>
      <div>
        <div style={styles.sessionTitle}>Session active</div>
        <div style={styles.sessionName}>
          {currentUser?.name || "Utilisateur"}
        </div>
        <div style={styles.sessionMeta}>
        {displayBusinessName} •{" "}
{currentUser.role === "admin"
  ? "Administrateur"
  : "Employé"}
        </div>
      </div>

      <span
        style={
          currentUser.role === "admin"
            ? styles.badgeGreen
            : styles.badgeBlue
        }
      >
        {currentUser.role === "admin"
          ? "Mode administrateur"
          : "Mode employé"}
      </span>
    </div>

    <div style={styles.topActions}>
      <select
        style={styles.userSelect}
        value={currentUser?.name || ""}
        onChange={(e) => {
  const selected = employees.find(
    (emp) => emp.name === e.target.value
  );

  if (selected) {
    setCurrentUser({
      name: selected.name,
      role: selected.role,
      email: selected.email,
      businessId: selected.businessId,
    });
  }
}}
      >
        {employees.map((employee) => (
          <option key={employee.id} value={employee.name}>
            {employee.name} —{" "}
            {employee.role === "admin" ? "Administrateur" : "Employé"}
          </option>
        ))}
      </select>

      <button style={styles.buttonGhost} onClick={handleLogout}>
        Déconnexion
      </button>
    </div>
  </div>
</div>
        <div style={styles.hero}>
          <div style={styles.heroGlow} />
          <div style={styles.heroLeft}>
            <div style={styles.heroBadge}>Pilotage commerçant premium</div>
            <h2 style={styles.heroTitle}>
  {businessName || merchantContact.shopName || currentUser.businessId || "Commerce"}
</h2>
            <p style={styles.heroText}>
              Gérez vos clients, vos récompenses, vos promotions et le contrôle
              d’équipe dans un espace premium plus lisible. L’administrateur
              conserve une vision globale, pendant que les employés gardent un
              accès simple aux actions autorisées.
            </p>
          </div>

         <div style={styles.heroStat}>
  <div style={styles.heroStatLabel}>Programme fidélité</div>
  <div style={styles.heroStatValue}>{displayRewardGoal} points</div>
  <div style={styles.heroStatMeta}>{rewardLabel}</div>
</div>

            <div style={styles.heroStat}>
              <div style={styles.heroStatLabel}>Zone active</div>
              <div style={styles.heroStatValue}>{locationSettings.city}</div>
              <div style={styles.heroStatMeta}>{locationSettings.zoneLabel}</div>
            </div>

            <div style={styles.heroStat}>
              <div style={styles.heroStatLabel}>Rôle</div>
              <div style={styles.heroStatValue}>
                {currentUser.role === "admin" ? "Admin" : "Employé"}
              </div>
              <div style={styles.heroStatMeta}>Accès contrôlé par profil</div>
            </div>

            <div style={styles.heroStat}>
              <div style={styles.heroStatLabel}>Promotions actives</div>
              <div style={styles.heroStatValue}>{activePromos} 🔥</div>
              <div style={styles.heroStatMeta}>Campagnes en diffusion</div>
            </div>

            <div style={styles.heroStat}>
  <div style={styles.heroStatLabel}>CA estimé</div>
  <div style={styles.heroStatValue}>{estimatedRevenue} €</div>
  <div style={styles.heroStatMeta}>Basé sur les visites</div>
</div>
          </div>
        </div>

        {notification && <div style={styles.notif}>{notification}</div>}

        <div style={styles.stickyShell}>
          <div style={styles.stickyCard}>
            <div style={styles.nav}>
              {TABS
  .filter((tab) => {
    // 🔥 Si onboarding actif → on affiche tout (ou juste onboarding si tu veux être strict)
    if (activeTab === "onboarding") return true;

    // 🔥 Sinon → on bloque tant que commerce pas configuré
    return businessName && businessName.trim() !== "";
  })
  .map((tab) => (
                <button
                  key={tab.key}
                  style={styles.navBtn(activeTab === tab.key)}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div style={styles.quickRow}>
              <button
                style={styles.quickButton}
                onClick={() => setActiveTab("clients")}
              >
                Ajouter un client
              </button>
              <button
                style={styles.quickButton}
                onClick={() => setActiveTab("dashboard")}
              >
                Valider une visite
              </button>
             <button
  style={styles.quickButton}
  onClick={() => setActiveTab("promos")}
>
  Créer une promotion
</button>
              <button
                style={styles.quickButton}
                onClick={() => setActiveTab("team")}
              >
                Contrôle équipe
              </button>
              <button
                style={styles.quickButton}
                onClick={() => setActiveTab("settings")}
              >
                Programme & zone
              </button>
            </div>
          </div>
        </div>

        <div style={styles.sectionBanner}>
          <div>
            <div style={styles.sectionBannerTitle}>{currentTabLabel}</div>
            <div style={styles.sectionBannerText}>
              Navigation clarifiée pour un usage plus rapide en commerce, sans
              modifier la logique métier existante.
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <span style={styles.badgeOrange}>Branding noir / or / cuivre</span>
            <span style={styles.badge}>UX premium progressive</span>
          </div>
        </div>

        <div style={styles.pushBox}>
          <div>
            <div style={{ ...styles.sectionTitle, marginBottom: 6 }}>
              Promotion push rapide
            </div>
            <div style={styles.pushText}>
              Envoi rapide d’une promotion push. Fonction conservée et toujours
              réservée à l’administrateur.
            </div>
          </div>

          <div>
            <button
              onClick={currentUser.role === "admin" ? sendPromo : undefined}
              disabled={currentUser.role !== "admin"}
              style={{
                ...styles.buttonPrimary,
                background:
                  currentUser.role === "admin"
                    ? "linear-gradient(135deg, #D97A32, #F2A65A)"
                    : "#3A3A3A",
                color: currentUser.role === "admin" ? "#111111" : "#999999",
                cursor: currentUser.role === "admin" ? "pointer" : "not-allowed",
                opacity: currentUser.role === "admin" ? 1 : 0.7,
              }}
              title={
                currentUser.role === "admin"
                  ? "Envoyer une promotion"
                  : "Réservé à l’administrateur"
              }
            >
              🔥 Envoyer promo
            </button>

            {currentUser.role !== "admin" && (
              <div
                style={{
                  marginTop: "8px",
                  color: COLORS.textSoft,
                  fontSize: "13px",
                }}
              >
                Seul l’administrateur peut envoyer une promotion push.
              </div>
            )}
          </div>
        </div>

    {activeTab === "dashboard" && (
  <>
  <QRCodeScanner
  COLORS={COLORS}
  onDetected={(decodedText) => {
    console.log("QR SCANNÉ =", decodedText);

    const url = new URL(decodedText);
    const loyaltyId = url.pathname.split("/card/")[1]?.split("?")[0];

    if (!loyaltyId) {
      showNotification("QR code invalide");
      return;
    }

    setScanId(loyaltyId);
rewardVisit(loyaltyId);
showNotification(`Visite validée : ${loyaltyId}`);
  }}
/>

    <div style={styles.grid5}>
      <StatCard label="Clients actifs" value={totalClients} />
      <StatCard label="Visites" value={totalVisits} />
      <StatCard label="Promos actives" value={activePromos} />
      <StatCard label="Heures travaillées" value={`${totalWorkHours.toFixed(1)} h`} />
      <StatCard label="Coût équipe" value={`${totalPayrollCost.toFixed(2)} €`} />
    </div>

    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Actions rapides</h3>

      <div style={styles.grid3}>
        <button style={styles.buttonFull} onClick={() => setActiveTab("clients")}>
          Gérer les clients
        </button>

        <button style={styles.buttonFull} onClick={() => setActiveTab("promos")}>
          Créer une promotion
        </button>

        <button style={styles.buttonFull} onClick={() => setActiveTab("team")}>
          Contrôle équipe
        </button>
      </div>
    </div>

    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Alertes intelligentes</h3>

      {businessAlerts.length === 0 ? (
        <p style={styles.muted}>Aucune alerte pour le moment. Tout semble stable.</p>
      ) : (
        <div style={styles.tableLike}>
          {businessAlerts.slice(0, 3).map((alert, index) => (
            <div key={`${alert.title}-${index}`} style={styles.promoCard}>
              <div style={{ fontWeight: 900, color: COLORS.goldLight }}>
                {alert.title}
              </div>
              <div style={styles.muted}>{alert.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Demandes de réservation</h3>
 <BookingsManager
  selectedBusiness={{
    id: currentUser.businessId,
    name: businessName || merchantContact.shopName || "Commerce",
  }}
  businessId={currentUser.businessId}
/>
    </div>
  </>
)}

       {activeTab === "clients" && (
  <ClientsModule
  filteredCustomers={filteredCustomers}
  search={search}
  setSearch={setSearch}
  styles={styles}
  COLORS={COLORS}
  generateMessage={generateMessage}
  useReward={useReward}
  openWhatsApp={openWhatsApp}
  addLog={addLog}
  showNotification={showNotification}

  newCustomer={newCustomer}
  setNewCustomer={setNewCustomer}
  addCustomer={addCustomer}

  scanId={scanId}
  setScanId={setScanId}
  customers={customers}
  rewardVisit={rewardVisit}

  topCustomers={topCustomers}
  clientsToRelance={clientsToRelance}
  inactiveClients={inactiveClients}
  rewardGoal={rewardGoal}
/>
)}

{activeTab === "onboarding" && (
  <div style={styles.card}>
    <h3 style={styles.cardTitle}>🚀 Configuration de votre commerce</h3>

    <p style={styles.helper}>
      En quelques étapes, votre espace Zeltyo sera prêt à être utilisé en boutique.
    </p>

    <input
      style={styles.input}
      placeholder="Nom du commerce"
      value={businessName}
      onChange={(e) => setBusinessName(e.target.value)}
    />

    <input
      style={styles.input}
      placeholder="Ville"
      value={locationSettings.city}
      onChange={(e) =>
        setLocationSettings({
          ...locationSettings,
          city: e.target.value,
        })
      }
    />

    <input
      style={styles.input}
      placeholder="Objectif fidélité (ex: 10)"
      value={rewardGoal}
      onChange={(e) => setRewardGoal(e.target.value)}
    />

    <input
      style={styles.input}
      placeholder="Récompense (ex: 1 café offert)"
      value={rewardLabel}
      onChange={(e) => setRewardLabel(e.target.value)}
    />

    <button
      style={styles.buttonFull}
      onClick={() => {
        if (!businessName || !rewardGoal || !rewardLabel) {
          showNotification("Merci de compléter les champs");
          return;
        }

        showNotification("Commerce configuré 🚀");
        setActiveTab("dashboard");
      }}
    >
      Terminer la configuration
    </button>
  </div>
)}

{activeTab === "promos" && (
  <PromosModule
    currentUser={currentUser}
    promo={promo}
    setPromo={setPromo}
    addPromotion={addPromotion}
    sendSmart={sendSmart}
    socialPreview={socialPreview}
    promotions={promotions}
    activePromotionList={activePromotionList}
    pausedPromotionList={pausedPromotionList}
    archivedPromotionList={archivedPromotionList}
    togglePromotionStatus={togglePromotionStatus}
    archivePromotion={archivePromotion}
    styles={styles}
  />
)}

{activeTab === "team" && (
  <>
    <TeamModule
      currentUser={currentUser}
      newEmployee={newEmployee}
      setNewEmployee={setNewEmployee}
      addEmployee={addEmployee}
      employees={employees}
      isWorking={isWorking}
      startShift={startShift}
      endShift={endShift}
      getTodayShifts={getTodayShifts}
      totalByEmployee={totalByEmployee}
      activityLog={activityLog}
      styles={styles}
      COLORS={COLORS}
      showNotification={showNotification}
      archiveLog={archiveLog}
      restoreLog={restoreLog}
      purgeOldLogs={purgeOldLogs}
      formatDate={formatDate}
      monthlyHoursByEmployee={monthlyHoursByEmployee}
    />

    <TeamPlanning
      employees={employees}
      planning={planning}
      setPlanning={setPlanning}
      currentUser={currentUser}
      styles={styles}
      COLORS={COLORS}
      showNotification={showNotification}
    />
  </>
)}

{activeTab === "settings" && (
  <div style={styles.grid2}>
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Coordonnées du commerçant</h3>

      <input
        style={styles.input}
        placeholder="Nom du commerce"
        value={merchantContact.shopName}
        onChange={(e) =>
          setMerchantContact({ ...merchantContact, shopName: e.target.value })
        }
      />

      <input
        style={styles.input}
        placeholder="Nom du responsable"
        value={merchantContact.ownerName}
        onChange={(e) =>
          setMerchantContact({ ...merchantContact, ownerName: e.target.value })
        }
      />

      <input
        style={styles.input}
        placeholder="Téléphone"
        value={merchantContact.phone}
        onChange={(e) =>
          setMerchantContact({ ...merchantContact, phone: e.target.value })
        }
      />

      <input
        style={styles.input}
        placeholder="Email"
        value={merchantContact.email}
        onChange={(e) =>
          setMerchantContact({ ...merchantContact, email: e.target.value })
        }
      />

      <input
        style={styles.input}
        placeholder="Adresse"
        value={merchantContact.address}
        onChange={(e) =>
          setMerchantContact({ ...merchantContact, address: e.target.value })
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <input
          style={styles.input}
          placeholder="Code postal"
          value={merchantContact.postalCode}
          onChange={(e) =>
            setMerchantContact({ ...merchantContact, postalCode: e.target.value })
          }
        />

        <input
          style={styles.input}
          placeholder="Ville"
          value={merchantContact.city}
          onChange={(e) =>
            setMerchantContact({ ...merchantContact, city: e.target.value })
          }
        />
      </div>

      <input
        style={styles.input}
        placeholder="Pays"
        value={merchantContact.country}
        onChange={(e) =>
          setMerchantContact({ ...merchantContact, country: e.target.value })
        }
      />

      <input
        style={styles.input}
        placeholder="Site web"
        value={merchantContact.website}
        onChange={(e) =>
          setMerchantContact({ ...merchantContact, website: e.target.value })
        }
      />

      <input
        style={styles.input}
        placeholder="Lien Google Avis (https://g.page/.../review)"
        value={merchantContact.reviewUrl}
        onChange={(e) =>
          setMerchantContact({ ...merchantContact, reviewUrl: e.target.value })
        }
      />

      <input
        style={styles.input}
        placeholder="N° TVA / identifiant entreprise"
        value={merchantContact.vatNumber}
        onChange={(e) =>
          setMerchantContact({ ...merchantContact, vatNumber: e.target.value })
        }
      />

      <button style={styles.buttonFull} onClick={handleSaveMerchantContact}>
        Enregistrer les coordonnées du commerçant
      </button>

      <button style={styles.buttonDanger} onClick={handleCreateNewBusiness}>
        Créer une nouvelle entreprise et repartir de zéro
      </button>

      <p style={styles.helper}>
        Ces informations serviront de base pour l’identité du commerce, les futurs
        documents, les réglages avancés et les écrans publics de l’application.
      </p>

      <h3 style={styles.cardTitle}>Carte menu emporter</h3>

      <BusinessContentManager
  contents={menuItems
    .filter((item) => item.businessId === currentUser.businessId)
    .map((item) => ({
      ...item,
      onUpdate: handleUpdateMenuItem,
    }))}
  onUpload={handleMenuUpload}
  onDelete={handleDeleteMenuItem}
  COLORS={COLORS}
/>

<div
  style={{
    height: "1px",
    background: COLORS.border,
    margin: "22px 0",
  }}
/>

<h3 style={styles.cardTitle}>Paramètres du programme</h3>
      <input
        style={styles.input}
        placeholder="Nom du commerce"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
      />

      <input
        style={styles.input}
        type="number"
        placeholder="Objectif de points"
        value={rewardGoal}
        onChange={(e) => setRewardGoal(e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="Libellé de la récompense"
        value={rewardLabel}
        onChange={(e) => setRewardLabel(e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="Couleur principale"
        value={primaryColor}
        onChange={(e) => setPrimaryColor(e.target.value)}
      />

      <h3 style={{ ...styles.sectionTitle, marginTop: "24px" }}>
        Zone géographique
      </h3>

      <input
        style={styles.input}
        placeholder="Pays"
        value={locationSettings.country}
        onChange={(e) =>
          setLocationSettings({
            ...locationSettings,
            country: e.target.value,
          })
        }
      />

      <input
        style={styles.input}
        placeholder="Ville"
        value={locationSettings.city}
        onChange={(e) =>
          setLocationSettings({
            ...locationSettings,
            city: e.target.value,
          })
        }
      />

      <input
  style={styles.input}
  placeholder="Département / Canton / Région"
  value={locationSettings.region || ""}
  onChange={(e) =>
    setLocationSettings({
      ...locationSettings,
      region: e.target.value,
    })
  }
/>

      <input
        style={styles.input}
        placeholder="Secteur / Quartier / Zone"
        value={locationSettings.zoneLabel}
        onChange={(e) =>
          setLocationSettings({
            ...locationSettings,
            zoneLabel: e.target.value,
          })
        }
      />

      <input
        style={styles.input}
        placeholder="Latitude"
        value={locationSettings.latitude}
        onChange={(e) =>
          setLocationSettings({
            ...locationSettings,
            latitude: e.target.value,
          })
        }
      />

      <input
        style={styles.input}
        placeholder="Longitude"
        value={locationSettings.longitude}
        onChange={(e) =>
          setLocationSettings({
            ...locationSettings,
            longitude: e.target.value,
          })
        }
      />

      <input
        style={styles.input}
        type="number"
        step="0.1"
        placeholder="Rayon en km"
        value={locationSettings.radiusKm}
        onChange={(e) =>
          setLocationSettings({
            ...locationSettings,
            radiusKm: e.target.value,
          })
        }
      />

      <p style={styles.helper}>
        Définissez la zone du commerce et le rayon d’action marketing.
        Ce périmètre pourra ensuite servir pour les campagnes locales,
        les notifications ciblées et l’ajustement du rayon selon la densité de la zone.
      </p>

      <button
  style={styles.buttonFull}
 onClick={async () => {
  saveProgramSettings({
    businessName,
    rewardGoal,
    rewardLabel,
    primaryColor,
    locationSettings,
    businessId: currentUser.businessId || "",
  });

  await handleSaveMerchantContact();

  showNotification("Zone du commerce enregistrée et synchronisée");
}}
>
  Enregistrer les réglages
</button>
    </div>

    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Aperçu marque</h3>

      <div
        style={{
          borderRadius: "22px",
          padding: "24px",
          color: "white",
          background: `linear-gradient(135deg, ${primaryColor || "#D4AF37"}, #F2A65A)`,
          minHeight: "220px",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <div style={styles.heroBadge}>Carte de fidélité</div>

        <h4
          style={{
            fontSize: "32px",
            margin: "10px 0",
            fontWeight: 900,
          }}
        >
          {merchantContact.shopName || businessName || "Nom du commerce"}
        </h4>

        <p style={{ lineHeight: 1.7, opacity: 0.95, marginTop: "12px" }}>
          Responsable : {merchantContact.ownerName || "Non renseigné"}
        </p>

        <p style={{ lineHeight: 1.7, opacity: 0.95 }}>
          Contact : {merchantContact.phone || "Téléphone non renseigné"} •{" "}
          {merchantContact.email || "Email non renseigné"}
        </p>

        <p style={{ lineHeight: 1.7, opacity: 0.95, marginBottom: 0 }}>
          Adresse :{" "}
          {merchantContact.address
            ? `${merchantContact.address}, ${merchantContact.postalCode || ""} ${
                merchantContact.city || ""
              }, ${merchantContact.country || ""}`
            : "Adresse non renseignée"}
        </p>

        {merchantContact.reviewUrl && (
  <div
    style={{
      marginTop: "16px",
      marginBottom: "16px",
      textAlign: "center",
    }}
  >
    <QRCodeSVG
      value={merchantContact.reviewUrl}
      size={140}
      bgColor="#FFFFFF"
      fgColor="#111111"
      level="H"
    />

    <div
      style={{
        marginTop: "10px",
        fontWeight: 700,
      }}
    >
      QR Code Avis Google
    </div>
  </div>
)}

        <p style={{ lineHeight: 1.7 }}>
          {rewardGoal || "0"} points = {rewardLabel || "Récompense non renseignée"}
        </p>

        <p style={{ lineHeight: 1.7, opacity: 0.95 }}>
          Interface claire, programme rassurant et usage simple pour l’équipe,
          avec supervision côté administrateur.
        </p>

        <p style={{ lineHeight: 1.7, opacity: 0.95, marginBottom: 0 }}>
  Zone : {locationSettings.zoneLabel || "Zone non renseignée"} •{" "}
  {locationSettings.city || "Ville non renseignée"} •{" "}
  {locationSettings.region || "Département/Canton non renseigné"} •{" "}
  {locationSettings.country || "Pays non renseigné"} • Rayon :{" "}
  {locationSettings.radiusKm || "0"} km
</p>
      </div>
    </div>
  </div>
)}

        <div style={styles.footer}>
          <div>{poweredByLabel}</div>
          <a
            href={poweredByUrl}
            target="_blank"
            rel="noreferrer"
            style={styles.poweredLink}
          >
            je-webmarketing.com
          </a>
        </div>
      </div>
    
  );

  function FakeQr({ value }) {
    const cells = Array.from({ length: 81 }, (_, i) => {
      const seed = (value + i)
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return seed % 2 === 0;
    });

    return (
      <div
        style={{
          width: "120px",
          height: "120px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(9, 1fr)",
          gap: "2px",
          background: "#fff",
          padding: "8px",
          borderRadius: "12px",
          boxSizing: "border-box",
        }}
      >
        {cells.map((filled, index) => (
          <div
            key={index}
            style={{
              background: filled ? "#111827" : "#ffffff",
              border: "1px solid #e5e7eb",
              width: "100%",
              height: "100%",
            }}
          />
        ))}
      </div>
    );
  }

  function StatCard({ label, value }) {
    return (
      <div
        style={{
          background:
            "linear-gradient(180deg, rgba(17,17,17,0.96), rgba(12,12,12,0.98))",
          borderRadius: "22px",
          padding: "22px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          border: "1px solid #2A2A2A",
        }}
      >
        <div
          style={{
            color: "#A89F8A",
            fontSize: "12px",
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 800,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: "34px", fontWeight: 900, color: "#F2D06B" }}>
          {value}
        </div>
      </div>
    );
  }
}