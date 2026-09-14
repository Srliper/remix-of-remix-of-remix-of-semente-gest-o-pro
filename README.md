# Semente Gestão Pro

Crie um aplicativo web completo de gestão de produtos, vendas e delivery para o negócio "Brechó A Semente". A proprietária e administradora mestra é Tatiane Bedim. O negócio possui duas unidades físicas: uma no bairro "Retiro" e outra em "São Miguel Arcanjo - Centro". O sistema deve controlar estoque, registrar vendas (balcão e delivery), gerenciar equipes e calcular lucros automaticamente.

STACK TECNOLÓGICA:
- Frontend: React, Tailwind CSS, Shadcn UI, Lucide React (ícones)
- Backend/Auth/DB: Preparar estrutura para integração com Supabase
- Design responsivo (desktop, tablet e mobile)

DESIGN E UI:
- Paleta de cores: Verde musgo (#5B7C5B) como primária, Terracota (#C87941) como secundária, Bege claro (#F5F1E8) e Branco (#FFFFFF) como neutros, Dourado suave (#D4AF37) para destaques
- Tipografia: Inter ou Poppins para títulos, Inter ou Roboto para corpo
- Layout com sidebar colapsável, cards com sombras suaves e bordas arredondadas
- Vibe de brechó moderno, acolhedor, sustentável e organizado

PERFIS DE USUÁRIO (RBAC):

1. ADMIN (Tatiane Bedim): Acesso total. Cria e gerencia contas de colaboradores, vê todos os dados financeiros, lucros, preços de custo, margens, e pode editar/configurar tudo.

2. COLABORADOR (Vendedor/Gerente de Loja): Acesso restrito. Pode cadastrar produtos (sem ver preço de custo), dar entrada/saída no estoque e registrar vendas. NÃO pode ver lucro total, custos dos produtos ou gerenciar outros usuários. O acesso é atrelado a uma loja específica (Retiro ou S.M. Arcanjo) ou a ambas.

MÓDULO 1 - DASHBOARD (Visão da Tatiane):
- Cards de resumo no topo: Vendas do Dia, Lucro Líquido do Mês (calculado: soma preços de venda - soma preços de custo dos itens vendidos), Total em Estoque, Produtos Vendidos no Mês
- Gráfico de barras comparando vendas das duas unidades (Retiro vs S.M. Arcanjo) nos últimos 7 dias
- Gráfico de pizza com distribuição de vendas por categoria
- Gráfico de linha com evolução de vendas nos últimos 30 dias
- Tabela das 10 últimas vendas (data, hora, vendedor, unidade, valor total)
- Filtros globais: período (Hoje, 7 dias, Mês, Personalizado) e unidade (Todas, Retiro, S.M. Arcanjo)

MÓDULO 2 - GESTÃO DE EQUIPE (Apenas Admin):
- Tela com tabela de colaboradores: Nome, Email, Unidade, Status (Ativo/Inativo), Ações
- Botão "Adicionar Colaborador"
- Formulário de cadastro: Nome completo, Email, Senha temporária, Unidade de trabalho (dropdown: Retiro, S.M. Arcanjo, Ambas), Cargo/Função, Status
- Ações: Editar, Ativar/Desativar, Resetar senha

MÓDULO 3 - GESTÃO DE ESTOQUE E PRODUTOS:
- Formulário de cadastro de produtos com campos: Nome do produto (ex: "Camiseta Masculina Adulta", "Brinquedo de Pelúcia"), Descrição (opcional), Categoria/Classe (dropdown: Roupas, Brinquedos, Calçados, Decoração, Eletrônicos), Unidade (Retiro ou S.M. Arcanjo), Preço de Custo (visível APENAS para Admin), Preço de Venda, Quantidade em estoque, Status (Disponível, Vendido, Reservado), Upload de imagem (opcional)
- Grid de produtos com cards mostrando imagem, nome, categoria, preço de venda, quantidade, unidade, status
- Admin vê também preço de custo e margem de lucro em cada card
- Filtros: busca por nome, categoria, unidade, status
- Ações: Editar, Excluir, Marcar como Vendido

MÓDULO 4 - PONTO DE VENDA (PDV):
- Interface estilo caixa registradora dividida em duas partes:
  * Lado esquerdo (60%): Campo de busca grande, grid de produtos disponíveis com cards clicáveis, filtros rápidos por categoria
  * Lado direito (40%): Carrinho de compras com lista de itens (nome, quantidade com botões +/-, preço unitário, subtotal, botão remover), seleção de tipo de venda (Balcão ou Delivery), campos de cliente/endereço/telefone quando Delivery, forma de pagamento (Dinheiro, Pix, Cartão Crédito, Cartão Débito), resumo com subtotal/desconto/total, botão grande "FINALIZAR VENDA"
- Ao finalizar: cria registro de venda, cria itens da venda, decrementa estoque automaticamente, limpa carrinho, mostra mensagem de sucesso

MÓDULO 5 - RELATÓRIOS E HISTÓRICO:
- Tabela de histórico de vendas: Data/Hora, Vendedor, Unidade, Tipo, Cliente, Valor Total, Lucro, Ações
- Colaborador vê apenas vendas próprias ou da sua unidade; Admin vê todas
- Filtros: período, unidade, vendedor, tipo, forma de pagamento
- Modal de detalhes da venda com lista de produtos e resumo financeiro
- Relatórios avançados (APENAS ADMIN): Lucro por período, por categoria, por unidade, por vendedor, produtos mais vendidos, estoque parado
- Botão "Exportar para CSV" em todos os relatórios

MÓDULO 6 - CONFIGURAÇÕES (Apenas Admin):
- Dados da empresa (nome, CNPJ, endereço, telefone)
- Gestão de categorias (adicionar, editar, desativar)

FUNCIONALIDADES ADICIONAIS:
- Badge de alerta quando estoque baixo (menos de 3 unidades)
- Barra de busca global no topo
- Modo escuro (toggle opcional)

ESTRUTURA DO BANCO DE DADOS (Supabase):

Tabela users: id (uuid), name (string), email (string unique), password_hash (string), role ('admin' ou 'collaborator'), store_location ('retiro', 'sao_miguel' ou 'ambas'), is_active (boolean), created_at (timestamp)

Tabela categories: id (uuid), name (string), icon (string), is_active (boolean)

Tabela products: id (uuid), name (string), description (text), category_id (fk), store_location, cost_price (decimal - só admin vê), sell_price (decimal), stock_qty (integer), status ('disponivel', 'vendido', 'reservado'), image_url (string), created_at, updated_at

Tabela sales: id (uuid), user_id (fk), store_location, sale_type ('balcao' ou 'delivery'), customer_name, customer_address, customer_phone, subtotal (decimal), discount (decimal), total_amount (decimal), total_cost (decimal), total_profit (decimal calculado: total_amount - total_cost), payment_method, status ('concluida' ou 'cancelada'), notes, created_at

Tabela sale_items: id (uuid), sale_id (fk), product_id (fk), quantity (integer), unit_sell_price (decimal), unit_cost_price (decimal), subtotal (decimal)

Configurar Row Level Security (RLS): Admin vê todos os dados; Colaborador vê apenas dados da sua unidade; Colaborador não vê cost_price em products nem total_profit em sales.

DADOS MOCKADOS INICIAIS (para popular as telas):

Usuários:
1. Tatiane Bedim (admin, ambas unidades, email: tatiane@asemente.com)
2. João Silva (collaborator, retiro, email: joao@asemente.com)
3. Maria Santos (collaborator, sao_miguel, email: maria@asemente.com)

Categorias: Roupas, Brinquedos, Calçados, Decoração, Eletrônicos

Produtos (15 exemplos):
- Camiseta Masculina Adulta (Roupas, Retiro, custo R$10, venda R$35)
- Brinquedo de Pelúcia (Brinquedos, S.M. Arcanjo, custo R$15, venda R$45)
- Tênis Feminino (Calçados, Retiro, custo R$25, venda R$70)
- Vaso Decorativo (Decoração, S.M. Arcanjo, custo R$20, venda R$55)
- Fone de Ouvido (Eletrônicos, Retiro, custo R$30, venda R$80)
- Vestido Infantil (Roupas, S.M. Arcanjo, custo R$12, venda R$40)
- Boneca de Pano (Brinquedos, Retiro, custo R$8, venda R$30)
- Sandália Feminina (Calçados, S.M. Arcanjo, custo R$18, venda R$50)
- Quadro Decorativo (Decoração, Retiro, custo R$25, venda R$65)
- Relógio de Parede (Eletrônicos, S.M. Arcanjo, custo R$35, venda R$90)
- Calça Jeans Feminina (Roupas, Retiro, custo R$20, venda R$55)
- Carrinho de Brinquedo (Brinquedos, S.M. Arcanjo, custo R$10, venda R$35)
- Bota Masculina (Calçados, Retiro, custo R$30, venda R$85)
- Luminária (Decoração, S.M. Arcanjo, custo R$22, venda R$60)
- Caixa de Som (Eletrônicos, Retiro, custo R$40, venda R$110)

Vendas: 8 vendas dos últimos 7 dias, variando entre as duas unidades, mix de balcão e delivery, diferentes formas de pagamento.

INSTRUÇÕES FINAIS:
1. Comece gerando a interface visual completa (UI) com todas as telas e navegação entre páginas, usando dados mockados para popular
2. Aplique a paleta de cores e tipografia definidas
3. Garanta responsividade total
4. Prepare a estrutura para integração com Supabase (auth, tabelas, RLS)
5. Implemente o cálculo automático de lucro (preço de venda - preço de custo) em todos os lugares necessários
6. Garanta que o colaborador NÃO veja campos de custo e lucro em nenhum lugar da interface
7. Use ícones do Lucide React consistentemente
8. Crie uma tela de login funcional com dados mockados para teste

Comece agora gerando a versão completa com UI e dados mockados.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/10f5851d-2cb7-45b9-a084-d29e7ffb0808).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
