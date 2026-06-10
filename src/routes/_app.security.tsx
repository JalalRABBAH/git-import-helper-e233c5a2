import { createFileRoute } from "@tanstack/react-router";
import Security from "@/pages-imported/Security";

export const Route = createFileRoute("/_app/security")({
  head: () => ({
    meta: [
      { title: "Sécurité et Alertes — iReg Moto BF" },
      { name: "description", content: "Détection de fraudes, signalements CNTI et alertes de sécurité." },
    ],
  }),
  component: Security,
});
