import { createFileRoute } from "@tanstack/react-router";
import { ThemesScreen } from "@/components/ThemesScreen";

export const Route = createFileRoute("/themes")({
  head: () => ({
    meta: [
      { title: "My Style — India Explorer" },
      {
        name: "description",
        content: "Customize the app theme and appearance.",
      },
      { property: "og:title", content: "My Style" },
      { property: "og:description", content: "Choose your favorite theme." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ThemesScreen,
});
