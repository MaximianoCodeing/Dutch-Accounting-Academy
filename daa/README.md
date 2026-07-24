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

## Pôr o servidor online (Fly.io)

Este repositório já vem com `server/Dockerfile` e `fly.toml` prontos.

1. Cria conta em https://fly.io (cartão pode ser pedido, mas o plano gratuito
   cobre este projeto).

2. Instala a CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

3. Autentica:
   ```bash
   fly auth login
   ```

4. Dentro da pasta `daa/`, edita `fly.toml` e muda `app = "daa-server"` para
   um nome único teu (ex.: `app = "daa-server-<teu-nome>"`) — o nome da app
   é global em toda a Fly.io.

5. Cria a app e o volume persistente (guarda o SQLite entre deploys):
   ```bash
   fly apps create daa-server-<teu-nome>
   fly volumes create daa_data --region ams --size 1
   ```

6. Deploy:
   ```bash
   fly deploy
   ```

7. Confirma que está no ar:
   ```bash
   curl https://daa-server-<teu-nome>.fly.dev/api/progress
   ```
   Deve devolver `{"error":"Sessão inválida."}` — é a resposta correta sem token.

8. Aponta o frontend para o servidor. Cria `.env` na raiz do projeto:
   ```
   VITE_API_URL=https://daa-server-<teu-nome>.fly.dev
   ```
   Refaz o build e volta a publicar no Vercel:
   ```bash
   npm run build
   vercel --prod
   ```

A partir daqui, criar conta e entrar em **Perfil → Conta** no site do Vercel
grava o progresso neste servidor, disponível em qualquer aparelho.

### Alternativas ao passo 2 (sem servidor próprio)
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
