/** Regras de arquitetura: quem pode importar quem. Ver docs/adr e o documento de arquitetura. */
const api = "^apps/api/src";

module.exports = {
  forbidden: [
    {
      name: "sem-ciclos",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "servicos-nao-conhecem-infra",
      comment: "Serviços dependem só de portas e do pacote shared, nunca de adaptadores, rotas ou jobs.",
      severity: "error",
      from: { path: `${api}/services/` },
      to: { path: `${api}/(adapters|routes|jobs)/|${api}/app\\.ts` },
    },
    {
      name: "portas-sao-so-interfaces",
      comment: "Portas não importam nada da aplicação além de outras portas.",
      severity: "error",
      from: { path: `${api}/ports/` },
      to: { path: `${api}/(adapters|services|routes|jobs)/` },
    },
    {
      name: "rotas-nao-usam-adaptadores",
      comment: "Rotas chamam serviços; adaptadores chegam por injeção no app.ts.",
      severity: "error",
      from: { path: `${api}/routes/` },
      to: { path: `${api}/(adapters|jobs)/` },
    },
    {
      name: "adaptadores-nao-usam-regra",
      severity: "error",
      from: { path: `${api}/adapters/` },
      to: { path: `${api}/(services|routes|jobs)/` },
    },
    {
      name: "jobs-usam-servicos",
      severity: "error",
      from: { path: `${api}/jobs/` },
      to: { path: `${api}/(adapters|routes)/` },
    },
    {
      name: "web-e-api-separados",
      severity: "error",
      from: { path: "^apps/web" },
      to: { path: "^apps/api" },
    },
    {
      name: "api-e-web-separados",
      severity: "error",
      from: { path: "^apps/api" },
      to: { path: "^apps/web" },
    },
    {
      name: "shared-independente",
      severity: "error",
      from: { path: "^packages/shared" },
      to: { path: "^apps/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "(^|/)(dist|node_modules|coverage)/" },
    tsPreCompilationDeps: true,
    combinedDependencies: true,
  },
};
