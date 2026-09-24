"use strict";

const WORLD_STATE_KEY = "infinite_world_state_v2";
const DEFAULT_WORLD_STATE = {
  money: 25000,
  education: "No enrollment",
  educationLevel: 0,
  career: "Unemployed",
  careerLevel: 0,
  home: "No home",
  homeLevel: 0,
  ownedVehicles: [],
  activeVehicle: null,
  activePower: null,
  powerExpiresAt: 0
};

const VEHICLES = [
  { id: "street-e-bike", name: "Neon Street E-Bike", className: "Bike", energy: "Electric", price: 4200, speed: 22, handling: 95, description: "A quiet electric city bike with instant acceleration." },
  { id: "hyper-e-bike", name: "VoltStorm Hyper Bike", className: "Hyper Bike", energy: "Electric", price: 38000, speed: 52, handling: 88, description: "A fictional high-performance electric hyper bike." },
  { id: "adventure-bike", name: "Trail King Super Bike", className: "Super Bike", energy: "Gas", price: 28000, speed: 48, handling: 82, description: "A fictional gas-powered adventure motorcycle." },
  { id: "city-ev", name: "Aurora City EV", className: "Car", energy: "Electric", price: 52000, speed: 35, handling: 90, description: "A comfortable electric car for city exploration." },
  { id: "electric-supercar", name: "Pulse GT Electric", className: "Super Car", energy: "Electric", price: 180000, speed: 70, handling: 86, description: "A fictional electric supercar with instant torque." },
  { id: "gas-supercar", name: "Vortex R8 Turbo", className: "Super Car", energy: "Gas", price: 240000, speed: 74, handling: 82, description: "A fictional gasoline-powered supercar." },
  { id: "electric-hypercar", name: "Nova X Hypercar", className: "Hyper Car", energy: "Electric", price: 750000, speed: 95, handling: 78, description: "A fictional electric hypercar for end-game players." },
  { id: "gas-hypercar", name: "Inferno Apex", className: "Hyper Car", energy: "Gas", price: 900000, speed: 100, handling: 74, description: "A fictional gas hypercar with extreme performance." }
];

const POWER_DATA = {
  speed: { name: "Lightning Speed", effect: "Temporarily increases player movement speed." },
  flight: { name: "Sky Flight", effect: "Enables short flight mode in the living world." },
  energy: { name: "Energy Burst", effect: "Creates a visual energy effect around the player." },
  shield: { name: "Guardian Shield", effect: "Protects the player from fictional hazards." },
  time: { name: "Time Focus", effect: "Temporarily slows simulated world activity." }
};

let worldState = loadWorldState();

function loadWorldState() {
  try {
    const saved = localStorage.getItem(WORLD_STATE_KEY);
    if (!saved) return { ...DEFAULT_WORLD_STATE };
    const parsed = JSON.parse(saved);
    return { ...DEFAULT_WORLD_STATE, ...parsed, ownedVehicles: Array.isArray(parsed.ownedVehicles) ? parsed.ownedVehicles : [] };
  } catch {
    return { ...DEFAULT_WORLD_STATE };
  }
}

function saveWorldState() {
  localStorage.setItem(WORLD_STATE_KEY, JSON.stringify(worldState));
}

