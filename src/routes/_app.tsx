import { createFileRoute } from "@tanstack/react-router";
import Layout from "@/components/imported/Layout";

export const Route = createFileRoute("/_app")({
  component: Layout,
});
