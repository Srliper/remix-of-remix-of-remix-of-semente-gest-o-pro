import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, ImageIcon, Pencil, Plus, Search, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useApp, useVisibleProducts } from "@/lib/store";
import { brl, STATUS_LABEL, STORE_LABEL, type Product, type ProductStatus } from "@/lib/types";

export const Route = createFileRoute("/produtos")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Estoque e Produtos — Brechó A Semente" },
      {
        name: "description",
        content: "Cadastre peças, controle o estoque e acompanhe a margem de cada produto.",
      },
      { property: "og:title", content: "Estoque e Produtos — Brechó A Semente" },
      { property: "og:description", content: "Controle de estoque das duas unidades." },
    ],
  }),
  component: ProdutosPage,
});

type FormState = {
  name: string;
  description: string;
  category_id: string;
  store_location: "retiro" | "sao_miguel";
  cost_price: string;
  sell_price: string;
  stock_qty: string;
  status: ProductStatus;
  image_url: string;
};

const emptyForm = (store: "retiro" | "sao_miguel", categoryId: string): FormState => ({
  name: "",
  description: "",
  category_id: categoryId,
  store_location: store,
  cost_price: "",
  sell_price: "",
  stock_qty: "1",
  status: "disponivel",
  image_url: "",
});

function ProdutosPage() {
  const { categories, isAdmin, addProduct, updateProduct, removeProduct, allowedStores } =
    useApp();
  const products = useVisibleProducts();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");
  const [store, setStore] = useState("todas");
  const [status, setStatus] = useState("todos");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const defaultStore = allowedStores[0] ?? "retiro";
  const [form, setForm] = useState<FormState>(emptyForm(defaultStore, categories[0]?.id ?? ""));

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (category !== "todas" && p.category_id !== category) return false;
        if (store !== "todas" && p.store_location !== store) return false;
        if (status !== "todos" && p.status !== status) return false;
        return true;
      }),
    [products, search, category, store, status],
  );

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm(defaultStore, categories[0]?.id ?? ""));
    setOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      category_id: product.category_id ?? "",
      store_location: product.store_location,
      cost_price: product.cost_price === null ? "" : String(product.cost_price),
      sell_price: String(product.sell_price),
      stock_qty: String(product.stock_qty),
      status: product.status,
      image_url: product.image_url ?? "",
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      category_id: form.category_id || null,
      store_location: form.store_location,
      cost_price: isAdmin ? Number(form.cost_price || 0) : null,
      sell_price: Number(form.sell_price || 0),
      stock_qty: Number(form.stock_qty || 0),
      status: form.status,
      image_url: form.image_url || null,
    };
    try {
      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success("Produto atualizado.");
      } else {
        await addProduct(payload);
        toast.success("Produto cadastrado no estoque.");
      }
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar o produto.");
    }
  };

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  return (
    <AppShell
      title="Estoque e Produtos"
      subtitle={`${filtered.length} peça(s) encontradas`}
      actions={
        <Button onClick={openNew}>
          <Plus className="size-4" /> Novo produto
        </Button>
      }
    >
      <Card className="mb-5 shadow-soft">
        <CardContent className="grid gap-3 py-4 md:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={store} onValueChange={setStore}>
            <SelectTrigger>
              <SelectValue placeholder="Unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as unidades</SelectItem>
              <SelectItem value="retiro">Retiro</SelectItem>
              <SelectItem value="sao_miguel">S. M. Arcanjo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="disponivel">Disponível</SelectItem>
              <SelectItem value="vendido">Vendido</SelectItem>
              <SelectItem value="reservado">Reservado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => {
          const margin = p.sell_price - (p.cost_price ?? 0);
          const marginPct = p.sell_price ? Math.round((margin / p.sell_price) * 100) : 0;
          return (
            <Card key={p.id} className="overflow-hidden shadow-soft transition hover:shadow-card">
              <div className="flex h-32 items-center justify-center bg-accent text-accent-foreground">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="size-8 opacity-50" />
                )}
              </div>
              <CardContent className="space-y-3 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <Tag className="mr-1 inline size-3" />
                      {categoryName(p.category_id ?? "")} · {STORE_LABEL[p.store_location]}
                    </p>
                  </div>
                  <Badge
                    variant={
                      p.status === "disponivel"
                        ? "default"
                        : p.status === "reservado"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {STATUS_LABEL[p.status]}
                  </Badge>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-display text-xl font-semibold">{brl(p.sell_price)}</p>
                    {isAdmin && (
                      <p className="text-xs text-muted-foreground">
                        Custo {brl(p.cost_price ?? 0)} · Margem{" "}
                        <span className="font-medium text-success">
                          {brl(margin)} ({marginPct}%)
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{p.stock_qty} un.</p>
                    {p.stock_qty > 0 && p.stock_qty < 3 && (
                      <Badge className="mt-1 bg-gold text-gold-foreground">
                        <AlertTriangle className="size-3" /> Estoque baixo
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(p)}>
                    <Pencil className="size-3.5" /> Editar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      updateProduct(p.id, { status: "vendido", stock_qty: 0 });
                      toast.success("Produto marcado como vendido.");
                    }}
                  >
                    Vendido
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Excluir"
                    onClick={() => {
                      removeProduct(p.id);
                      toast.success("Produto removido.");
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!filtered.length && (
          <p className="text-muted-foreground">Nenhum produto encontrado com esses filtros.</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar produto" : "Novo produto"}</DialogTitle>
            <DialogDescription>
              Preencha os dados da peça. Campos de custo são visíveis apenas para a administradora.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do produto</Label>
              <Input
                id="name"
                required
                value={form.name}
                placeholder="Ex.: Camiseta Masculina Adulta"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descrição (opcional)</Label>
              <Textarea
                id="desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(v) => setForm({ ...form, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c.is_active)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select
                  value={form.store_location}
                  onValueChange={(v) =>
                    setForm({ ...form, store_location: v as "retiro" | "sao_miguel" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedStores.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STORE_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="cost">Preço de custo (R$)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={form.cost_price}
                    onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="sell">Preço de venda (R$)</Label>
                <Input
                  id="sell"
                  type="number"
                  step="0.01"
                  required
                  value={form.sell_price}
                  onChange={(e) => setForm({ ...form, sell_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qty">Quantidade em estoque</Label>
                <Input
                  id="qty"
                  type="number"
                  required
                  value={form.stock_qty}
                  onChange={(e) => setForm({ ...form, stock_qty: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as ProductStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="reservado">Reservado</SelectItem>
                    <SelectItem value="vendido">Vendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="img">Imagem (URL, opcional)</Label>
              <Input
                id="img"
                value={form.image_url}
                placeholder="https://..."
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editing ? "Salvar alterações" : "Cadastrar produto"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
