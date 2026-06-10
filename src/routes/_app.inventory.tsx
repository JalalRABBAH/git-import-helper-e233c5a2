import { createFileRoute } from "@tanstack/react-router";
import Inventory from "@/pages-imported/Inventory";

export const Route = createFileRoute("/_app/inventory")({
  head: () => ({
    meta: [
      { title: "Stocks et Inventaire — iReg Moto BF" },
      { name: "description", content: "Gestion des stocks, VIN, QR codes, modèles interdits et réconciliation." },
    ],
  }),
  component: Inventory,
});
