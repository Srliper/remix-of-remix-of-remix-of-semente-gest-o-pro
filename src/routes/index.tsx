import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf, Lock, Mail, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — Brechó A Semente" },
      {
        name: "description",
        content:
          "Acesse o sistema de gestão do Brechó A Semente: estoque, PDV, delivery e relatórios das unidades Retiro e São Miguel Arcanjo.",
      },
      { property: "og:title", content: "Entrar — Brechó A Semente" },
      {
        property: "og:description",
        content: "Painel de gestão de produtos, vendas e delivery do Brechó A Semente.",
      },
    ],
  }),
  component: LoginPage,
});

const DEMO = [
  { email: "admin@asemente.com", label: "Administradora — admin@asemente.com" },
  { email: "retiro@asemente.com", label: "Retiro — retiro@asemente.com" },
  { email: "saomiguel@asemente.com", label: "São Miguel — saomiguel@asemente.com" },
];

function LoginPage() {
  const { login, signUp, currentUser } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) navigate({ to: "/dashboard" });
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const created = await signUp(name, email, password);
        if (!created.ok) {
          setError(created.error ?? "Não foi possível criar a conta.");
          toast.error(created.error ?? "Não foi possível criar a conta.");
          return;
        }
        toast.success("Conta criada! Bem-vinda ao Brechó A Semente.");
        navigate({ to: "/dashboard" });
        return;
      }
      const result = await login(email, password);
      if (!result.ok) {
        setError(result.error ?? "Não foi possível entrar.");
        toast.error(result.error ?? "Não foi possível entrar.");
        return;
      }
      toast.success("Bem-vinda de volta ao Brechó A Semente!");
      navigate({ to: "/dashboard" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gold text-gold-foreground">
            <Sprout className="size-6" />
          </div>
          <span className="font-display text-xl font-semibold">Brechó A Semente</span>
        </div>
        <div className="max-w-md">
          <h2 className="font-display text-4xl leading-tight font-semibold">
            Moda circular, gestão simples.
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Controle o estoque, registre vendas de balcão e delivery e acompanhe o lucro das
            unidades Retiro e São Miguel Arcanjo em um só lugar.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
          <Leaf className="size-4" />
          Cada peça ganha uma nova história.
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Sprout className="size-5" />
            </div>
            <span className="font-display text-lg font-semibold">Brechó A Semente</span>
          </div>

          <h1 className="font-display text-2xl font-semibold">
            {mode === "login" ? "Entrar no sistema" : "Criar conta da equipe"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Use suas credenciais para acessar o painel."
              : "A primeira conta criada vira a administradora."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">

              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" size="lg">
              Entrar
            </Button>
          </form>

          <Card className="mt-6 border-dashed shadow-none">
            <CardContent className="space-y-2 py-4">
              <p className="text-xs font-medium text-muted-foreground">
                Contas de demonstração (senha: 123456)
              </p>
              {DEMO.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => {
                    setEmail(d.email);
                    setPassword("123456");
                  }}
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
                >
                  {d.label}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
