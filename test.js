const fs = require("fs");
const path = require("path");

// Verificar se os arquivos principais existem
const files = [
  "package.json",
  "tsconfig.json",
  "src/index.ts",
  "src/app.ts",
  "src/config/index.ts",
  "src/db/index.ts",
  "src/db/schema.ts",
  "src/services/auth.ts",
  "src/routes/auth.ts",
  "src/routes/users.ts",
  "src/routes/access-levels.ts",
  "src/routes/health.ts",
  "Dockerfile",
  "docker-compose.yml",
  "README.md",
];

console.log("✅ Verificando estrutura do projeto...\n");

files.forEach((file) => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file}`);
  }
});

console.log("\n✅ Verificação concluída!");
console.log("\n📝 Para iniciar o projeto:");
console.log("1. Copie env.example para .env");
console.log("2. Configure as variáveis de ambiente");
console.log("3. Execute: docker-compose up -d");
console.log("4. Ou execute: npm run dev (após configurar PostgreSQL e Redis)");
