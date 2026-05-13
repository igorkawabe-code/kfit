# 🏋️ KFit — Família Kawabe

Sistema de acompanhamento de treinos da Família Kawabe.

---

## 🚀 Deploy em 3 passos

### Passo 1 — Configure as variáveis de ambiente

Copie o `.env.example` para `.env.local` e preencha:

```
VITE_SUPABASE_URL=         → Settings > API > Project URL
VITE_SUPABASE_PUBLISHABLE_KEY=  → Settings > API Keys > Publishable key
GEMINI_API_KEY=            → aistudio.google.com > Get API Key
```

### Passo 2 — Configure o banco de dados

1. Abra o **Supabase Dashboard → SQL Editor → New Query**
2. Cole todo o conteúdo do arquivo `supabase-schema.sql`
3. Clique em **Run**

### Passo 3 — Deploy no Netlify

1. Crie uma conta em **netlify.com** com o familiakawabe@gmail.com
2. Clique em **"Add new site" → "Import an existing project"**
3. Conecte ao **GitHub** e faça upload do projeto
   - Ou use **"Deploy manually"** fazendo o drag & drop da pasta `dist`
4. Em **Site settings → Environment variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `GEMINI_API_KEY`
5. Faça o deploy!

---

## 📱 Instalar no iPhone (PWA)

1. Abra o site no **Safari**
2. Toque no ícone de **compartilhar** (quadrado com seta)
3. Selecione **"Adicionar à Tela de Início"**
4. Pronto! O KFit vai aparecer como um app 🎉

---

## 🗄️ Estrutura do banco

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis dos membros da família |
| `workouts` | Registro de treinos (1 por dia por pessoa) |
| `ai_messages` | Mensagens da IA (cache diário) |

---

## 🛠️ Desenvolvimento local

```bash
npm install
cp .env.example .env.local
# Preencha o .env.local com suas keys
npm run dev
```

---

## 👨‍👩‍👧‍👦 Família Kawabe

| Membro | Idade | Perfil |
|--------|-------|--------|
| Igor | 45 | Força, desafios, manhã |
| Renata | 44 | Saúde mental, precisa de estímulo |
| Ian | 16 | Bodybuilder, disciplinado, 5x/sem |
| Clara | 15 | Jiujitsu, atleta, tarde |
