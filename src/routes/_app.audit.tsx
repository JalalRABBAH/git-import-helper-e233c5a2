import { createFileRoute } from "@tanstack/react-router";
import Audit from "@/pages-imported/Audit";

export const Route = createFileRoute("/_app/audit")({
  head: () => ({
    meta: [
      { title: "Conformité et Audit — iReg Moto BF" },
      { name: "description", content: "Scoring conformité réglementaire sur 150 points et pistes d'audit." },
    ],
  }),
  component: Audit,
});
