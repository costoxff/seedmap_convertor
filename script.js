const input = document.getElementById("tp-input");
const convertBtn = document.getElementById("convert-btn");
const clearBtn = document.getElementById("clear-btn");
const netherInput = document.getElementById("nether-input");
const convertBackBtn = document.getElementById("convert-back-btn");
const clearBackBtn = document.getElementById("clear-back-btn");
const copyXyzBtn = document.getElementById("copy-xyz-btn");
const copyNetherBtn = document.getElementById("copy-nether-btn");
const copyOverworldBtn = document.getElementById("copy-overworld-btn");
const xyzOutput = document.getElementById("xyz-output");
const netherOutput = document.getElementById("nether-output");
const overworldOutput = document.getElementById("overworld-output");
const statusOutput = document.getElementById("status");
const statusBackOutput = document.getElementById("status-back");
const panelOverworldToNether = document.getElementById("panel-overworld-to-nether");
const panelNetherToOverworld = document.getElementById("panel-nether-to-overworld");
const tabOverworldToNether = document.getElementById("tab-overworld-to-nether");
const tabNetherToOverworld = document.getElementById("tab-nether-to-overworld");

// Supports patterns like: /tp -16024 ~ 6664
// Also allows optional leading slash and optional y values like 70 or ~1.
const TP_REGEX = /^\/?tp\s+(-?\d+(?:\.\d+)?)\s+(~?-?\d*(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)$/i;
// Supports "-2003 833" and optional tp format like "/tp -2003 ~ 833".
const NETHER_REGEX = /^(?:\/?tp\s+)?(-?\d+(?:\.\d+)?)(?:\s+~?-?\d*(?:\.\d+)?)?\s+(-?\d+(?:\.\d+)?)$/i;

function normalizeNumber(value) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(3).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

function parseTpCommand(text) {
  const trimmed = text.trim();
  const match = trimmed.match(TP_REGEX);

  if (!match) {
    return null;
  }

  const x = Number(match[1]);
  const y = match[2];
  const z = Number(match[3]);

  if (Number.isNaN(x) || Number.isNaN(z)) {
    return null;
  }

  return { x, y, z };
}

function parseNetherCoordinates(text) {
  const trimmed = text.trim();
  const match = trimmed.match(NETHER_REGEX);

  if (!match) {
    return null;
  }

  const x = Number(match[1]);
  const z = Number(match[2]);

  if (Number.isNaN(x) || Number.isNaN(z)) {
    return null;
  }

  return { x, z };
}

function setStatus(element, text, kind) {
  element.textContent = text;
  element.className = `message ${kind}`;
}

function convert() {
  const parsed = parseTpCommand(input.value);

  if (!parsed) {
    xyzOutput.textContent = "-";
    netherOutput.textContent = "-";
    setStatus(statusOutput, "Invalid tp command. Example: /tp -16024 ~ 6664", "error");
    return;
  }

  const netherX = parsed.x / 8;
  const netherZ = parsed.z / 8;

  xyzOutput.textContent = `${normalizeNumber(parsed.x)} ${parsed.y} ${normalizeNumber(parsed.z)}`;
  netherOutput.textContent = `${normalizeNumber(netherX)} ${parsed.y} ${normalizeNumber(netherZ)}`;
  setStatus(statusOutput, "Converted successfully.", "ok");
}

function convertBack() {
  const parsed = parseNetherCoordinates(netherInput.value);

  if (!parsed) {
    overworldOutput.textContent = "-";
    setStatus(statusBackOutput, "Invalid nether coordinates. Example: -2003 833", "error");
    return;
  }

  const overworldX = parsed.x * 8;
  const overworldZ = parsed.z * 8;
  overworldOutput.textContent = `${normalizeNumber(overworldX)} ${normalizeNumber(overworldZ)}`;
  setStatus(statusBackOutput, "Converted successfully.", "ok");
}

function clearAll() {
  input.value = "";
  xyzOutput.textContent = "-";
  netherOutput.textContent = "-";
  statusOutput.textContent = "";
  statusOutput.className = "message";
}

function clearBack() {
  netherInput.value = "";
  overworldOutput.textContent = "-";
  statusBackOutput.textContent = "";
  statusBackOutput.className = "message";
}

function switchTab(mode) {
  const overworldToNetherActive = mode === "overworld-to-nether";

  panelOverworldToNether.classList.toggle("active", overworldToNetherActive);
  panelNetherToOverworld.classList.toggle("active", !overworldToNetherActive);
  tabOverworldToNether.classList.toggle("active", overworldToNetherActive);
  tabNetherToOverworld.classList.toggle("active", !overworldToNetherActive);
  tabOverworldToNether.setAttribute("aria-selected", String(overworldToNetherActive));
  tabNetherToOverworld.setAttribute("aria-selected", String(!overworldToNetherActive));
}

async function copyOutput(text, label, statusElement) {
  if (!text || text === "-") {
    setStatus(statusElement, `Nothing to copy for ${label}. Convert first.`, "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus(statusElement, `${label} copied to clipboard.`, "ok");
  } catch (error) {
    setStatus(statusElement, `Clipboard copy failed for ${label}.`, "error");
  }
}

convertBtn.addEventListener("click", convert);
clearBtn.addEventListener("click", clearAll);
convertBackBtn.addEventListener("click", convertBack);
clearBackBtn.addEventListener("click", clearBack);
copyXyzBtn.addEventListener("click", () => {
  copyOutput(xyzOutput.textContent, "XYZ", statusOutput);
});
copyNetherBtn.addEventListener("click", () => {
  copyOutput(netherOutput.textContent, "Nether XYZ", statusOutput);
});
copyOverworldBtn.addEventListener("click", () => {
  copyOutput(overworldOutput.textContent, "Overworld XZ", statusBackOutput);
});
tabOverworldToNether.addEventListener("click", () => {
  switchTab("overworld-to-nether");
});
tabNetherToOverworld.addEventListener("click", () => {
  switchTab("nether-to-overworld");
});
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    convert();
  }
});
netherInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    convertBack();
  }
});

convert();
convertBack();