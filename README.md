# CustoFácil

> Descubra quanto realmente custa o que você vende.

O **CustoFácil** é uma aplicação web para formação de preço voltada para microempreendedores e pequenos negócios. A ferramenta organiza custos de materiais, mão de obra, despesas indiretas, perdas, taxas e margem desejada para ajudar o usuário a encontrar um preço de venda mais consciente.

O projeto faz parte do portfólio da **Pedetech**, uma iniciativa de soluções digitais para pequenos negócios.

## Acesso

- Aplicação publicada: https://custofacil.vercel.app/
- Repositório: https://github.com/AnnaPaulaBarros/custofacil
- Site da Pedetech: https://pedetech.vercel.app/

## Objetivo do projeto

Muitos pequenos negócios definem preços olhando apenas para o valor do material ou copiando o preço da concorrência. Essa abordagem pode esconder custos importantes, como:

- tempo de produção;
- energia, água, transporte e aluguel;
- desperdícios e perdas;
- taxas de cartão e marketplace;
- impostos e comissões;
- lucro desejado.

O CustoFácil transforma essas informações em uma visão simples: custo total, preço sugerido, lucro estimado, margem e markup.

A interface evita depender de linguagem contábil complexa. Cada conceito é acompanhado por uma explicação curta e o usuário consegue testar a calculadora antes de criar uma conta.

## Funcionalidades

### Página inicial

- Apresentação do produto e da proposta de valor.
- Explicação do processo em quatro etapas.
- Preview visual de um resultado de precificação.
- Lista de recursos da ferramenta.
- Link para a Pedetech.
- Acesso à calculadora sem exigir login.

### Precificação

- Cadastro do nome, categoria, unidade e quantidade produzida.
- Inclusão dinâmica de matérias-primas.
- Cálculo de preço por unidade do material.
- Cálculo do custo utilizado no produto.
- Inclusão de etapas de mão de obra.
- Cálculo por valor da hora e tempo trabalhado.
- Inclusão de custos indiretos mensais.
- Rateio do custo mensal pela produção estimada.
- Percentual de perdas.
- Taxas incidentes sobre a venda.
- Margem desejada.
- Resultado atualizado em tempo real.
- Composição visual do custo.
- Alternância entre EUR e BRL.
- Exportação por impressão do navegador, permitindo salvar como PDF.

### Áreas do sistema

- Dashboard.
- Produtos.
- Materiais.
- Mão de obra.
- Custos indiretos.
- Análises.
- Simulador de cenários.
- Configurações do negócio.
- Central de ajuda com explicações de margem, markup e custos.

### Autenticação

A aplicação usa o Supabase Auth para:

- criar conta com e-mail e senha;
- fazer login;
- fazer logout;
- recuperar a sessão existente no navegador;
- exibir o nome do usuário autenticado;
- manter a calculadora acessível para visitantes.

A estratégia de experiência é híbrida:

1. O visitante pode testar a ferramenta sem cadastro.
2. O usuário cria uma conta quando precisa manter seus dados.
3. O usuário autenticado poderá acessar suas informações de forma segura.

## Tecnologias

- HTML5 semântico.
- CSS3 responsivo.
- JavaScript ES6+.
- Supabase Auth.
- Supabase PostgreSQL.
- Row Level Security, ou RLS.
- Vercel para hospedagem e deploy.
- Google Fonts: DM Sans e Space Grotesk.
- Supabase JS Client carregado via CDN.

A escolha por HTML, CSS e JavaScript puro foi intencional para manter o MVP simples, rápido de publicar e fácil de entender. A aplicação não depende de um processo de build local nem de Node.js para ser executada no navegador.

## Arquitetura

A aplicação é organizada em três arquivos principais:

```text
custofacil/
├── index.html             # Estrutura das telas e formulários
├── styles.css             # Identidade visual e responsividade
├── app.js                 # Estado, cálculos, navegação e Supabase Auth
└── supabase-schema.sql    # Tabelas, funções, triggers, índices e RLS
```

### `index.html`

Contém:

- sidebar e navegação;
- página de apresentação;
- dashboard;
- telas internas;
- formulário de precificação;
- modal de autenticação;
- janela de ajuda;
- elementos de resultado;
- carregamento do Supabase JS Client.

### `styles.css`

Contém:

- variáveis de cor e tipografia;
- componentes visuais;
- cards, tabelas, gráficos e modais;
- layout desktop;
- layout mobile;
- regras específicas para impressão/PDF;
- estados de botões e indicadores.

### `app.js`

Contém:

- configuração pública do Supabase;
- estado da moeda;
- funções de cálculo;
- navegação entre telas;
- adição e remoção de linhas dinâmicas;
- autenticação;
- carregamento e salvamento das configurações do negócio;
- simulador em tempo real;
- exportação por impressão.

