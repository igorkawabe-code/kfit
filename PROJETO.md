# KFIT — Documento do Projeto

## O que é
App web PWA de registro e acompanhamento de treinos para grupos (família, amigos, times de empresa). Funciona como atalho na tela inicial do iPhone via "Adicionar à Tela de Início" no Safari.

## Visão de negócio
Começou como app da família do Igor Kawabe (João Pessoa, PB). O objetivo é crescer, fechar o produto e vender licenças para grupos: times de empresas, grupos de amigos, academias, etc.

## Usuários atuais (grupo família)
- Igor Kawabe (admin/criador)
- Clara K.
- Clara M.
- Ian
- Renata

## Funcionalidades existentes
- Login e autenticação por usuário
- Check-in de treino com: data, tipo de treino (musculação, esportes, cardio), foto opcional e anotações
- Tipos de treino: Peito, Costas, Pernas, Glúteos, Ombros, Bíceps, Tríceps, Abdômen, Superiores, Inferiores, Full Body, Jiujitsu, Boxe, Beach Tennis, Tênis, Padel, Ginástica, Corrida, Bike, Cardio, Funcional, Mobilidade
- Ranking por Semana, Mês, Semestre e Ano
- Pódio visual com top 3
- Histórico com calendário de treinos
- Feed coletivo "Últimos treinos da família"
- Streak de dias seguidos
- Meta semanal de treinos por usuário
- Conquistas (badges): Primeiro Treino, 10 Treinos, 50 Treinos, 100 Treinos
- IA pré-treino com mensagem motivacional (Gemini via Netlify Function)
- Perfil com foto, idade e estatísticas
- Status do dia: "Sem treino hoje" ou treino registrado

## Stack técnica
- **Frontend**: React + Vite + Tailwind CSS
- **Banco de dados e auth**: Supabase (3 tabelas com RLS)
- **Hospedagem**: Netlify
- **Função serverless**: Netlify Functions (protege a chave do Gemini)
- **IA**: Google Gemini (mensagens motivacionais com cache diário)
- **PWA**: manifest.json + ícones, configurado via netlify.toml

## Variáveis de ambiente
- `VITE_SUPABASE_URL` — URL do projeto Supabase (público, usado no frontend)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — chave anon do Supabase (público, usado no frontend)
- `GEMINI_API_KEY` — chave da API Gemini (privada, apenas na Netlify Function)

Para desenvolvimento local: copiar `.env.example` para `.env.local` e preencher os valores. A `GEMINI_API_KEY` também precisa estar configurada no painel da Netlify para funcionar em produção.

## Hospedagem atual
- URL: domínio padrão do Netlify
- Domínio pretendido: kfitbr.com (a registrar)
- Deploy: automático via GitHub (push na branch main = novo deploy)

## Como rodar localmente
```bash
cd ~/Documents/kfit
npm install
npm run dev
```
Acesse em: http://localhost:5173

## Comandos úteis
```bash
npm run dev      # servidor local (Vite)
npm run build    # build para produção
npm run preview  # preview do build local
```

## Próximos passos planejados
- [ ] Registrar domínio kfitbr.com
- [ ] Conectar domínio customizado na Netlify
- [ ] Suporte a múltiplos grupos (para venda de licenças)
- [ ] Painel de administrador por grupo
- [ ] Onboarding para novos grupos
- [ ] Push notifications de motivação

## Histórico de decisões importantes
- App construído inteiramente via Claude.ai (chat) por um não-programador
- Migrado para GitHub em maio/2026 para controle de versão
- Claude Code adotado como ferramenta principal de desenvolvimento contínuo
- CLAUDE.md criado para orientar o Claude Code sobre a arquitetura do projeto
