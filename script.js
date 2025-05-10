function saveToLocalStorage() {
  const inputs = document.querySelectorAll("input");
  inputs.forEach(input => {
    localStorage.setItem(input.id, input.value);
  });
}
function loadFromLocalStorage() {
  const inputs = document.querySelectorAll("input");
  inputs.forEach(input => {
    const saved = localStorage.getItem(input.id);
    if (saved !== null) input.value = saved;
  });
}

function calculateModifier(score) {
  return Math.floor((score - 10) / 2);
}

function parseMod(text) {
  return parseInt((text || "0").replace(/[+]/g, "")) || 0;
}

function updateModifiers() {
  const stats = ["str", "dex", "con", "int", "wis", "cha"];
  const mods = {};
  stats.forEach(stat => {
    const base = parseInt(document.getElementById(stat).value) || 0;
    const temp = parseInt(document.getElementById(stat + "-temp").value) || 0;
    const mod = calculateModifier(base + temp);
    mods[stat] = mod;
    document.getElementById(stat + "-mod").textContent = (mod >= 0 ? "+" : "") + mod;
  });

  if (document.getElementById("ac-dex")) document.getElementById("ac-dex").value = mods.dex;
  if (document.getElementById("fort-mod")) document.getElementById("fort-mod").value = mods.con;
  if (document.getElementById("ref-mod")) document.getElementById("ref-mod").value = mods.dex;
  if (document.getElementById("will-mod")) document.getElementById("will-mod").value = mods.wis;
}

function updateAC() {
  const base = 10;
  const armor = parseInt(document.getElementById("ac-armor").value) || 0;
  const shield = parseInt(document.getElementById("ac-shield").value) || 0;
  const dex = parseInt(document.getElementById("ac-dex").value) || 0;
  const size = parseInt(document.getElementById("ac-size").value) || 0;
  const natural = parseInt(document.getElementById("ac-natural").value) || 0;
  const deflect = parseInt(document.getElementById("ac-deflection").value) || 0;
  const misc = parseInt(document.getElementById("ac-misc").value) || 0;

  const total = base + armor + shield + dex + size + natural + deflect + misc;
  const touch = total - armor - natural;
  const flat = total - dex - shield;

  document.getElementById("ac-total").value = total;
  document.getElementById("ac-touch").value = touch;
  document.getElementById("ac-flat").value = flat;
}

function updateSaves() {
  ["fort", "ref", "will"].forEach(save => {
    const base = parseInt(document.getElementById(`${save}-base`).value) || 0;
    const mod = parseInt(document.getElementById(`${save}-mod`).value) || 0;
    const magic = parseInt(document.getElementById(`${save}-magic`).value) || 0;
    const misc = parseInt(document.getElementById(`${save}-misc`).value) || 0;
    const temp = parseInt(document.getElementById(`${save}-temp`).value) || 0;
    const total = base + mod + magic + misc + temp;
    document.getElementById(`${save}-total`).value = total;
  });
}

function updateInitiative() {
  const dexMod = parseMod(document.getElementById("dex-mod")?.textContent);
  const misc = parseInt(document.getElementById("init-misc").value) || 0;
  document.getElementById("init-mod").value = dexMod;
  document.getElementById("init-total").value = dexMod + misc;
}

function updateBMC() {
  const bab = parseInt(document.getElementById("bab-base").value) || 0;
  const str = parseMod(document.getElementById("str-mod")?.textContent);
  const size = parseInt(document.getElementById("ac-size").value) || 0;
  const misc = parseInt(document.getElementById("bmc-misc").value) || 0;

  document.getElementById("bmc-bab").value = bab;
  document.getElementById("bmc-str").value = str;
  document.getElementById("bmc-size").value = size;

  document.getElementById("bmc-total").value = bab + str + size + misc;
}

function updateDMC() {
  const bab = parseInt(document.getElementById("bab-base").value) || 0;
  const str = parseMod(document.getElementById("str-mod")?.textContent);
  const dex = parseMod(document.getElementById("dex-mod")?.textContent);
  const size = parseInt(document.getElementById("ac-size").value) || 0;
  const misc = parseInt(document.getElementById("dmc-misc").value) || 0;

  document.getElementById("dmc-bab").value = bab;
  document.getElementById("dmc-str").value = str;
  document.getElementById("dmc-dex").value = dex;
  document.getElementById("dmc-size").value = size;

  document.getElementById("dmc-total").value = 10 + bab + str + dex + size + misc;
}

