import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/equipe")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Equipe — Brechó A Semente" },
      {
        name: "description",
        content: "Gerencie as colaboradoras das unidades do Brechó A Semente.",
      },
      { property: "og:title", content: "Equipe — Brechó A Semente" },
      {
        property: "og:description",
        content: "Gerencie as colaboradoras das unidades do Brechó A Semente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EquipePage,
});

function EquipePage() {
  return (
    <AppShell title="Equipe" subtitle="Gerencie as colaboradoras.">
      <Card>
        <CardHeader>
          <CardTitle>Em construção</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          A gestão de equipe será disponibilizada em breve.
        </CardContent>
      </Card>
    </AppShell>
  );
}
