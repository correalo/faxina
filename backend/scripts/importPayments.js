const fs = require("fs");
const importData = require("./scripts/importData");

const data = fs.readFileSync("./data/planilha.txt", "utf-8");

importData(data)
  .then(() => console.log("Importação concluída"))
  .catch(err => console.error("Erro na importação:", err));
