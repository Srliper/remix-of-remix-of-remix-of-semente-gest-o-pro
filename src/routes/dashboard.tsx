import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { ArrowRight, Boxes, DollarSign, PackageCheck, ShoppingBag, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApp, useVisibleProducts, useVisibleSales } from "@/lib/store";
import { brl, STORE_LABEL } from "@/lib/types";
import adminGestor from "@/assets/icons/admin-gestor.png";
import deliveryMoto from "@/assets/icons/delivery-moto.png";
import adminEscudo from "@/assets/icons/admin-escudo.png";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard — Brechó A Semente" },
      {
        name: "description",
        content: "Resumo de vendas, lucro e estoque das unidades Retiro e São Miguel Arcanjo.",
      },
      { property: "og:title", content: "Dashboard — Brechó A Semente" },
      { property: "og:description", content: "Indicadores de vendas e lucro do brechó." },
    ],
  }),
  component: DashboardPage,
});

type Period = "hoje" | "7d" | "mes" | "custom";

function startOf(period: Period, customFrom: string) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === "hoje") return d;
  if (period === "7d") {
    d.setDate(d.getDate() - 6);
    return d;
  }
  if (period === "mes") return new Date(d.getFullYear(), d.getMonth(), 1);
  return customFrom ? new Date(`${customFrom}T00:00:00`) : new Date(0);
}

const dayLabel = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

