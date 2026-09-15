import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Check, ChevronRight, Clock3, MapPin, Phone, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp, useVisibleSales } from "@/lib/store";
import { brl, ORDER_FLOW, ORDER_STATUS_LABEL, STORE_LABEL, type OrderStatus, type Sale } from "@/lib/types";
import moto from "@/assets/icons/delivery-moto.png";
import pacote from "@/assets/icons/delivery-pacote.png";
import rota from "@/assets/icons/delivery-rota.png";
import entregue from "@/assets/icons/delivery-entregue.png";

export const Route = createFileRoute("/delivery")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Gestão do Delivery — Brechó A Semente" },
    { name: "description", content: "Acompanhe pedidos, preparo e entregas do Brechó A Semente." },
    { property: "og:title", content: "Gestão do Delivery — Brechó A Semente" },
    { property: "og:description", content: "Painel operacional dos pedidos delivery das duas unidades." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: DeliveryPage,
});

const COLUMNS: Array<{ status: OrderStatus; image: string; caption: string }> = [
  { status: "pendente", image: moto, caption: "Novos pedidos" },
  { status: "confirmado", image: pacote, caption: "Separação" },
  { status: "em_preparo", image: rota, caption: "Saindo para entrega" },
  { status: "entregue", image: entregue, caption: "Finalizados" },
];

function OrderCard({ sale, advance }: { sale: Sale; advance: (sale: Sale) => void }) {
  const nextIndex = ORDER_FLOW.indexOf(sale.status as OrderStatus) + 1;
  const next = ORDER_FLOW[nextIndex];
  return <Card className="shadow-soft"><CardContent className="space-y-3 py-4"><div className="flex items-start justify-between gap-2"><div><p className="font-display font-bold">{sale.customer_name || "Cliente sem nome"}</p><p className="text-xs text-muted-foreground">#{sale.id.slice(0, 8).toUpperCase()} · {new Date(sale.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p></div><Badge variant="outline">{brl(sale.total_amount)}</Badge></div><div className="space-y-1.5 text-sm text-muted-foreground"><p className="flex gap-2"><MapPin className="mt-0.5 size-3.5 shrink-0" />{sale.customer_address || "Endereço não informado"}</p><p className="flex gap-2"><Phone className="size-3.5 shrink-0" />{sale.customer_phone || "Telefone não informado"}</p><p className="flex gap-2"><ShoppingBag className="size-3.5 shrink-0" />{sale.items.reduce((sum, item) => sum + item.quantity, 0)} peça(s) · {STORE_LABEL[sale.store_location]}</p></div><div className="border-t pt-3"><p className="mb-2 text-xs text-muted-foreground">{sale.items.map((item) => `${item.quantity}× ${item.product_name}`).join(" · ") || "Itens do pedido"}</p>{next ? <Button size="sm" className="w-full" onClick={() => advance(sale)}>Avançar para {ORDER_STATUS_LABEL[next]} <ChevronRight /></Button> : <div className="flex items-center justify-center gap-2 text-sm font-medium text-success"><Check className="size-4" />Entrega concluída</div>}</div></CardContent></Card>;
}

function DeliveryPage() {
  const { setOrderStatus } = useApp();
  const sales = useVisibleSales();
  const deliveries = useMemo(() => sales.filter((sale) => sale.sale_type === "delivery" && sale.status !== "cancelado"), [sales]);
  const advance = async (sale: Sale) => {
    const next = ORDER_FLOW[ORDER_FLOW.indexOf(sale.status as OrderStatus) + 1];
    if (!next) return;
    try { await setOrderStatus(sale.id, next); toast.success(`Pedido atualizado para ${ORDER_STATUS_LABEL[next]}.`); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o pedido."); }
  };
  return <AppShell title="Gestão do Delivery" subtitle={`${deliveries.filter((sale) => sale.status !== "entregue").length} pedido(s) em andamento`} actions={<Button variant="outline" asChild><a href="/loja" target="_blank" rel="noreferrer">Ver loja do cliente</a></Button>}>
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{COLUMNS.map((column) => { const count = deliveries.filter((sale) => sale.status === column.status).length; return <div key={column.status} className="flex items-center gap-3 border-l-4 border-secondary bg-card px-4 py-3 shadow-soft"><img src={column.image} alt="" className="size-14 object-contain" /><div><p className="text-xs text-muted-foreground">{column.caption}</p><p className="font-display text-xl font-bold">{count} {ORDER_STATUS_LABEL[column.status].toLowerCase()}</p></div></div>; })}</div>
    <div className="grid gap-4 xl:grid-cols-4">{COLUMNS.map((column) => { const orders = deliveries.filter((sale) => sale.status === column.status); return <section key={column.status} className="min-w-0"><div className="mb-3 flex items-center justify-between border-b pb-2"><div className="flex items-center gap-2"><Clock3 className="size-4 text-secondary" /><h2 className="font-display font-bold">{ORDER_STATUS_LABEL[column.status]}</h2></div><Badge>{orders.length}</Badge></div><div className="space-y-3">{orders.map((sale) => <OrderCard key={sale.id} sale={sale} advance={advance} />)}{!orders.length && <div className="border border-dashed p-6 text-center text-sm text-muted-foreground">Nenhum pedido nesta etapa.</div>}</div></section>; })}</div>
  </AppShell>;
}
