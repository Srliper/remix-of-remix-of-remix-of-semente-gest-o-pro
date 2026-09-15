import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, MapPin, Minus, Plus, Search, ShoppingBag, Sprout, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useApp, useVisibleProducts } from "@/lib/store";
import { brl, PAYMENT_LABEL, STORE_LABEL, type PaymentMethod, type Product, type Store } from "@/lib/types";
import feminino from "@/assets/categories/roupas-femininas.jpg";
import masculino from "@/assets/categories/roupas-masculinas.jpg";
import infantil from "@/assets/categories/roupas-infantis.jpg";
import calcados from "@/assets/categories/calcados.jpg";
import acessorios from "@/assets/categories/acessorios.jpg";
import casa from "@/assets/categories/casa-decoracao.jpg";

export const Route = createFileRoute("/loja")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Comprar por Delivery — Brechó A Semente" },
      { name: "description", content: "Escolha peças sustentáveis e receba por delivery nas unidades Retiro e São Miguel Arcanjo." },
      { property: "og:title", content: "Comprar por Delivery — Brechó A Semente" },
      { property: "og:description", content: "Moda sustentável escolhida por categoria e entregue até você." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StorefrontPage,
});

const CATEGORY_CHOICES = [
  { key: "femin", label: "Feminino", image: feminino },
  { key: "mascul", label: "Masculino", image: masculino },
  { key: "infant", label: "Infantil", image: infantil },
  { key: "calç", label: "Calçados", image: calcados },
  { key: "acess", label: "Acessórios", image: acessorios },
  { key: "casa", label: "Casa & decoração", image: casa },
];

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const imageForCategory = (name: string) => CATEGORY_CHOICES.find((choice) => normalize(name).includes(normalize(choice.key)))?.image ?? acessorios;

type Cart = Record<string, number>;

