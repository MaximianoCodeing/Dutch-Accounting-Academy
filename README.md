# Dutch Accounting Academy

Plataforma de formação em contabilidade e fiscalidade neerlandesa, com currículo
multilingue (PT / EN / NL), modo claro/escuro, gamificação e Modo Empresa.

- **Frontend:** React + Vite + Tailwind
- **Backend:** Node puro (sem dependências) + SQLite
- **Requisito:** Node 22.5 ou superior (o módulo `node:sqlite` é embutido)

---

## Correr localmente

Precisas de **dois terminais**.

Terminal 1 — servidor de progresso:
```bash
npm install
npm run server
```
Arranca em http://localhost:3001 e cria `server/daa.db` na primeira execução.

Terminal 2 — interface:
```bash
npm run dev
```
Abre em http://localhost:5173

O Vite encaminha automaticamente os pedidos `/api` para o servidor.

---

## Como funciona o progresso

Há dois níveis, e funcionam em conjunto:

1. **Sem conta** — o progresso é guardado no `localStorage` do navegador.
   Sobrevive a fechar a página, mas é só naquele dispositivo.
2. **Com conta** — em *Perfil → Conta*, cria conta ou entra. A partir daí o
   progresso é guardado no SQLite do servidor, cerca de 1 segundo após cada
   alteração, e é recuperado em qualquer dispositivo onde entres.

Se o servidor estiver em baixo, a app continua a funcionar e guarda localmente;
o painel de conta mostra o estado da sincronização.

### Base de dados

Ficheiro: `server/daa.db` (SQLite). Três tabelas:

| Tabela | Conteúdo |
|---|---|
| `users` | utilizador, salt e hash da palavra-passe (scrypt) |
| `progress` | um registo por utilizador, com o progresso em JSON |
| `sessions` | tokens de sessão ativos |

Inspecionar:
```bash
sqlite3 server/daa.db "SELECT username, updated_at FROM users JOIN progress ON users.id = progress.user_id;"
```

### API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/register` | criar conta → devolve token |
| POST | `/api/login` | entrar → devolve token |
| POST | `/api/logout` | terminar sessão |
| GET | `/api/progress` | ler progresso (requer token) |
| PUT | `/api/progress` | gravar progresso (requer token) |

Autenticação por `Authorization: Bearer <token>`.

---

## Deploy

### Frontend
Continua a funcionar no Vercel como antes (`vercel --prod`). Sem servidor
configurado, a app corre em modo local: o progresso fica no navegador.

### Backend — atenção
**O SQLite não funciona no Vercel.** As funções são serverless e o sistema de
ficheiros é efémero: a base de dados seria apagada a cada arranque. O servidor
precisa de correr num sítio com disco persistente.

## Pôr o servidor online — sem terminal (GitHub Desktop + Railway)

Este caminho usa só interfaces gráficas: **GitHub Desktop** para publicar o
código e o **dashboard da Railway** para publicar o servidor. Não precisas de
comandos de terminal em nenhum destes passos.

### Parte 1 — publicar o código no GitHub

1. Instala o **GitHub Desktop**: https://desktop.github.com — é só o
   instalador normal, como qualquer programa.
2. Abre-o e inicia sessão com a tua conta GitHub (cria uma gratuita em
   https://github.com/join se não tiveres).
3. Menu **File → Add Local Repository**.
4. Escolhe a pasta `daa` (a que tens no computador).
5. Vai aparecer um aviso a dizer que a pasta ainda não é um repositório Git —
   clica em **create a repository**.
6. Em baixo, no campo "Summary", escreve algo como `Primeira versão` e clica
   **Commit to main**.
7. No topo, clica **Publish repository**. Podes deixar como privado.

O teu código já está no GitHub — não precisaste de escrever nenhum comando.

### Parte 2 — publicar o servidor na Railway

Este repositório já vem com `server/Dockerfile` e `railway.json` prontos,
a apontar exatamente para o servidor (o site e o servidor vivem na mesma
pasta, mas são publicados em sítios diferentes).

1. Cria conta em https://railway.app (podes entrar diretamente com GitHub).
2. No dashboard, clica **New Project → Deploy from GitHub repo**.
3. Escolhe o repositório que acabaste de publicar (`daa`).
4. A Railway lê o `railway.json` e usa o `server/Dockerfile` automaticamente.
5. Antes de dar deploy, adiciona um **Volume** (disco persistente, para o
   SQLite não se perder): no serviço criado, aba **Settings → Volumes → 
   New Volume**, monta-o em `/data`.
6. Em **Settings → Variables**, confirma que existe `DB_PATH=/data/daa.db`
   (o Dockerfile já define isto, mas se a Railway não respeitar, adiciona-a
   à mão aqui).
7. Em **Settings → Networking**, clica **Generate Domain** — isso dá-te um
   endereço público tipo `https://daa-server-production.up.railway.app`.
8. Espera o deploy ficar verde (**Success**). Testa abrindo
   `https://o-teu-endereco.up.railway.app/api/progress` no browser — deve
   mostrar `{"error":"Sessão inválida."}`, que é a resposta correta sem login.

### Parte 3 — ligar o site publicado ao servidor

No teu computador, dentro da pasta `daa`, cria um ficheiro chamado `.env`
(sem mais nada no nome) com esta linha, usando o endereço da Railway:
```
VITE_API_URL=https://o-teu-endereco.up.railway.app
```

Depois volta ao terminal só para este passo final:
```bash
npm run build
vercel --prod
```

A partir daqui, criar conta em **Perfil → Conta** no site publicado no Vercel
grava o progresso neste servidor — disponível em qualquer aparelho.

### Alternativas
- **Fly.io** — mesma ideia, mas por CLI (`fly.toml` também incluído neste
  repositório, caso prefiras esse caminho mais tarde).
- **Turso / libSQL** — SQLite alojado, API compatível, sem gerir servidor.
- **Postgres** (Vercel Postgres, Neon, Supabase) — se o projeto crescer para o
  backend Django previsto no documento-mestre.

---

## Onde está o conteúdo

Todo o material pedagógico vive no array `COURSES` em `src/App.jsx`, com os
campos `title`, `theory`, `flashcard` e `quiz` traduzidos em `pt` / `en` / `nl`.

## Nota sobre valores fiscais

Os valores referem-se a 2026 (BTW 21/9/0%, Vpb 19% até €200.000 e 25,8% acima,
regra dos 30% com teto WNT de €262.000, Box 3 com isenção de €59.357, etc.).
Estão escritos dentro do texto das lições — quando o projeto crescer, devem
passar para uma tabela por ano fiscal, para a atualização anual ser trivial.