function refreshAll() {
  updateModifiers();
  updateAC();
  updateSaves();
  updateInitiative();
  updateBMC();
  updateDMC();
}

document.querySelectorAll("input").forEach(input => {
  input.addEventListener("input", saveToLocalStorage);
});

loadFromLocalStorage();

["str", "dex", "con", "int", "wis", "cha"].forEach(stat => {
  ["", "-temp"].forEach(suffix => {
    const el = document.getElementById(stat + suffix);
    if (el) el.addEventListener("input", refreshAll);
  });
});

["ac-armor", "ac-shield", "ac-dex", "ac-size", "ac-natural", "ac-deflection", "ac-misc"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", refreshAll);
});

["fort", "ref", "will"].forEach(save => {
  ["base", "mod", "magic", "misc", "temp"].forEach(part => {
    const el = document.getElementById(`${save}-${part}`);
    if (el) el.addEventListener("input", refreshAll);
  });
});

const initMiscEl = document.getElementById("init-misc");
if (initMiscEl) {
  initMiscEl.addEventListener("input", refreshAll);
}

["bmc-misc", "bab-base", "ac-size"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", refreshAll);
});

["dmc-misc", "bab-base", "ac-size"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", refreshAll);
});


function addWeapon(data = {}) {
  const table = document.querySelector("#weapons-table tbody");
  const row = document.createElement("tr");

  const fields = [
    "nome", "danno", "tipo", "critico",
    "bonusAttacco", "gittata", "munizioni", "sneak"
  ];

  const inputs = {};

  fields.forEach((key, index) => {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = key === "bonusAttacco" ? "number" : "text";
    input.value = data[key] || "";
    if (key !== "bonusAttacco") {
      input.addEventListener("input", saveWeapons);
    }
    inputs[key] = input;
    td.appendChild(input);
    row.appendChild(td);
  });

  // Calcolo automatico del bonus attacco
  function updateWeaponAttackBonus() {
    const bab = parseInt(document.getElementById("bab-base").value) || 0;
    const dexMod = parseMod(document.getElementById("dex-mod")?.textContent);
    inputs["bonusAttacco"].value = bab + dexMod;
  }

  // aggiorna quando cambia BAB o modificatore destrezza
  document.getElementById("bab-base").addEventListener("input", updateWeaponAttackBonus);
  document.getElementById("dex").addEventListener("input", () => {
    refreshAll();
    updateWeaponAttackBonus();
  });
  document.getElementById("dex-temp").addEventListener("input", () => {
    refreshAll();
    updateWeaponAttackBonus();
  });

  updateWeaponAttackBonus();

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "🗑️";
  removeBtn.onclick = () => {
    row.remove();
    saveWeapons();
  };
  const tdRemove = document.createElement("td");
  tdRemove.appendChild(removeBtn);
  row.appendChild(tdRemove);

  table.appendChild(row);
  saveWeapons();
}


function saveWeapons() {
  const rows = document.querySelectorAll("#weapons-table tbody tr");
  const weapons = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll("td input");
    const weapon = {
      nome: cells[0].value,
      danno: cells[1].value,
      tipo: cells[2].value,
      critico: cells[3].value,
      bonusAttacco: parseInt(cells[4].value) || 0,
      gittata: cells[5].value,
      munizioni: cells[6].value,
      sneak: cells[7].value
    };
    weapons.push(weapon);
  });

  localStorage.setItem("armi", JSON.stringify(weapons));
}

function loadWeapons() {
  const saved = JSON.parse(localStorage.getItem("armi") || "[]");
  saved.forEach(addWeapon);
}

window.addEventListener("DOMContentLoaded", loadWeapons);

