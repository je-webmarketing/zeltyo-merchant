export const sharedZones = [
  { id: "ZONE-1", name: "Genève" },
  { id: "ZONE-2", name: "Lausanne" },
  { id: "ZONE-3", name: "Lyon" },
];

export const sharedBusinesses = [
  {
    id: "BUS-1",
    name: "Le Café du Centre",
    zone: "Genève",
    rewardGoal: 10,
    rewardLabel: "1 boisson offerte",
    promo: "Petit-déjeuner -10% jusqu’à vendredi",
    color: "#0f766e",
    address: "Centre-ville, Genève",
  },
  {
    id: "BUS-2",
    name: "Boulangerie Martin",
    zone: "Genève",
    rewardGoal: 8,
    rewardLabel: "1 viennoiserie offerte",
    promo: "2 pains spéciaux achetés = 1 offert",
    color: "#b45309",
    address: "Rue du Marché, Genève",
  },
  {
    id: "BUS-3",
    name: "Barber Club",
    zone: "Lausanne",
    rewardGoal: 6,
    rewardLabel: "1 coupe -50%",
    promo: "Soin barbe offert cette semaine",
    color: "#1d4ed8",
    address: "Avenue Centrale, Lausanne",
  },
];

export const sharedCustomers = [
  {
    id: "CL-1001",
    name: "Sophie Martin",
    email: "sophie@email.com",
    phone: "+41791234567",
    memberships: [
      {
        businessId: "BUS-1",
        points: 8,
        rewardsAvailable: 0,
        visits: 4,
        lastVisit: "29/03/2026",
      },
      {
        businessId: "BUS-2",
        points: 3,
        rewardsAvailable: 0,
        visits: 2,
        lastVisit: "25/03/2026",
      },
    ],
  },
];