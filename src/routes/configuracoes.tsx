import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/configuracoes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Configurações — Brechó A Semente" },
      {
        name: "description",
        content: "Ajuste preferências e dados das unidades do Brechó A Semente.",
      },
      { property: "og:title", content: "Configurações — Brechó A Semente" },
      {
        property: "og:description",
        content: "Ajuste preferências e dados das unidades do Brechó A Semente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  return (
    <AppShell title="Configurações" subtitle="Ajuste as preferências do sistema.">
      <Card>
        <CardHeader>
          <CardTitle>Em construção</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          As configurações estarão disponíveis em breve.
        </CardContent>
      </Card>
    </AppShell>
  );
}