function money(value) {
  return `$${Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function setMessage(id, message) {
  if (document.getElementById(id)) {
    document.getElementById(id).textContent = message;
  }
}

function selectedVehicle() {
  const select = document.getElementById("vehicle-select");
  if (!select) return null;
  const id = select.value;
  return VEHICLES.find((v) => v.id === id) || null;
}

function updateVehicleDetails() {
  const vehicle = selectedVehicle();
  if (!vehicle) return;
  setMessage("vehicle-details", `${vehicle.className} · ${vehicle.energy} · Speed ${vehicle.speed} · Handling ${vehicle.handling} · ${vehicle.description}`);
}

function populateVehicleList() {
  const select = document.getElementById("vehicle-select");
  if (!select) return;
  select.innerHTML = "";
  VEHICLES.forEach((vehicle) => {
    const option = document.createElement("option");
    option.value = vehicle.id;
    option.textContent = `${vehicle.name} — ${vehicle.energy} — ${money(vehicle.price)}`;
    select.appendChild(option);
  });
  if (worldState.activeVehicle) select.value = worldState.activeVehicle;
  updateVehicleDetails();
}

function buySelectedVehicle() {
  const vehicle = selectedVehicle();
  if (!vehicle) return;

  if (worldState.ownedVehicles.includes(vehicle.id)) {
    setMessage("vehicle-details", "You already own this vehicle.");
    return;
  }

  if (worldState.money < vehicle.price) {
    setMessage("vehicle-details", `You need ${money(vehicle.price - worldState.money)} more virtual money.`);
    return;
  }

  worldState.money -= vehicle.price;
  worldState.ownedVehicles.push(vehicle.id);
  saveWorldState();
  updateInterface();
  setMessage("vehicle-details", `Purchased ${vehicle.name}. This uses fictional simulation money only.`);
}

function useSelectedVehicle() {
  const vehicle = selectedVehicle();
  if (!vehicle) return;
  if (!worldState.ownedVehicles.includes(vehicle.id)) {
    setMessage("vehicle-details", "Purchase this vehicle before using it.");
    return;
  }

  worldState.activeVehicle = vehicle.id;
  saveWorldState();
  window.dispatchEvent(new CustomEvent("world:vehicleChanged", { detail: vehicle }));
  setMessage("vehicle-details", `${vehicle.name} is now active. Vehicle speed: ${vehicle.speed}.`);
}

function attendHighSchool() {
  if (worldState.educationLevel >= 1) {
    setMessage("life-message", "High school has already been completed.");
    return;
  }

  worldState.education = "High School Graduate";
  worldState.educationLevel = 1;
  worldState.career = "Student Worker";
  worldState.careerLevel = Math.max(worldState.careerLevel, 1);
  saveWorldState();
  updateInterface();
  setMessage("life-message", "You completed high school and unlocked entry-level work.");
}

function attendUniversity() {
  if (worldState.educationLevel < 1) {
    setMessage("life-message", "Complete high school before enrolling in university.");
    return;
  }

  if (worldState.educationLevel >= 2) {
    setMessage("life-message", "University has already been completed.");
    return;
  }

  const tuition = 3500;
  if (worldState.money < tuition) {
    setMessage("life-message", `University tuition requires ${money(tuition)} in virtual money.`);
    return;
  }

  worldState.money -= tuition;
  worldState.education = "University Graduate";
  worldState.educationLevel = 2;
  worldState.career = "Professional Candidate";
  saveWorldState();
  updateInterface();
  setMessage("life-message", "University completed. Professional careers are now unlocked.");
}

function workShift() {
  let income = 500;
  if (worldState.educationLevel >= 1) income += 300;
  if (worldState.educationLevel >= 2) income += 1200;
  if (worldState.homeLevel >= 1) income += 100;

  worldState.money += income;
  worldState.careerLevel += 1;

  if (worldState.educationLevel >= 2) worldState.career = "Professional Career";
  else if (worldState.educationLevel >= 1) worldState.career = "Skilled Worker";
  else worldState.career = "Entry-Level Worker";

  saveWorldState();
  updateInterface();
  setMessage("life-message", `Shift complete. You earned ${money(income)} in virtual money.`);
}

function buyHouse() {
  const houses = [
    { name: "Small Starter House", price: 30000, level: 1 },
    { name: "Modern Family House", price: 125000, level: 2 },
    { name: "Infinite Skyline Mansion", price: 750000, level: 3 }
  ];

  const nextHouse = houses.find((house) => house.level > worldState.homeLevel);
  if (!nextHouse) {
    setMessage("life-message", "You already own the largest available home.");
    return;
  }

  if (worldState.money < nextHouse.price) {
    setMessage("life-message", `You need ${money(nextHouse.price - worldState.money)} more.`);
    return;
  }

  worldState.money -= nextHouse.price;
  worldState.home = nextHouse.name;
  worldState.homeLevel = nextHouse.level;
  saveWorldState();
  updateInterface();
  setMessage("life-message", `Purchased ${nextHouse.name}.`);
}

function activatePower() {
  const powerId = document.getElementById("power-select").value;
  const power = POWER_DATA[powerId];
  if (!power) return;

  worldState.activePower = powerId;
  worldState.powerExpiresAt = Date.now() + 30000;
  saveWorldState();
  window.dispatchEvent(new CustomEvent("world:powerActivated", { detail: power }));
  setMessage("power-message", `${power.name} activated for 30 seconds. ${power.effect}`);
}

function updateInterface() {
  document.getElementById("world-money").textContent = money(worldState.money);
  document.getElementById("education-level").textContent = worldState.education;
  document.getElementById("career-level").textContent = worldState.career;
  document.getElementById("home-level").textContent = worldState.home;

  const select = document.getElementById("vehicle-select");
  if (select && worldState.activeVehicle) select.value = worldState.activeVehicle;
}

function setupTabs() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.dataset.tab;
      document.querySelectorAll(".world-tab").forEach((tab) => tab.classList.remove("active"));
      const target = document.getElementById(`${tabName}-tab`);
      if (target) target.classList.add("active");
    });
  });
}

function setupLifeActions() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "high-school") attendHighSchool();
      if (action === "university") attendUniversity();
      if (action === "work") workShift();
      if (action === "buy-house") buyHouse();
    });
  });
}

function setupWorldExpansion() {
  populateVehicleList();
  setupTabs();
  setupLifeActions();
  updateInterface();

  document.getElementById("vehicle-select").addEventListener("change", updateVehicleDetails);
  document.getElementById("buy-vehicle-button").addEventListener("click", buySelectedVehicle);
  document.getElementById("use-vehicle-button").addEventListener("click", useSelectedVehicle);
  document.getElementById("activate-power-button").addEventListener("click", activatePower);
}

window.InfiniteWorld = {
  getState: () => ({ ...worldState }),
  getVehicles: () => [...VEHICLES],
  getPowers: () => ({ ...POWER_DATA }),
  save: saveWorldState
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupWorldExpansion);
} else {
  setupWorldExpansion();
}

























































































































































































































































































































































































"}]}