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
    <div className="relative grid min-h-screen w-full overflow-hidden lg:grid-cols-2">
      {/* Left panel — brand & nature/seed evolution background */}
      <div
        className="relative hidden flex-col items-center justify-center px-12 py-16 text-primary-foreground lg:flex"
        style={{
          background:
            "radial-gradient(ellipse 140% 120% at 20% 10%, color-mix(in oklab, var(--growth) 70%, transparent), color-mix(in oklab, var(--growth-deep) 92%, transparent) 55%, color-mix(in oklab, var(--growth-deep) 100%, transparent))",
        }}
      >
        {/* Organic seed / growth rings */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='%23D4AF37' stroke-width='0.6' opacity='0.5'%3E%3Cellipse cx='50' cy='50' rx='8' ry='6'/%3E%3Cellipse cx='50' cy='50' rx='20' ry='14'/%3E%3Cellipse cx='50' cy='50' rx='34' ry='24'/%3E%3Cellipse cx='50' cy='50' rx='48' ry='34'/%3E%3Cpath d='M50 50 Q65 35 80 50'/%3E%3Cpath d='M50 50 Q35 65 20 50'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "140px 140px",
          }}
        />
        {/* Soft glowing orbs suggesting germination */}
        <div
          className="pointer-events-none absolute -top-20 -left-20 size-[28rem] rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--gold) 70%, transparent) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-12 right-12 size-[22rem] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--seed) 60%, transparent) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 flex max-w-md flex-col items-center text-center">
          <div
            className="mb-8 flex size-24 items-center justify-center rounded-full border-2 border-gold/30 bg-gold/10 backdrop-blur-sm"
          >
            <Sprout className="size-12 text-gold" />
          </div>
          <h1 className="font-display text-5xl leading-[1.1] font-bold">
            Brechó <br /> A Semente
          </h1>
          <div
            className="mx-auto mt-6 h-1 w-14 rounded-full"
            style={{ background: "var(--gold)" }}
          />
          <p className="mt-6 text-lg font-light leading-relaxed text-primary-foreground/85">
            Gestão inteligente para moda sustentável. Cultivando o futuro do consumo consciente.
          </p>
        </div>

        <div className="absolute bottom-8 left-8 flex items-center gap-2 text-sm text-primary-foreground/60">
          <Leaf className="size-4" />
          Cada peça ganha uma nova história.
        </div>
      </div>

      {/* Right panel — form & light organic background */}
      <div
        className="relative flex items-center justify-center px-6 py-12 sm:px-10 md:px-16"
        style={{
          background:
            "radial-gradient(circle at 90% 10%, color-mix(in oklab, var(--gold) 14%, transparent) 0%, transparent 40%), radial-gradient(circle at 10% 90%, color-mix(in oklab, var(--seed) 10%, transparent) 0%, transparent 45%), var(--background)",
        }}
      >
        {/* Subtle botanical silhouette overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%235B7C5B' stroke-width='0.8' opacity='0.6'%3E%3Cpath d='M60 110 C60 80 40 70 40 50 C40 35 50 25 60 20 C70 25 80 35 80 50 C80 70 60 80 60 110Z'/%3E%3Cpath d='M60 50 C45 40 30 45 25 55 M60 55 C75 45 90 50 95 60'/%3E%3Ccircle cx='60' cy='35' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "160px 160px",
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sprout className="size-6" />
            </div>
            <span className="font-display text-xl font-semibold">Brechó A Semente</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground">
              {mode === "login" ? "Boas-vindas" : "Criar conta"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login"
                ? "Acesse sua conta para gerenciar as lojas."
                : "A primeira conta criada vira a administradora."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-card/60"
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
                  className="bg-card/60 pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button
                  type="button"
                  className="text-xs text-secondary hover:underline underline-offset-4"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="bg-card/60 pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="size-4 rounded border-border text-secondary focus:ring-secondary"
              />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                Lembrar deste dispositivo
              </Label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              size="lg"
              disabled={busy}
            >
              {busy ? "Entrando..." : mode === "login" ? "Entrar no sistema" : "Criar conta"}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>
              {mode === "login" ? "Ainda não tem conta?" : "Já tem conta?"}
            </span>
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-medium text-secondary hover:underline underline-offset-4"
            >
              {mode === "login" ? "Criar conta" : "Fazer login"}
            </button>
          </div>

          <Card className="mt-8 border-dashed bg-card/60 shadow-none backdrop-blur-sm">
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

          <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-6 text-xs text-muted-foreground uppercase tracking-widest">
            <span>Unidade Retiro</span>
            <span className="size-1 rounded-full bg-muted-foreground/40" />
            <span>S. M. Arcanjo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
