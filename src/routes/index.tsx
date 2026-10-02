import { createFileRoute } from "@tanstack/react-router";
import { ClassroomApp } from "@/components/classroom/classroom-app";

export const Route = createFileRoute("/")({
  component: ClassroomApp,
});
