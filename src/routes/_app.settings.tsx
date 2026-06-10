import { createFileRoute } from "@tanstack/react-router";
import Settings from "@/pages-imported/Settings";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Paramètres — iReg Moto BF" },
      { name: "description", content: "Configuration de l'entreprise, utilisateurs et préférences." },
    ],
  }),
  component: Settings,
});