function DashboardPage() {
  const { isAdmin, categories, currentUser } = useApp();
  const sales = useVisibleSales();
  const products = useVisibleProducts();
  const [period, setPeriod] = useState<Period>("mes");
  const [store, setStore] = useState<"todas" | "retiro" | "sao_miguel">("todas");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    const start = startOf(period, from);
    const end = period === "custom" && to ? new Date(`${to}T23:59:59`) : new Date();
    return sales.filter((s) => {
      const d = new Date(s.created_at);
      if (d < start || d > end) return false;
      if (store !== "todas" && s.store_location !== store) return false;
      return true;
    });
  }, [sales, period, store, from, to]);

  const today = new Date().toDateString();
  const salesToday = sales.filter((s) => new Date(s.created_at).toDateString() === today);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthSales = sales.filter((s) => new Date(s.created_at) >= monthStart);

  const stockValue = products.reduce((acc, p) => acc + p.sell_price * p.stock_qty, 0);
  const stockUnits = products.reduce((acc, p) => acc + p.stock_qty, 0);
  const monthProfit = monthSales.reduce((acc, s) => acc + (s.total_profit ?? 0), 0);
  const monthItems = monthSales.reduce(
    (acc, s) => acc + s.items.reduce((a, i) => a + i.quantity, 0),
    0,
  );

  const last7 = useMemo(() => {
    const days: Array<{ dia: string; Retiro: number; "S. M. Arcanjo": number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const daySales = sales.filter((s) => new Date(s.created_at).toDateString() === key);
      days.push({
        dia: dayLabel(d),
        Retiro: daySales
          .filter((s) => s.store_location === "retiro")
          .reduce((a, s) => a + s.total_amount, 0),
        "S. M. Arcanjo": daySales
          .filter((s) => s.store_location === "sao_miguel")
          .reduce((a, s) => a + s.total_amount, 0),
      });
    }
    return days;
  }, [sales]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((s) =>
      s.items.forEach((item) => {
        const product = products.find((p) => p.id === item.product_id);
        const cat = categories.find((c) => c.id === product?.category_id)?.name ?? "Outros";
        map.set(cat, (map.get(cat) ?? 0) + item.subtotal);
      }),
    );
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [filtered, products, categories]);

  const last30 = useMemo(() => {
    const days: Array<{ dia: string; total: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      days.push({
        dia: dayLabel(d),
        total: sales
          .filter((s) => new Date(s.created_at).toDateString() === key)
          .reduce((a, s) => a + s.total_amount, 0),
      });
    }
    return days;
  }, [sales]);

  const pieColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  const cards = [
    {
      label: "Vendas do dia",
      value: brl(salesToday.reduce((a, s) => a + s.total_amount, 0)),
      hint: `${salesToday.length} venda(s) hoje`,
      icon: DollarSign,
      accent: "bg-gold/10 text-gold",
    },
    ...(isAdmin
      ? [
          {
            label: "Lucro líquido do mês",
            value: brl(monthProfit),
            hint: "Venda menos custo das peças",
            icon: TrendingUp,
            accent: "bg-success/10 text-success",
          },
        ]
      : []),
    {
      label: "Total em estoque",
      value: brl(stockValue),
      hint: `${stockUnits} peças disponíveis`,
      icon: Boxes,
      accent: "bg-primary/10 text-primary",
    },
    {
      label: "Produtos vendidos no mês",
      value: String(monthItems),
      hint: `${monthSales.length} vendas no mês`,
      icon: PackageCheck,
      accent: "bg-secondary/10 text-secondary",
    },
  ];

  return (
    <AppShell
      title={`Olá, ${currentUser?.name.split(" ")[0]}!`}
      subtitle="Panorama das unidades Retiro e São Miguel Arcanjo."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-[150px] bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="mes">Este mês</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          {period === "custom" && (
            <>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-[150px] bg-card"
              />
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-[150px] bg-card"
              />
            </>
          )}
          <Select value={store} onValueChange={(v) => setStore(v as typeof store)}>
            <SelectTrigger className="w-[160px] bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as unidades</SelectItem>
              <SelectItem value="retiro">Retiro</SelectItem>
              <SelectItem value="sao_miguel">S. M. Arcanjo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      {/* Bento metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="shadow-soft transition-shadow hover:shadow-card">
            <CardContent className="flex items-start justify-between gap-3 py-5">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-1 font-display text-2xl font-semibold">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
              </div>
              <div
                className={`flex size-10 items-center justify-center rounded-xl ${card.accent}`}
              >
                <card.icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-secondary">Áreas da empresa</p>
            <h2 className="mt-1 font-display text-xl font-semibold">Escolha onde deseja trabalhar</h2>
          </div>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link to="/loja" target="_blank">Ver loja do cliente <ArrowRight /></Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="group relative overflow-hidden border-primary/20 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
            <img src={adminGestor} alt="" className="absolute -bottom-7 -right-4 size-36 object-contain opacity-15 transition group-hover:opacity-25" />
            <CardContent className="relative flex min-h-44 flex-col items-start py-5">
              <Badge variant="outline">Operação presencial</Badge>
              <h3 className="mt-4 font-display text-xl font-bold">Gestão da loja física</h3>
              <p className="mt-1 max-w-64 text-sm text-muted-foreground">Vendas de balcão, estoque e desempenho de cada unidade.</p>
              <Button asChild className="mt-auto"><Link to="/loja-fisica">Acessar loja física <ArrowRight /></Link></Button>
            </CardContent>
          </Card>
          <Card className="group relative overflow-hidden border-secondary/30 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
            <img src={deliveryMoto} alt="" className="absolute -bottom-5 -right-3 size-36 object-contain opacity-20 transition group-hover:opacity-30" />
            <CardContent className="relative flex min-h-44 flex-col items-start py-5">
              <Badge variant="secondary">Pedidos e entregas</Badge>
              <h3 className="mt-4 font-display text-xl font-bold">Gestão do delivery</h3>
              <p className="mt-1 max-w-64 text-sm text-muted-foreground">Acompanhe pedidos do recebimento até a entrega concluída.</p>
              <Button asChild className="mt-auto"><Link to="/delivery">Acessar delivery <ArrowRight /></Link></Button>
            </CardContent>
          </Card>
          <Card className="group relative overflow-hidden border-gold/30 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
            <img src={adminEscudo} alt="" className="absolute -bottom-7 -right-4 size-36 object-contain opacity-15 transition group-hover:opacity-25" />
            <CardContent className="relative flex min-h-44 flex-col items-start py-5">
              <Badge className="bg-gold text-gold-foreground">Catálogo e estoque</Badge>
              <h3 className="mt-4 font-display text-xl font-bold">Produtos e classes</h3>
              <p className="mt-1 max-w-64 text-sm text-muted-foreground">Cadastre peças, organize categorias e controle disponibilidades.</p>
              <Button asChild className="mt-auto"><Link to="/produtos"><ShoppingBag />Gerenciar produtos</Link></Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bento charts row */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-base">
              Vendas por unidade — últimos 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="dia" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => brl(v)} />
                <Legend />
                <Bar dataKey="Retiro" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="S. M. Arcanjo" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-base">Vendas por categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => brl(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bento trend + recent sales */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-base">Evolução — 30 dias</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last30}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="dia" fontSize={11} tickLine={false} axisLine={false} interval={3} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => brl(v)} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--chart-2)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-base">Últimas 10 vendas</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  {isAdmin && <TableHead className="text-right">Lucro</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 10).map((s) => {
                  const d = new Date(s.created_at);
                  return (
                    <TableRow key={s.id}>
                      <TableCell>{d.toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell className="font-medium">{s.user_name}</TableCell>
                      <TableCell>{STORE_LABEL[s.store_location]}</TableCell>
                      <TableCell>
                        <Badge variant={s.sale_type === "delivery" ? "secondary" : "outline"}>
                          {s.sale_type === "delivery" ? "Delivery" : "Balcão"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {brl(s.total_amount)}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right text-success">
                          {brl(s.total_profit ?? 0)}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {!filtered.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      Nenhuma venda no período selecionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
