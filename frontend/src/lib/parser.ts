import { data } from './types';

export const parseTimelessJewel = (rawData: string | null | undefined) => {
  if (!rawData) {
    return;
  }
  const jewels = Object.keys(data.TimelessJewels).map((k) => ({
    value: parseInt(k),
    label: data.TimelessJewels[k]
  }));

  const conquerors = (jewel) => {
    return Object.keys(data.TimelessJewelConquerors[jewel.value])?.map((k) => ({
      value: k,
      label: k
    }));
  };

  return parseTimelessJewel(rawData, jewels, conquerors); // { type: type, conqueror: conqueror, seed: seed };
};

function parseTimelessJewelRaw(raw: string, jewels, conquerors) {
  let itemClass = "?";
  let seed = "";
  let conqueror = "";
  let rawLines = [];
  let checkSection = false;
  let rarity = undefined;
  let type = undefined;
  let conquerorList = {};

  // Find non-blank lines and trim whitespace
  raw.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (trimmed.length > 0) rawLines.push(trimmed);
  });

  let l = 0;

  // Process initial lines for item class and rarity
  if (rawLines[l]) {
    if (rawLines[l].startsWith("Item Class:")) {
      itemClass = rawLines[l].replace(/^Item Class:\s+/, "");
      l++;
    }

    const rarityMatch = rawLines[l] && rawLines[l].match(/^Rarity: (\w+)/);
    if (rarityMatch) {
      rarity = rarityMatch[1].toUpperCase();
    }
  }

  // Timeless Jewel & Rarity: Unique & Item Class: Jewels
  let isTimelessJewel = rawLines.some(line => line.includes("Timeless Jewel"));
  if (!isTimelessJewel || itemClass !== "Jewels" || !(rarity === "UNIQUE" || rarity === "RELIC")) {
    return;
  }

  let sectionsBuffer = [];

  for (const line of rawLines) {
    if (line === "--------") {
      checkSection = !checkSection;
      continue;
    }

    const jewel = jewels.find(jewel => jewel.label === line);

    if (jewel) {
      type = jewel;
      conquerorList = conquerors(jewel);
      continue;
    }

    if (checkSection) {
      sectionsBuffer.push(line);
    } else if (sectionsBuffer.length > 0) {
      if (sectionsBuffer.includes("Historic")) {
        seed = findNumbersInString(sectionsBuffer[0]).at(0);
        if (seed && conquerorList) {
          conqueror = conquerorList.find(jewelConqueror => sectionsBuffer[0]?.includes(jewelConqueror.label));
        }
      }
      sectionsBuffer = [];
    }
  }

  return { type: type, conqueror: conqueror, seed: seed };
}

function findNumbersInString(text: string | null | undefined): number[] {
  const regex = /\d+/g;
  const matches = text?.match(regex);

  if (matches) {
    return matches.map(Number);
  } else {
    return [];
  }
}

