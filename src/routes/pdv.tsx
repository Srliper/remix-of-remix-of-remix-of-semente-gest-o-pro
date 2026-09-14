import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/pdv")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "PDV — Vendas | Brechó A Semente" },
      {
        name: "description",
        content: "Registre vendas no ponto de venda do Brechó A Semente.",
      },
      { property: "og:title", content: "PDV — Vendas | Brechó A Semente" },
      {
        property: "og:description",
        content: "Registre vendas no ponto de venda do Brechó A Semente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PdvPage,
});

function PdvPage() {
  return (
    <AppShell title="PDV — Vendas" subtitle="Registre vendas rapidamente.">
      <Card>
        <CardHeader>
          <CardTitle>Em construção</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          O ponto de venda será disponibilizado em breve.
        </CardContent>
      </Card>
    </AppShell>
  );
}
