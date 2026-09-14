import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useApp, useVisibleProducts, useVisibleSales } from "@/lib/store";
import { brl, STORE_LABEL } from "@/lib/types";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const products = useVisibleProducts();
  const sales = useVisibleSales();
  const { isAdmin, users } = useApp();

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar produtos, vendas ou pessoas..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Produtos">
          {products.slice(0, 20).map((p) => (
            <CommandItem key={p.id} value={p.name} onSelect={() => go("/produtos")}>
              <span>{p.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {brl(p.sell_price)} · {STORE_LABEL[p.store_location]}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Vendas recentes">
          {sales.slice(0, 8).map((s) => (
            <CommandItem
              key={s.id}
              value={`${s.id} ${s.user_name} ${s.customer_name ?? ""}`}
              onSelect={() => go("/relatorios")}
            >
              <span>
                #{s.id.slice(-4)} · {s.user_name}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">{brl(s.total_amount)}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        {isAdmin && (
          <CommandGroup heading="Equipe">
            {users.map((u) => (
              <CommandItem key={u.id} value={u.name} onSelect={() => go("/equipe")}>
                <span>{u.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{u.email}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
