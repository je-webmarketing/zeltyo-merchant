import fs from "fs/promises";
import path from "path";

const dataPath = path.resolve("data", "clients.json");

async function ensureFile() {
  try {
    await fs.access(dataPath);
  } catch {
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, "[]", "utf-8");
  }
}

export async function getAllClients() {
  await ensureFile();
  const raw = await fs.readFile(dataPath, "utf-8");
  return JSON.parse(raw || "[]");
}

export async function saveAllClients(clients) {
  await ensureFile();
  await fs.writeFile(dataPath, JSON.stringify(clients, null, 2), "utf-8");
  return clients;
}

export async function upsertClient(clientData) {
  const clients = await getAllClients();

  const index = clients.findIndex(
    (c) =>
      c.id === clientData.id ||
      (clientData.phone && c.phone === clientData.phone) ||
      (clientData.subscriptionId && c.subscriptionId === clientData.subscriptionId)
  );

  const now = new Date().toISOString();

  if (index !== -1) {
    clients[index] = {
      ...clients[index],
      ...clientData,
      updatedAt: now,
    };
  } else {
    clients.push({
      id: clientData.id || crypto.randomUUID(),
      name: clientData.name || "",
      phone: clientData.phone || "",
      subscriptionId: clientData.subscriptionId || "",
      points: 0,
      rewardGoal: 10,
      visits: 0,
      totalSpent: 0,
      lastVisitAt: null,
      rewardNotified: false,
      createdAt: now,
      updatedAt: now,
      segment: "nouveau",
    });
  }

  await saveAllClients(clients);
  return clients;
}

function getSegment(client) {
  const visits = client.visits ?? 0;
  const totalSpent = client.totalSpent ?? 0;
  const lastVisitAt = client.lastVisitAt ? new Date(client.lastVisitAt) : null;

  let daysSinceLastVisit = 0;
  if (lastVisitAt) {
    daysSinceLastVisit = Math.floor(
      (Date.now() - lastVisitAt.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  if (daysSinceLastVisit >= 30 && visits > 0) {
    return "inactive";
  }

  if (visits >= 10 || totalSpent >= 200) {
    return "vip";
  }

  if (visits >= 3) {
    return "loyal";
  }

  return "nouveau";
}

export async function refreshClientSegments() {
  const clients = await getAllClients();

  const updatedClients = clients.map((client) => ({
    ...client,
    segment: getSegment(client),
    updatedAt: new Date().toISOString(),
  }));

  await saveAllClients(updatedClients);
  return updatedClients;
}