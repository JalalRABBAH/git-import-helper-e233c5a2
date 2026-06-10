import { createFileRoute } from "@tanstack/react-router";
import Customers from "@/pages-imported/Customers";

export const Route = createFileRoute("/_app/customers")({
  head: () => ({
    meta: [
      { title: "Clientèle et Traçabilité — iReg Moto BF" },
      { name: "description", content: "KYC, traçabilité acheteur-engin, historique clients." },
    ],
  }),
  component: Customers,
});
