import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/relatorios")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Relatórios — Brechó A Semente" },
      {
        name: "description",
        content: "Acompanhe vendas, estoque e desempenho das unidades do Brechó A Semente.",
      },
      { property: "og:title", content: "Relatórios — Brechó A Semente" },
      {
        property: "og:description",
        content: "Acompanhe vendas, estoque e desempenho das unidades do Brechó A Semente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  return (
    <AppShell title="Relatórios" subtitle="Acompanhe o desempenho das unidades.">
      <Card>
        <CardHeader>
          <CardTitle>Em construção</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Os relatórios detalhados chegam em breve.
        </CardContent>
      </Card>
    </AppShell>
  );
}
