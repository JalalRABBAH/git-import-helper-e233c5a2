import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/pages-imported/Dashboard";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de Bord — iReg Moto BF" },
      { name: "description", content: "Vue d'ensemble, KPIs, conformité et alertes pour les opérateurs deux-roues." },
    ],
  }),
  component: Dashboard,
});
