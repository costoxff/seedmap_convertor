const input = document.getElementById("tp-input");
const convertBtn = document.getElementById("convert-btn");
const clearBtn = document.getElementById("clear-btn");
const copyXyzBtn = document.getElementById("copy-xyz-btn");
const copyNetherBtn = document.getElementById("copy-nether-btn");
const xyzOutput = document.getElementById("xyz-output");
const netherOutput = document.getElementById("nether-output");
const statusOutput = document.getElementById("status");

// Supports patterns like: /tp -16024 ~ 6664
// Also allows optional leading slash and optional y values like 70 or ~1.
const TP_REGEX = /^\/?tp\s+(-?\d+(?:\.\d+)?)\s+(~?-?\d*(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)$/i;

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

function setStatus(text, kind) {
  statusOutput.textContent = text;
  statusOutput.className = `message ${kind}`;
}

function convert() {
  const parsed = parseTpCommand(input.value);

  if (!parsed) {
    xyzOutput.textContent = "-";
    netherOutput.textContent = "-";
    setStatus("Invalid tp command. Example: /tp -16024 ~ 6664", "error");
    return;
  }

  const netherX = parsed.x / 8;
  const netherZ = parsed.z / 8;

  xyzOutput.textContent = `${normalizeNumber(parsed.x)} ${parsed.y} ${normalizeNumber(parsed.z)}`;
  netherOutput.textContent = `${normalizeNumber(netherX)} ${parsed.y} ${normalizeNumber(netherZ)}`;
  setStatus("Converted successfully.", "ok");
}

function clearAll() {
  input.value = "";
  xyzOutput.textContent = "-";
  netherOutput.textContent = "-";
  statusOutput.textContent = "";
  statusOutput.className = "message";
}

async function copyOutput(text, label) {
  if (!text || text === "-") {
    setStatus(`Nothing to copy for ${label}. Convert first.`, "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus(`${label} copied to clipboard.`, "ok");
  } catch (error) {
    setStatus(`Clipboard copy failed for ${label}.`, "error");
  }
}

convertBtn.addEventListener("click", convert);
clearBtn.addEventListener("click", clearAll);
copyXyzBtn.addEventListener("click", () => {
  copyOutput(xyzOutput.textContent, "XYZ");
});
copyNetherBtn.addEventListener("click", () => {
  copyOutput(netherOutput.textContent, "Nether XYZ");
});
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    convert();
  }
});

convert();