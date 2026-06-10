import { createFileRoute } from "@tanstack/react-router";
import Help from "@/pages-imported/Help";

export const Route = createFileRoute("/_app/help")({
  head: () => ({
    meta: [
      { title: "Aide et Support — iReg Moto BF" },
      { name: "description", content: "Documentation, tutoriels et support technique." },
    ],
  }),
  component: Help,
});
