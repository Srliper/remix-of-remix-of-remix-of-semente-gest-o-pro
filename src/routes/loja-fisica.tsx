import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Boxes, MapPin, PackageCheck, ShoppingCart, Store as StoreIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useVisibleProducts, useVisibleSales } from "@/lib/store";
import { brl, STORE_LABEL, type Store } from "@/lib/types";
import adminGestor from "@/assets/icons/admin-gestor.png";
import adminChave from "@/assets/icons/admin-chave.png";

export const Route = createFileRoute("/loja-fisica")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Gestão da Loja Física — Brechó A Semente" },
    { name: "description", content: "Acompanhe vendas de balcão e estoque das lojas físicas do Brechó A Semente." },
    { property: "og:title", content: "Gestão da Loja Física — Brechó A Semente" },
    { property: "og:description", content: "Operação das unidades Retiro e São Miguel Arcanjo." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: PhysicalStorePage,
});

function PhysicalStorePage() {
  const products = useVisibleProducts();
  const sales = useVisibleSales();
  const counterSales = sales.filter((sale) => sale.sale_type === "balcao");
  const today = new Date().toDateString();
  const todaySales = counterSales.filter((sale) => new Date(sale.created_at).toDateString() === today);
  const lowStock = products.filter((product) => product.stock_qty > 0 && product.stock_qty < 3);
  const stores: Store[] = ["retiro", "sao_miguel"];
  return <AppShell title="Gestão da Loja Física" subtitle="Vendas de balcão e estoque das duas unidades" actions={<Button asChild><Link to="/pdv"><ShoppingCart />Abrir PDV</Link></Button>}>
    <div className="grid gap-4 lg:grid-cols-2">{stores.map((store, index) => { const storeProducts = products.filter((product) => product.store_location === store); const storeToday = todaySales.filter((sale) => sale.store_location === store); return <section key={store} className="relative overflow-hidden border bg-card p-5 shadow-soft"><img src={index === 0 ? adminGestor : adminChave} alt="" className="absolute -bottom-8 -right-6 size-40 object-contain opacity-10" /><div className="relative"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary"><StoreIcon /></span><div><p className="text-xs uppercase text-muted-foreground">Unidade</p><h2 className="font-display text-xl font-bold">{STORE_LABEL[store]}</h2></div></div><div className="mt-5 grid grid-cols-3 gap-3"><div className="border-l-2 border-secondary pl-3"><p className="text-xs text-muted-foreground">Vendas hoje</p><p className="font-display text-xl font-bold">{brl(storeToday.reduce((sum, sale) => sum + sale.total_amount, 0))}</p></div><div className="border-l-2 border-primary pl-3"><p className="text-xs text-muted-foreground">Atendimentos</p><p className="font-display text-xl font-bold">{storeToday.length}</p></div><div className="border-l-2 border-gold pl-3"><p className="text-xs text-muted-foreground">Estoque</p><p className="font-display text-xl font-bold">{storeProducts.reduce((sum, product) => sum + product.stock_qty, 0)}</p></div></div></div></section>; })}</div>
    <div className="mt-5 grid gap-4 lg:grid-cols-3"><Card className="shadow-soft lg:col-span-2"><CardHeader className="flex-row items-center justify-between"><CardTitle className="font-display text-lg">Últimas vendas no balcão</CardTitle><Badge variant="outline"><MapPin className="size-3" /> Duas unidades</Badge></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Horário</TableHead><TableHead>Unidade</TableHead><TableHead>Vendedor</TableHead><TableHead>Peças</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader><TableBody>{counterSales.slice(0, 8).map((sale) => <TableRow key={sale.id}><TableCell>{new Date(sale.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</TableCell><TableCell>{STORE_LABEL[sale.store_location]}</TableCell><TableCell>{sale.user_name}</TableCell><TableCell>{sale.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell><TableCell className="text-right font-medium">{brl(sale.total_amount)}</TableCell></TableRow>)}{!counterSales.length && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Nenhuma venda de balcão registrada.</TableCell></TableRow>}</TableBody></Table></CardContent></Card><Card className="shadow-soft"><CardHeader><CardTitle className="flex items-center gap-2 font-display text-lg"><AlertTriangle className="size-5 text-gold" />Estoque baixo</CardTitle></CardHeader><CardContent className="space-y-3">{lowStock.slice(0, 7).map((product) => <div key={product.id} className="flex items-center justify-between border-b pb-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{product.name}</p><p className="text-xs text-muted-foreground">{STORE_LABEL[product.store_location]}</p></div><Badge className="bg-gold text-gold-foreground">{product.stock_qty} un.</Badge></div>)}{!lowStock.length && <div className="py-8 text-center"><PackageCheck className="mx-auto size-8 text-success" /><p className="mt-2 text-sm text-muted-foreground">Estoque em bom nível.</p></div>}<Button variant="outline" className="w-full" asChild><Link to="/produtos"><Boxes />Gerenciar produtos</Link></Button></CardContent></Card></div>
  </AppShell>;
}
