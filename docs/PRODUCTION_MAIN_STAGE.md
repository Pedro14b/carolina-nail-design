# Etapa Principal - Produção Sem Dependência do PC

Este guia é o caminho mínimo para deixar o app funcionando sem precisar do seu computador ligado.

## Objetivo

1. Publicar backend na nuvem.
2. Publicar banco PostgreSQL na nuvem.
3. Gerar APK apontando para URL pública da API.

---

## 1) Publicar Backend e Banco (Render)

O projeto já possui blueprint em `render.yaml` na raiz.

Passos:

1. Faça push do repositório atualizado para o GitHub.
2. Acesse https://render.com e conecte sua conta do GitHub.
3. Clique em `New` -> `Blueprint`.
4. Selecione este repositório.
5. Confirme a criação dos recursos:
   - Web service: `carolina-nail-design-api`
   - Postgres: `carolina-nail-design-db`
6. Após o deploy, copie a URL pública da API (exemplo: `https://carolina-nail-design-api.onrender.com`).

Teste rápido:

1. Abra no navegador: `https://SUA_API/health`
2. Deve retornar JSON com `status: OK`.

---

## 2) Configurar variáveis obrigatórias no backend

No painel do Render (serviço backend), valide/ajuste:

1. `JWT_SECRET` (forte)
2. `SMTP_TRANSPORT=smtp`
3. `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
4. `CORS_ORIGIN=*` (início rápido)

Se quiser restringir CORS depois, use domínio específico:

1. `CORS_ORIGIN=https://seu-dominio.com`

---

## 3) Gerar APK apontando para API pública

No frontend, rode o build passando a URL pública:

```bash
cd frontend
set EXPO_PUBLIC_API_URL=https://SUA_API/api
npm run eas:build:android:preview
```

Quando concluir, instale o novo APK (desinstale o anterior antes).

---

## 4) Verificações no celular

1. Abrir app novo.
2. Confirmar tela de primeiro cadastro.
3. Criar conta.
4. Login com PIN.
5. Testar recuperação por email/SMS.

Se aparecer `Network Error`, normalmente é build com URL antiga ou API offline.

---

## 5) Observações importantes

1. O app só deixa de depender do seu PC quando a API pública estiver no build.
2. Se mudar a URL da API, precisa gerar novo APK.
3. Para publicação na Play Store, use profile `production` (AAB), não `preview`.