const skillList = [
  { name: "Acrobazia [DES]", stat: "dex" },
  { name: "Addestrare Animali [CAR]", stat: "cha" },
  { name: "Artigianato [INT]", stat: "int" },
  { name: "Artista della Fuga [DES]", stat: "dex" },
  { name: "Camuffare [CAR]", stat: "cha" },
  { name: "Cavalcare [DES]", stat: "dex" },
  { name: "Conoscenze (arcane) [INT]", stat: "int" },
  { name: "Conoscenze (dungeon) [INT]", stat: "int" },
  { name: "Conoscenze (geografia) [INT]", stat: "int" },
  { name: "Conoscenze (ingegneria) [INT]", stat: "int" },
  { name: "Conoscenze (locali) [INT]", stat: "int" },
  { name: "Conoscenze (natura) [INT]", stat: "int" },
  { name: "Conoscenze (nobiltà) [INT]", stat: "int" },
  { name: "Conoscenze (piani) [INT]", stat: "int" },
  { name: "Conoscenze (religioni) [INT]", stat: "int" },
  { name: "Conoscenze (storia) [INT]", stat: "int" },
  { name: "Diplomazia [CAR]", stat: "cha" },
  { name: "Disattivare Congegni [DES]", stat: "dex" },
  { name: "Furtività [DES]", stat: "dex" },
  { name: "Guarire [SAG]", stat: "wis" },
  { name: "Intimidire [CAR]", stat: "cha" },
  { name: "Intrattenere [CAR]", stat: "cha" },
  { name: "Intuizione [SAG]", stat: "wis" },
  { name: "Linguistica [INT]", stat: "int" },
  { name: "Nuotare [FOR]", stat: "str" },
  { name: "Percezione [SAG]", stat: "wis" },
  { name: "Professione [SAG]", stat: "wis" },
  { name: "Raggirare [CAR]", stat: "cha" },
  { name: "Rapidità di Mano [DES]", stat: "dex" },
  { name: "Sapienza Magica [INT]", stat: "int" },
  { name: "Scalare [FOR]", stat: "str" },
  { name: "Sopravvivenza [SAG]", stat: "wis" },
  { name: "Utilizzare Congegni Magici [CAR]", stat: "cha" },
  { name: "Valutare [INT]", stat: "int" },
  { name: "Volare [DES]", stat: "dex" }
];

function createSkillsTable() {
  const tbody = document.querySelector("#skills-table tbody");
  skillList.forEach(skill => {
    const row = document.createElement("tr");

    // Nome abilità
    const tdName = document.createElement("td");
    tdName.textContent = skill.name;
    row.appendChild(tdName);

    // Addestrata
    const tdAdd = document.createElement("td");
    const trained = document.createElement("input");
    trained.type = "checkbox";
    tdAdd.appendChild(trained);
    row.appendChild(tdAdd);

    // Totale (readonly)
    const tdTotal = document.createElement("td");
    const total = document.createElement("input");
    total.type = "number";
    total.readOnly = true;
    tdTotal.appendChild(total);
    row.appendChild(tdTotal);

    // Gradi
    const tdRanks = document.createElement("td");
    const ranks = document.createElement("input");
    ranks.type = "number";
    ranks.value = 0;
    tdRanks.appendChild(ranks);
    row.appendChild(tdRanks);

    // Mod. Car (auto)
    const tdMod = document.createElement("td");
    const mod = document.createElement("input");
    mod.type = "number";
    mod.readOnly = true;
    tdMod.appendChild(mod);
    row.appendChild(tdMod);

    // Bonus Vari
    const tdMisc = document.createElement("td");
    const misc = document.createElement("input");
    misc.type = "number";
    misc.value = 0;
    tdMisc.appendChild(misc);
    row.appendChild(tdMisc);

    // Note
    const tdNote = document.createElement("td");
    const note = document.createElement("input");
    note.type = "text";
    tdNote.appendChild(note);
    row.appendChild(tdNote);

    // Aggiorna funzione
    function updateSkillTotal() {
      const statMod = parseMod(document.getElementById(`${skill.stat}-mod`).textContent);
      mod.value = statMod;
      total.value = parseInt(ranks.value || 0) + statMod + parseInt(misc.value || 0);
      saveSkills();
    }

    // Eventi
    [ranks, misc, trained, note].forEach(input => {
      input.addEventListener("input", updateSkillTotal);
    });

    // Lega agli update generali
    document.getElementById(skill.stat).addEventListener("input", () => {
      refreshAll();
      updateSkillTotal();
    });
    document.getElementById(`${skill.stat}-temp`).addEventListener("input", () => {
      refreshAll();
      updateSkillTotal();
    });

    tbody.appendChild(row);
    skill.rowElements = { total, ranks, mod, misc, trained, note };
  });
}

function saveSkills() {
  const data = skillList.map(skill => {
    const { ranks, misc, trained, note } = skill.rowElements;
    return {
      name: skill.name,
      ranks: parseInt(ranks.value) || 0,
      misc: parseInt(misc.value) || 0,
      trained: trained.checked,
      note: note.value
    };
  });
  localStorage.setItem("skills", JSON.stringify(data));
}

