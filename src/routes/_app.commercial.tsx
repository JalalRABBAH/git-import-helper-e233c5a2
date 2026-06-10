import { createFileRoute } from "@tanstack/react-router";
import Commercial from "@/pages-imported/Commercial";

export const Route = createFileRoute("/_app/commercial")({
  head: () => ({
    meta: [
      { title: "Gestion Commerciale — iReg Moto BF" },
      { name: "description", content: "Suivi des ventes, factures et opérations commerciales." },
    ],
  }),
  component: Commercial,
});