## Fórmulas principais

### Matéria-prima

O preço por unidade é calculado por:

```text
preço por unidade = preço pago / quantidade comprada
```

O custo utilizado no produto é:

```text
custo utilizado = preço por unidade × quantidade utilizada
```

Exemplo:

```text
€ 20,00 / 10 kg = € 2,00 por kg
€ 2,00 × 0,5 kg = € 1,00 utilizado
```

### Mão de obra

O tempo total é convertido para minutos e aplicado ao valor da hora:

```text
custo da mão de obra = valor da hora × (minutos trabalhados / 60)
```

Exemplo:

```text
€ 10,00/h × (30 / 60) = € 5,00
```

### Custo indireto

Cada despesa mensal é distribuída pela produção estimada:

```text
custo indireto por produto = custo mensal / produção mensal estimada
```

Exemplo:

```text
€ 500,00 / 100 produtos = € 5,00 por produto
```

### Perdas

```text
perda = (materiais + mão de obra + custos indiretos) × percentual de perda
```

```text
custo total = materiais + mão de obra + custos indiretos + perdas
```

### Preço sugerido

Considerando margem desejada e percentuais incidentes sobre a venda:

```text
preço sugerido = custo total / (1 - margem - taxas)
```

A fórmula é importante porque as taxas e a margem incidem sobre o preço de venda, e não simplesmente sobre o custo.

### Lucro estimado

```text
lucro estimado = preço sugerido × (1 - taxas) - custo total
```

### Markup

No MVP, o markup multiplicador é apresentado como:

```text
markup multiplicador = preço sugerido / custo total
```

A aplicação mantém margem e markup como conceitos separados:

- **Margem:** percentual do preço de venda que permanece como resultado.
- **Markup:** índice usado para transformar o custo em preço.

## Banco de dados

O arquivo [`supabase-schema.sql`](supabase-schema.sql) cria a estrutura inicial do PostgreSQL.

### Tabelas

| Tabela | Responsabilidade |
| --- | --- |
| `businesses` | Negócio do usuário, segmento e moeda |
| `products` | Produtos cadastrados |
| `materials` | Cadastro de matérias-primas e insumos |
| `product_materials` | Relação entre produto, material e quantidade utilizada |
| `labor` | Etapas de mão de obra |
| `indirect_costs` | Custos mensais rateados por produto |
| `selling_costs` | Taxas e percentuais incidentes sobre a venda |
| `pricing` | Histórico e resultado da precificação |

### Segurança com RLS

Todas as tabelas públicas possuem Row Level Security habilitado.

As políticas verificam se:

- o negócio pertence ao usuário autenticado;
- o produto pertence a um negócio do usuário;
- materiais e custos pertencem ao negócio do usuário;
- mão de obra, taxas e precificações pertencem a produtos do usuário.

Essa camada é importante porque a chave pública do Supabase pode estar no frontend, mas os dados continuam protegidos no banco por políticas baseadas em `auth.uid()`.

### Trigger de negócio padrão

Quando um usuário é criado no Supabase Auth, uma função cria automaticamente um registro em `businesses`. O nome inicial utiliza o nome informado nos metadados do usuário ou `Meu negocio` como fallback.

## Como executar localmente

Como o projeto é estático, basta abrir o arquivo `index.html` no navegador.

Para desenvolvimento local com um servidor simples, também é possível usar uma extensão como Live Server no VS Code.

### Pré-requisitos

- Navegador moderno.
- Acesso à internet para carregar o Supabase JS Client e as fontes.
- Projeto Supabase configurado.

Node.js não é necessário para executar a versão atual.

## Configuração do Supabase

1. Crie ou abra o projeto no Supabase.
2. Execute o conteúdo de [`supabase-schema.sql`](supabase-schema.sql) no **SQL Editor**.
3. Em **Authentication**, habilite o provedor de e-mail.
4. Configure as URLs autorizadas:
   - `http://localhost` ou a URL usada pelo servidor local;
   - `https://custofacil.vercel.app`;
   - a URL final de produção, quando houver domínio próprio.
5. Confirme se as tabelas aparecem no **Table Editor**.
6. Crie uma conta de teste pela aplicação.

### Segurança de chaves

O frontend utiliza apenas a chave pública `anon`/publishable key.

Nunca publique:

- `service_role key`;
- chaves `sb_secret_`;
- tokens privados;
- senhas;
- credenciais administrativas.

A chave secreta deve ser revogada imediatamente caso seja compartilhada ou commitada em um repositório.

## Deploy na Vercel

O projeto pode ser publicado como site estático:

1. Envie os arquivos para o GitHub.
2. Crie um projeto na Vercel.
3. Importe o repositório `AnnaPaulaBarros/custofacil`.
4. Não informe comando de build.
5. Use a raiz do repositório como diretório de publicação.
6. Clique em **Deploy**.
7. Configure a URL da Vercel no Supabase Authentication.

Após cada `git push`, a Vercel cria uma nova implantação automaticamente.

## Git básico do projeto

```bash
git add index.html styles.css app.js supabase-schema.sql README.md
git commit -m "Atualiza documentacao do CustoFacil"
git push
```

## Fluxo principal do usuário

```text
Página de apresentação
        ↓
Testar calculadora sem cadastro
        ↓
Preencher produto e custos
        ↓
Ver preço sugerido em tempo real
        ↓
Exportar relatório ou criar conta
        ↓
Acessar configurações e dados da conta
```

## Decisões técnicas para explicar em uma entrevista

### Por que HTML, CSS e JavaScript puro?

O objetivo inicial era validar o produto com baixo custo operacional. Como o MVP é uma aplicação estática e os cálculos acontecem no navegador, HTML, CSS e JavaScript puro reduzem a complexidade e permitem publicar rapidamente.

Eu manteria a estrutura simples enquanto o produto valida seu fluxo. Em uma próxima fase, React ou TypeScript poderia ser adotado para facilitar a manutenção de muitos componentes, tipagem de dados e crescimento da aplicação.

### Por que Supabase?

O Supabase fornece autenticação, PostgreSQL e APIs prontas. Isso permite adicionar usuários e persistência sem construir um backend inteiro do zero.

Além disso, o PostgreSQL é adequado para os relacionamentos entre negócios, produtos, materiais e precificações.

### Por que usar RLS?

Como o frontend usa uma chave pública, não é suficiente confiar apenas na interface para esconder dados. O RLS aplica a regra de segurança no próprio banco e garante que o usuário só acesse registros relacionados ao seu `auth.uid()`.

### Por que permitir uso sem login?

Obrigar cadastro antes de mostrar o valor da ferramenta aumenta a fricção. O usuário pode experimentar a calculadora primeiro e criar uma conta quando quiser salvar os dados. Isso combina aquisição com persistência.

### Como os cálculos evitam arredondamentos intermediários?

Os valores são mantidos como números durante o processamento e formatados apenas na apresentação com duas casas decimais. Isso evita distorções acumuladas em etapas intermediárias.

### Qual é o principal trade-off atual?

O MVP prioriza clareza e velocidade de entrega. O dashboard ainda possui dados demonstrativos em algumas áreas, e o salvamento completo da precificação ainda é uma evolução necessária. O schema já prepara a base para essa persistência.

## Limitações atuais

- A calculadora principal funciona no frontend.
- O login e cadastro estão integrados ao Supabase Auth.
- Configurações do negócio podem ser carregadas e salvas para usuários autenticados.
- O schema do banco está preparado, mas o fluxo completo de salvar cada precificação ainda precisa ser conectado aos formulários.
- O dashboard contém dados demonstrativos em partes da interface.
- O PDF é gerado pelo diálogo de impressão do navegador.
- Ainda não há testes automatizados em um framework de testes.
- Ainda não há recuperação de senha implementada na interface.
- Ainda não há edição, duplicação e exclusão persistentes de produtos.

## Próximas evoluções

1. Salvar produtos, materiais, mão de obra e precificações no Supabase.
2. Carregar o dashboard com dados reais do usuário.
3. Implementar recuperação de senha.
4. Criar histórico de alterações de preços.
5. Adicionar ponto de equilíbrio e meta de lucro.
6. Implementar edição, duplicação e exclusão de produtos.
7. Criar testes automatizados para as fórmulas.
8. Adicionar importação e exportação de planilhas.
9. Adicionar domínio próprio da Pedetech ou do produto.
10. Evoluir para TypeScript quando a complexidade justificar.

## Checklist de demonstração

Para demonstrar o projeto em uma entrevista:

1. Abra a página inicial e explique o problema de negócio.
2. Mostre que o visitante pode testar sem criar conta.
3. Entre em **Nova precificação**.
4. Explique o cálculo de um material por unidade.
5. Mostre como o tempo de mão de obra vira custo.
6. Altere a margem e observe o preço mudar em tempo real.
7. Mostre o simulador “E se?”.
8. Abra a ajuda e explique a preocupação com acessibilidade e linguagem simples.
9. Demonstre o cadastro/login pelo Supabase.
10. Abra configurações e salve o nome e a moeda do negócio.
11. Explique o schema e as políticas RLS.
12. Mostre o deploy da Vercel e a integração com GitHub.