function StorefrontPage() {
  const { categories, createSale, currentUser, loading } = useApp();
  const products = useVisibleProducts();
  const [category, setCategory] = useState("todas");
  const [store, setStore] = useState<"todas" | Store>("todas");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "", notes: "", payment: "pix" as PaymentMethod });

  const visible = useMemo(() => products.filter((product) => {
    if (product.status !== "disponivel" || product.stock_qty < 1) return false;
    if (store !== "todas" && product.store_location !== store) return false;
    if (category !== "todas" && product.category_id !== category) return false;
    return !search || normalize(product.name).includes(normalize(search));
  }), [products, store, category, search]);

  const lines = Object.entries(cart).flatMap(([id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return product ? [{ product, quantity }] : [];
  });
  const totalItems = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.product.sell_price * line.quantity, 0);
  const cartStore = lines[0]?.product.store_location;

  const categoryIdForChoice = (key: string) => categories.find((item) => normalize(item.name).includes(normalize(key)))?.id;
  const setQuantity = (product: Product, next: number) => {
    if (cartStore && cartStore !== product.store_location) {
      toast.error("Finalize ou esvazie a sacola antes de escolher outra unidade.");
      return;
    }
    setCart((current) => {
      const updated = { ...current };
      if (next <= 0) delete updated[product.id];
      else updated[product.id] = Math.min(next, product.stock_qty);
      return updated;
    });
  };

  const finishOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!cartStore || !lines.length) return;
    if (!currentUser) {
      toast.error("Entre no sistema para confirmar o pedido. Sua sacola continuará montada.");
      return;
    }
    setBusy(true);
    try {
      await createSale({
        store: cartStore,
        sale_type: "delivery",
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        payment_method: customer.payment,
        discount: 0,
        notes: customer.notes,
        items: lines.map(({ product, quantity }) => ({ product_id: product.id, quantity })),
      });
      setCart({});
      setCheckoutOpen(false);
      setCartOpen(false);
      toast.success("Pedido enviado! A loja já pode iniciar o preparo.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar o pedido.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Sprout className="size-5" /></span>
            <span className="min-w-0"><span className="block truncate font-display font-bold">Brechó A Semente</span><span className="block text-xs text-muted-foreground">Escolha consciente, entrega com carinho</span></span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex"><Link to="/"><ChevronLeft />Área da equipe</Link></Button>
            <Button onClick={() => setCartOpen(true)}><ShoppingBag />Sacola <Badge className="bg-primary-foreground text-primary">{totalItems}</Badge></Button>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b bg-primary text-primary-foreground">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-14">
            <div>
              <Badge className="mb-4 bg-gold text-gold-foreground"><Truck className="size-3.5" /> Delivery das duas unidades</Badge>
              <h1 className="max-w-2xl font-display text-3xl font-bold leading-tight sm:text-5xl">Peças únicas para uma nova história.</h1>
              <p className="mt-4 max-w-xl text-primary-foreground/80">Escolha sua categoria, monte a sacola e receba sua seleção onde estiver.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="border-l border-primary-foreground/30 pl-4"><strong className="block font-display text-2xl">2</strong>unidades para escolher</div>
              <div className="border-l border-primary-foreground/30 pl-4"><strong className="block font-display text-2xl">{products.filter((p) => p.status === "disponivel").length}</strong>peças disponíveis</div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase text-secondary">Comece por aqui</p><h2 className="mt-1 font-display text-2xl font-bold">O que você procura?</h2></div><Button variant="ghost" onClick={() => setCategory("todas")}>Ver tudo</Button></div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {CATEGORY_CHOICES.map((choice) => {
              const id = categoryIdForChoice(choice.key);
              const selected = id ? category === id : false;
              return <button key={choice.label} type="button" onClick={() => setCategory(id ?? "todas")} className={`group relative aspect-[4/3] overflow-hidden rounded-md border text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-card ${selected ? "ring-2 ring-secondary ring-offset-2" : ""}`}>
                <img src={choice.image} alt={choice.label} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-x-0 bottom-0 bg-foreground/75 px-3 py-2 text-sm font-semibold text-background">{choice.label}</span>
              </button>;
            })}
          </div>
        </section>

        <section className="border-y bg-card/50">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6 md:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar uma peça..." className="bg-background pl-9" /></div>
            <Select value={store} onValueChange={(value) => setStore(value as typeof store)}><SelectTrigger className="bg-background md:w-56"><MapPin className="size-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todas">Todas as unidades</SelectItem><SelectItem value="retiro">Retiro</SelectItem><SelectItem value="sao_miguel">S. M. Arcanjo</SelectItem></SelectContent></Select>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-2xl font-bold">Peças disponíveis</h2><span className="text-sm text-muted-foreground">{visible.length} resultado(s)</span></div>
          {loading ? <p className="py-16 text-center text-muted-foreground">Preparando a vitrine...</p> : visible.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((product) => {
              const categoryName = categories.find((item) => item.id === product.category_id)?.name ?? "Acessórios";
              return <Card key={product.id} className="overflow-hidden shadow-soft transition hover:shadow-card">
                <div className="aspect-[4/3] overflow-hidden bg-accent"><img src={product.image_url || imageForCategory(categoryName)} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-500 hover:scale-105" /></div>
                <CardContent className="space-y-3 py-4"><div><Badge variant="outline">{categoryName}</Badge><h3 className="mt-2 line-clamp-1 font-display text-lg font-bold">{product.name}</h3><p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">{product.description || `Peça disponível na unidade ${STORE_LABEL[product.store_location]}.`}</p></div><div className="flex items-end justify-between"><div><p className="font-display text-xl font-bold text-secondary">{brl(product.sell_price)}</p><p className="text-xs text-muted-foreground">{STORE_LABEL[product.store_location]} · {product.stock_qty} un.</p></div><Button size="icon" aria-label={`Adicionar ${product.name}`} onClick={() => setQuantity(product, (cart[product.id] ?? 0) + 1)}><Plus /></Button></div></CardContent>
              </Card>;
            })}
          </div> : <div className="border-y py-16 text-center"><ShoppingBag className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 font-medium">Nenhuma peça encontrada.</p><Button variant="link" onClick={() => { setCategory("todas"); setSearch(""); setStore("todas"); }}>Limpar escolhas</Button></div>}
        </section>
      </main>

      <Sheet open={cartOpen} onOpenChange={setCartOpen}><SheetContent className="flex w-full flex-col sm:max-w-md"><SheetHeader><SheetTitle className="font-display">Sua sacola</SheetTitle><SheetDescription>{totalItems ? `${totalItems} peça(s) selecionada(s)` : "Sua sacola está vazia."}</SheetDescription></SheetHeader><div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">{lines.map(({ product, quantity }) => <div key={product.id} className="flex gap-3 border-b pb-4"><img src={product.image_url || imageForCategory(categories.find((item) => item.id === product.category_id)?.name ?? "")} alt="" className="size-20 rounded-md object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-medium">{product.name}</p><p className="text-sm text-secondary">{brl(product.sell_price)}</p><div className="mt-2 flex items-center gap-2"><Button size="icon" variant="outline" className="size-7" onClick={() => setQuantity(product, quantity - 1)}><Minus /></Button><span className="w-5 text-center text-sm">{quantity}</span><Button size="icon" variant="outline" className="size-7" onClick={() => setQuantity(product, quantity + 1)}><Plus /></Button><Button size="icon" variant="ghost" className="ml-auto size-7" aria-label="Remover" onClick={() => setQuantity(product, 0)}><Trash2 className="text-destructive" /></Button></div></div></div>)}</div>{lines.length > 0 && <div className="border-t pt-4"><div className="mb-4 flex items-center justify-between"><span>Total</span><strong className="font-display text-2xl">{brl(total)}</strong></div><Button className="w-full" size="lg" onClick={() => setCheckoutOpen(true)}><Truck />Continuar pedido</Button></div>}</SheetContent></Sheet>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle className="font-display">Dados para entrega</DialogTitle><DialogDescription>Pedido preparado pela unidade {cartStore ? STORE_LABEL[cartStore] : "selecionada"}.</DialogDescription></DialogHeader><form onSubmit={finishOrder} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="customer-name">Nome</Label><Input id="customer-name" required value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="customer-phone">Telefone</Label><Input id="customer-phone" required value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} /></div></div><div className="space-y-2"><Label htmlFor="customer-address">Endereço completo</Label><Textarea id="customer-address" required value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} /></div><div className="space-y-2"><Label>Pagamento</Label><Select value={customer.payment} onValueChange={(value) => setCustomer({ ...customer, payment: value as PaymentMethod })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PAYMENT_LABEL).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="customer-notes">Observações</Label><Textarea id="customer-notes" value={customer.notes} onChange={(event) => setCustomer({ ...customer, notes: event.target.value })} placeholder="Referência, complemento ou preferência..." /></div>{!currentUser && <p className="rounded-md bg-accent p-3 text-sm text-accent-foreground">Para confirmar com segurança, entre usando uma conta da equipe.</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => setCheckoutOpen(false)}>Voltar</Button><Button type="submit" disabled={busy}>{busy ? "Enviando..." : "Confirmar pedido"}</Button></DialogFooter></form></DialogContent></Dialog>
    </div>
  );
}
