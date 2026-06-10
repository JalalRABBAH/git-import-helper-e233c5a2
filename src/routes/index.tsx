import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "iReg Moto BF — Plateforme Réglementaire Deux-Roues" },
      {
        name: "description",
        content:
          "Plateforme SaaS de conformité réglementaire pour le secteur des deux-roues au Burkina Faso.",
      },
    ],
  }),
  component: () => <Navigate to="/dashboard" replace />,
});
