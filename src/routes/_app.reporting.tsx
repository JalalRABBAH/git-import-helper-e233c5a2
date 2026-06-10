import { createFileRoute } from "@tanstack/react-router";
import Reporting from "@/pages-imported/Reporting";

export const Route = createFileRoute("/_app/reporting")({
  head: () => ({
    meta: [
      { title: "Rapportage Trimestriel — iReg Moto BF" },
      { name: "description", content: "Génération automatique des rapports trimestriels XML + PDF signés." },
    ],
  }),
  component: Reporting,
});
