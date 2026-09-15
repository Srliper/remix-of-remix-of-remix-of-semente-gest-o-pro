# Catálogo delivery e gestão por canal

## Objetivo
Separar claramente a experiência do cliente e a operação interna em três áreas: compras por delivery, gestão do delivery e gestão da loja física.

## O que será criado
- **Catálogo do cliente (`/loja`)**: vitrine pública com as seis imagens de categorias, busca, filtro por unidade, produtos disponíveis, carrinho lateral e finalização orientada para delivery.
- **Gestão do delivery (`/delivery`)**: painel operacional com pedidos separados por etapa — pendente, confirmado, em preparo e entregue — usando os ícones de moto, pacote, rota e entrega concluída. Permitirá avançar o status dos pedidos existentes.
- **Gestão da loja física (`/loja-fisica`)**: visão focada em vendas de balcão, estoque por unidade, itens com estoque baixo e acesso direto ao cadastro de produtos e ao PDV.
- **Navegação interna reorganizada**: grupo “Operação” para Loja física e Delivery; grupo “Gestão” para estoque, relatórios, equipe e configurações.
- **Dashboard**: atalhos visuais para as duas operações, usando os símbolos administrativos já gerados.

## Imagens e identidade
- Aplicar as imagens de roupas femininas, masculinas, infantis, calçados, acessórios e casa/decoração como escolhas visuais do cliente.
- Aplicar os ícones de delivery nos estados dos pedidos.
- Aplicar os símbolos administrativos somente nas áreas de gestão.
- Preservar a identidade Musgo & Terracota, Libre Baskerville + IBM Plex Sans e o padrão naturalista já aprovado.

## Regras funcionais
- O catálogo do cliente será público e mostrará apenas produtos disponíveis com estoque.
- O carrinho respeitará a unidade escolhida e usará os dados reais já cadastrados.
- A conclusão do pedido usará o fluxo de venda delivery existente, solicitando nome, telefone, endereço e forma de pagamento.
- A gestão interna continuará protegida por login e respeitará as permissões atuais.

## Detalhes técnicos
- Criar rotas próprias para catálogo, delivery e loja física.
- Reutilizar o estado e as rotinas atuais de produtos, vendas e alteração de status, sem criar uma segunda fonte de dados.
- Adicionar metadados próprios às novas páginas e manter o layout adaptável para celular e computador.
- Validar o fluxo visual e as principais interações no navegador.
