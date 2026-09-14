import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type {
  Category,
  CompanySettings,
  OrderStatus,
  PaymentMethod,
  Product,
  Profile,
  Sale,
  SaleItem,
  SaleType,
  Store,
  StoreLocation,
} from "./types";

export interface CartLine {
  product_id: string;
  quantity: number;
}

export interface SalePayload {
  store: Store;
  sale_type: SaleType;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  discount: number;
  payment_method: PaymentMethod;
  notes?: string;
  items: CartLine[];
}

interface AppState {
  session: Session | null;
  currentUser: Profile | null;
  users: Profile[];
  categories: Category[];
  products: Product[];
  sales: Sale[];
  company: CompanySettings;
  isAdmin: boolean;
  loading: boolean;
  allowedStores: Store[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  addProduct: (product: ProductInput) => Promise<void>;
  updateProduct: (id: string, patch: Partial<ProductInput>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, patch: Partial<Category>) => Promise<void>;
  updateCompany: (patch: Partial<CompanySettings>) => Promise<void>;
  createSale: (payload: SalePayload) => Promise<string>;
  setOrderStatus: (saleId: string, status: OrderStatus) => Promise<void>;
}

export interface ProductInput {
  name: string;
  description: string;
  category_id: string | null;
  store_location: Store;
  cost_price: number | null;
  sell_price: number;
  stock_qty: number;
  status: Product["status"];
  image_url: string | null;
}

const emptyCompany: CompanySettings = { name: "Brechó A Semente", cnpj: "", address: "", phone: "" };

const AppContext = createContext<AppState | null>(null);

const num = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));
const numOrNull = (v: unknown) => (v === null || v === undefined ? null : Number(v));

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [company, setCompany] = useState<CompanySettings>(emptyCompany);
  const [loading, setLoading] = useState(true);
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) {
        loadedFor.current = null;
        setCurrentUser(null);
        setIsAdmin(false);
        setProducts([]);
        setSales([]);
        setUsers([]);
        setLoading(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadAll = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const [{ data: profile }, { data: roleRows }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);

      const admin = (roleRows ?? []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      setCurrentUser(
        profile
          ? ({
              ...profile,
              store_location: profile.store_location as StoreLocation,
              role: admin ? "admin" : "collaborator",
            } as Profile)
          : null,
      );

      const [cats, comp] = await Promise.all([
        supabase.from("categories").select("*").order("name"),
        supabase.from("company_settings").select("*").eq("id", 1).maybeSingle(),
      ]);
      setCategories((cats.data ?? []) as Category[]);
      if (comp.data) {
        setCompany({
          name: comp.data.name,
          cnpj: comp.data.cnpj,
          address: comp.data.address,
          phone: comp.data.phone,
        });
      }

      // Products — admins go through the admin routine that also returns cost.
      const prodRes = admin
        ? await supabase.rpc("admin_products")
        : await supabase.from("products").select("*").order("created_at", { ascending: false });
      setProducts(
        ((prodRes.data ?? []) as Array<Record<string, unknown>>).map((p) => ({
          id: p['id'] as string,
          name: p['name'] as string,
          description: (p['description'] as string) ?? "",
          category_id: (p['category_id'] as string | null) ?? null,
          store_location: p['store_location'] as Store,
          cost_price: admin ? num(p['cost_price']) : null,
          sell_price: num(p['sell_price']),
          stock_qty: Number(p['stock_qty'] ?? 0),
          status: p['status'] as Product["status"],
          image_url: (p['image_url'] as string | null) ?? null,
          created_at: p['created_at'] as string,
          updated_at: p['updated_at'] as string,
        })),
      );

      const salesRes = admin
        ? await supabase.rpc("admin_sales")
        : await supabase.from("sales").select("*").order("created_at", { ascending: false });
      const itemsRes = admin
        ? await supabase.rpc("admin_sale_items")
        : await supabase.from("sale_items").select("*");

      const itemRows = ((itemsRes.data ?? []) as Array<Record<string, unknown>>).map((i) => ({
        id: i['id'] as string,
        sale_id: i['sale_id'] as string,
        product_id: (i['product_id'] as string | null) ?? null,
        product_name: i['product_name'] as string,
        quantity: Number(i['quantity'] ?? 0),
        unit_sell_price: num(i['unit_sell_price']),
        unit_cost_price: admin ? num(i['unit_cost_price']) : null,
        subtotal: num(i['subtotal']),
      })) satisfies SaleItem[];

      const byS = new Map<string, SaleItem[]>();
      itemRows.forEach((i) => byS.set(i.sale_id, [...(byS.get(i.sale_id) ?? []), i]));

      setSales(
        ((salesRes.data ?? []) as Array<Record<string, unknown>>)
          .map((s) => ({
            id: s['id'] as string,
            user_id: (s['user_id'] as string | null) ?? null,
            user_name: (s['user_name'] as string) ?? "",
            store_location: s['store_location'] as Store,
            sale_type: s['sale_type'] as SaleType,
            customer_name: (s['customer_name'] as string | null) ?? null,
            customer_address: (s['customer_address'] as string | null) ?? null,
            customer_phone: (s['customer_phone'] as string | null) ?? null,
            subtotal: num(s['subtotal']),
            discount: num(s['discount']),
            total_amount: num(s['total_amount']),
            total_cost: admin ? num(s['total_cost']) : null,
            total_profit: admin ? numOrNull(s['total_profit']) : null,
            payment_method: s['payment_method'] as PaymentMethod,
            status: s['status'] as Sale["status"],
            source: ((s['source'] as string) ?? "interno") as Sale["source"],
            notes: (s['notes'] as string | null) ?? null,
            created_at: s['created_at'] as string,
            items: byS.get(s['id'] as string) ?? [],
          }))
          .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
      );

      if (admin) {
        const { data: allProfiles } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at");
        const { data: allRoles } = await supabase.from("user_roles").select("user_id, role");
        setUsers(
          ((allProfiles ?? []) as Array<Record<string, unknown>>).map((p) => ({
            id: p['id'] as string,
            name: p['name'] as string,
            email: p['email'] as string,
            store_location: p['store_location'] as StoreLocation,
            position: p['position'] as string,
            is_active: Boolean(p['is_active']),
            created_at: p['created_at'] as string,
            role: (allRoles ?? []).some((r) => r.user_id === p['id'] && r.role === "admin")
              ? "admin"
              : "collaborator",
          })),
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const uid = session?.user.id;
    if (!uid) return;
    if (loadedFor.current === uid) return;
    loadedFor.current = uid;
    void loadAll(uid);
  }, [session, loadAll]);

  const refresh = useCallback(async () => {
    const uid = session?.user.id;
    if (uid) await loadAll(uid);
  }, [session, loadAll]);

  const value = useMemo<AppState>(() => {
    const loc: StoreLocation = currentUser?.store_location ?? "ambas";
    const allowedStores: Store[] = loc === "ambas" ? ["retiro", "sao_miguel"] : [loc];

    return {
      session,
      currentUser,
      users,
      categories,
      products,
      sales,
      company,
      isAdmin,
      loading,
      allowedStores,

      login: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) return { ok: false, error: "E-mail ou senha incorretos." };
        return { ok: true };
      },

      signUp: async (name, email, password) => {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name } },
        });
        if (error) return { ok: false, error: error.message };
        const { error: bootErr } = await supabase.rpc("bootstrap_profile", {
          _name: name,
          _email: email.trim(),
        });
        if (bootErr) return { ok: false, error: bootErr.message };
        return { ok: true };
      },

      logout: async () => {
        await supabase.auth.signOut();
      },

      refresh,

      addProduct: async (product) => {
        const { error } = await supabase.from("products").insert({
          name: product.name,
          description: product.description,
          category_id: product.category_id,
          store_location: product.store_location,
          sell_price: product.sell_price,
          stock_qty: product.stock_qty,
          status: product.status,
          image_url: product.image_url,
          ...(product.cost_price !== null ? { cost_price: product.cost_price } : {}),
        });
        if (error) throw new Error(error.message);
        await refresh();
      },

      updateProduct: async (id, patch) => {
        const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
        for (const key of [
          "name",
          "description",
          "category_id",
          "store_location",
          "sell_price",
          "stock_qty",
          "status",
          "image_url",
        ] as const) {
          if (patch[key] !== undefined) update[key] = patch[key];
        }
        const { error } = await supabase
          .from("products")
          .update(update as never)
          .eq("id", id);
        if (error) throw new Error(error.message);
        const cost = patch.cost_price;
        if (isAdmin && cost !== null && cost !== undefined) {
          const { error: costErr } = await supabase.rpc("set_product_cost", {
            _product_id: id,
            _cost: cost,
          });
          if (costErr) throw new Error(costErr.message);
        }
        await refresh();
      },

      removeProduct: async (id) => {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw new Error(error.message);
        await refresh();
      },

      addCategory: async (name) => {
        const { error } = await supabase.from("categories").insert({ name, icon: "Tag" });
        if (error) throw new Error(error.message);
        await refresh();
      },

      updateCategory: async (id, patch) => {
        const { error } = await supabase.from("categories").update(patch).eq("id", id);
        if (error) throw new Error(error.message);
        await refresh();
      },

      updateCompany: async (patch) => {
        const { error } = await supabase
          .from("company_settings")
          .update(patch)
          .eq("id", 1);
        if (error) throw new Error(error.message);
        await refresh();
      },

      createSale: async (payload) => {
        const { data, error } = await supabase.rpc("create_sale", {
          _store: payload.store,
          _sale_type: payload.sale_type,
          _customer_name: payload.customer_name ?? "",
          _customer_address: payload.customer_address ?? "",
          _customer_phone: payload.customer_phone ?? "",
          _discount: payload.discount,
          _payment_method: payload.payment_method,
          _notes: payload.notes ?? "",
          _items: payload.items as unknown as never,
        });
        if (error) throw new Error(error.message);
        await refresh();
        return data as unknown as string;
      },

      setOrderStatus: async (saleId, status) => {
        const { error } = await supabase.rpc("set_order_status", {
          _sale_id: saleId,
          _status: status,
        });
        if (error) throw new Error(error.message);
        await refresh();
      },
    };
  }, [session, currentUser, users, categories, products, sales, company, isAdmin, loading, refresh]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}

/** Sales visible to the current user (already filtered by the database). */
export function useVisibleSales() {
  return useApp().sales;
}

export function useVisibleProducts() {
  return useApp().products;
}