function loadSkills() {
  const saved = JSON.parse(localStorage.getItem("skills") || "[]");
  saved.forEach(savedSkill => {
    const skill = skillList.find(s => s.name === savedSkill.name);
    if (skill && skill.rowElements) {
      skill.rowElements.ranks.value = savedSkill.ranks;
      skill.rowElements.misc.value = savedSkill.misc;
      skill.rowElements.trained.checked = savedSkill.trained;
      skill.rowElements.note.value = savedSkill.note;
    }
  });
  skillList.forEach(skill => {
    if (skill.rowElements) {
      const evt = new Event("input");
      skill.rowElements.ranks.dispatchEvent(evt);
    }
  });
}

// Al caricamento
window.addEventListener("DOMContentLoaded", () => {
  createSkillsTable();
  loadSkills();
});

function addArmor(data = {}) {
  const table = document.querySelector("#armor-table tbody");
  const row = document.createElement("tr");

  const fields = [
    "nome", "bonusCA", "penalita", "bonusDes", "fallimentoArcani", "peso", "equip", "note"
  ];

  const inputs = {};

  fields.forEach(key => {
    const td = document.createElement("td");
    let input;

    if (key === "equip") {
      input = document.createElement("input");
      input.type = "radio";
      input.name = "armor-equip"; // tutte collegate
      input.checked = data[key] || false;
      input.addEventListener("change", saveArmors);
    } else {
      input = document.createElement("input");
      input.type = (["bonusCA", "penalita", "bonusDes", "fallimentoArcani", "peso"].includes(key)) ? "number" : "text";
      input.value = data[key] || "";
      input.addEventListener("input", saveArmors);
    }

    inputs[key] = input;
    td.appendChild(input);
    row.appendChild(td);
  });

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "🗑️";
  removeBtn.onclick = () => {
    row.remove();
    saveArmors();
  };
  const tdRemove = document.createElement("td");
  tdRemove.appendChild(removeBtn);
  row.appendChild(tdRemove);

  table.appendChild(row);
  saveArmors();
}

function saveArmors() {
  const rows = document.querySelectorAll("#armor-table tbody tr");
  const armors = [];

  let equippedArmorBonus = 0;

  rows.forEach(row => {
    const cells = row.querySelectorAll("td input");
    const armor = {
      nome: cells[0].value,
      bonusCA: parseInt(cells[1].value) || 0,
      penalita: parseInt(cells[2].value) || 0,
      bonusDes: parseInt(cells[3].value) || 0,
      fallimentoArcani: parseInt(cells[4].value) || 0,
      peso: parseFloat(cells[5].value) || 0,
      equip: cells[6].checked || false,
      note: cells[7].value
    };
    armors.push(armor);

    if (armor.equip) {
      equippedArmorBonus = armor.bonusCA;
    }
  });

  localStorage.setItem("armature", JSON.stringify(armors));

  const acArmorEl = document.getElementById("ac-armor");
  if (acArmorEl) {
    acArmorEl.value = equippedArmorBonus;
    refreshAll();
  }
}

function loadArmors() {
  const saved = JSON.parse(localStorage.getItem("armature") || "[]");
  saved.forEach(addArmor);
}

window.addEventListener("DOMContentLoaded", loadArmors);



refreshAll();

function exportSheet() {
  const data = {
    armi: JSON.parse(localStorage.getItem("armi") || "[]"),
    armature: JSON.parse(localStorage.getItem("armature") || "[]"),
    skills: JSON.parse(localStorage.getItem("skills") || "[]"),
    stats: {}
  };

  ["str", "dex", "con", "int", "wis", "cha"].forEach(stat => {
    data.stats[stat] = {
      base: document.getElementById(stat).value,
      temp: document.getElementById(stat + "-temp").value
    };
  });

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "scheda-dravok.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importSheet() {
  const file = document.getElementById("importFile").files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = JSON.parse(e.target.result);

    if (data.stats) {
      Object.keys(data.stats).forEach(stat => {
        document.getElementById(stat).value = data.stats[stat].base;
        document.getElementById(stat + "-temp").value = data.stats[stat].temp;
      });
    }

    if (data.armi) {
      localStorage.setItem("armi", JSON.stringify(data.armi));
    }

    if (data.armature) {
      localStorage.setItem("armature", JSON.stringify(data.armature));
    }

    if (data.skills) {
      localStorage.setItem("skills", JSON.stringify(data.skills));
    }

    refreshAll();
    loadWeapons();
    loadArmors();
    loadSkills();
  };

  reader.readAsText(file);
}

