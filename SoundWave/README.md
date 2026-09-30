# SoundWave 🎧 — Aplicativo de Streaming de Músicas

> **Trabalho Acadêmico de Desenvolvimento Mobile / Web**  
> Identidade visual exclusiva, responsivo e construído puramente com **HTML5, CSS3 e JavaScript Vanilla**.

![SoundWave Logo](assets/logo.svg)

---

## 🎵 1. Sobre o Projeto

O **SoundWave** é uma plataforma completa e moderna de streaming musical desenvolvida com foco em interfaces mobile-first e adaptação para desktop. O sistema proporciona uma experiência fluida de reprodução contínua de músicas, navegação intuitiva, criação de playlists, busca em tempo real, visualização de históricos, controle de fila e simulação de assinatura Premium com downloads offline.

---

## 🚀 2. Como Executar

O projeto foi construído para funcionar diretamente no navegador, **sem necessidade de instalação de dependências ou build**.

### Opção 1: Execução Direta (Mais Simples)
1. Navegue até a pasta `SoundWave`.
2. Dê um duplo clique no arquivo **`index.html`**.
3. O aplicativo abrirá imediatamente no seu navegador padrão (Chrome, Edge, Firefox, etc.).

### Opção 2: Servidor Local (Opcional)
Caso utilize extensões como **Live Server** (VS Code) ou Python:
```bash
# Com Python 3
python -m http.server 3000

# Com Node.js (npx serve)
npx serve .
```
Acesse `http://localhost:3000` no navegador.

---

## 🔑 3. Credenciais de Teste

Para facilitar a avaliação, o sistema já vem pré-configurado com uma conta de demonstração:

| Campo | Valor de Demonstração |
|---|---|
| **E-mail** | `demo@soundwave.com` |
| **Senha** | `123456` |
| **Nome** | Paulo Bertoldi |
| **Usuário** | `@paulobertoldi` |

> Também é possível cadastrar novos usuários livremente pela tela de **Cadastro** (`#/cadastro`).

---

## 🎨 4. Identidade Visual

O SoundWave possui uma estética futurista, moderna, musical e elegante:

- **Fundo Principal:** `#080b12` (Profundo, quase preto)
- **Gradiente Neon:** `linear-gradient(135deg, #6d28d9, #a855f7)`
- **Cores de Destaque:** Roxo Vibrante (`#8b5cf6`), Roxo Neon (`#c084fc`)
- **Superfícies:** Glassmorphism com `backdrop-filter: blur()`, bordas semi-transparentes suaves e cantos arredondados (`border-radius: 16px`).
- **Acessibilidade:** Suporte nativo ao **Modo de Alto Contraste**, ativável na tela de Configurações.

---

## 📂 5. Estrutura de Arquivos

```text
SoundWave/
│
├── index.html                 # Aplicação SPA principal com Mini-Player contínuo
│
├── pages/                     # Páginas dedicadas completas
│   ├── login.html             # Tela de login
│   ├── cadastro.html          # Tela de cadastro de novos usuários
│   ├── home.html              # Tela inicial com recomendações e banners
│   ├── pesquisa.html          # Busca com filtros dinâmicos
│   ├── player.html            # Player dedicado em tela cheia
│   ├── playlists.html         # Gestão de playlists
│   ├── favoritos.html         # Lista de músicas curtidas
│   ├── perfil.html            # Perfil do usuário e estatísticas
│   ├── editar-perfil.html     # Edição de dados cadastrais
│   ├── historico.html         # Histórico de reproduções cronológicas
│   ├── fila.html              # Fila de reprodução e reordenação
│   ├── artista.html           # Perfil detalhado do artista e discografia
│   ├── notificacoes.html      # Notificações de novos lançamentos
│   ├── premium.html           # Apresentação e ativação do plano Premium
│   ├── downloads.html         # Músicas offline e indicação em MB
│   └── configuracoes.html     # Configurações de sistema e logout
│
├── css/
│   ├── style.css              # Design system, tokens, variáveis, toasts e modais
│   ├── login.css              # Formulários modernos de autenticação
│   ├── home.css               # Estilos de banners, grids, tabelas e cards
│   ├── player.css             # Mini-player flutuante e full player modal
│   └── responsive.css         # Breakpoints para Mobile, Tablet e Desktop
│
├── js/
│   ├── dados.js               # Catálogo mock de artistas, faixas e álbuns
│   ├── api.js                 # Camada de abstração assíncrona (pronta para REST API)
│   ├── auth.js                # Lógica de login, cadastro, validações e sessão
│   ├── player.js              # HTML5 Audio + Web Audio Synth fallback + Fila
│   ├── playlists.js           # Gerenciador de playlists do usuário
│   ├── favoritos.js           # Gerenciador de músicas curtidas
│   ├── pesquisa.js            # Mecanismo de busca e seção Em Alta
│   ├── perfil.js              # Atualização e renderização do perfil
│   └── app.js                 # Roteador SPA, estado global appState, toasts e modais
│
├── assets/
│   ├── logo.svg               # Logo vetorial com ondas sonoras
│   ├── logo-icon.svg          # Ícone quadrado da marca
│   ├── capas/                 # Capas de músicas
│   ├── artistas/              # Fotos de artistas
│   └── icones/                # Ícones complementares
│
└── README.md                  # Documentação do projeto
```

---

## ⚙️ 6. Regras de Negócio Implementadas

| Código | Regra | Status | Implementação |
|---|---|---|---|
| **RN01** | *Cada e-mail pode ser usado apenas uma vez.* | ✅ Implementado | Validado em `js/auth.js` impedindo duplicação no `localStorage`. |
| **RN02** | *Somente usuários cadastrados podem criar playlists.* | ✅ Implementado | Checagem de sessão em `js/playlists.js`; bloqueia visitantes com toast explicativo. |
| **RN03** | *Uma música não pode ser adicionada duas vezes aos favoritos.* | ✅ Implementado | Verificação de duplicatas por ID em `js/favoritos.js`. |
| **RN04** | *Somente usuários Premium podem baixar músicas.* | ✅ Implementado | Bloqueia download e exibe banner para usuários gratuitos em `js/app.js` e `downloads.html`. |
| **RN05** | *Todas as reproduções devem ser registradas no histórico.* | ✅ Implementado | Invocação automática em `js/player.js` ao iniciar qualquer faixa, com data e horário. |

---

## 🛠️ 7. Tecnologias Utilizadas

- **HTML5 Semântico:** `<main>`, `<section>`, `<aside>`, `<nav>`, `<header>`, acessibilidade com labels e ARIA.
- **CSS3 Puro:** Flexbox, CSS Grid, Custom Properties (variáveis), Animações com `@keyframes`, Glassmorphism com `backdrop-filter`.
- **JavaScript Vanilla (ES6+):** Async/Await, Web Audio API, LocalStorage, Closures modulares, Event Delegation, Clipboard API (`navigator.clipboard`).
- **Ícones & Fontes:** Font Awesome 6 (CDN) e Google Fonts (*Outfit* e *Inter*).

---

## 📱 8. Responsividade

- **Mobile (< 768px):** Menu inferior fixo com ícones estilizados, Mini-player flutuante, cards em grade de 2 colunas e rolagem horizontal suave.
- **Desktop (≥ 768px):** Menu lateral fixo (Sidebar) com acesso rápido à biblioteca, barra superior com perfil, player estilo Spotify fixo na base e visão expandida.

---

## 👨‍💻 Autor

- **Paulo Bertoldi**
- Disciplina: *Desenvolvimento Mobile / Web*
