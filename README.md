# Brev.ly - Server

Encurtador de URLs. Projeto desenvolvido para a Faculdade de Tecnologia Rocketseat.

## Como rodar

Antes de tudo, copie o arquivo `.env.test` para `.env`:

```bash
cp .env.test .env
```

```bash
pnpm install
pnpm dev
```

Isso sobe os serviços via Docker, roda as migrations e inicia o servidor com hot reload.

### Exportação de CSV (Cloudflare R2)

Para exportar os dados em CSV, é necessário preencher no `.env` as credenciais de um bucket da Cloudflare (R2):

```env
CLOUDFLARE_ACCOUNT_ID=""
CLOUDFLARE_ACCESS_KEY_ID=""
CLOUDFLARE_SECRET_ACCESS_KEY=""
CLOUDFLARE_BUCKET="brevly"
CLOUDFLARE_PUBLIC_URL=""
```

## Testes

```bash
pnpm test
```

## Build

```bash
pnpm build
pnpm start
```
