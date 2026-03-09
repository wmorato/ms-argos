# Avaliação — Fase 1: O que fazer agora sem gerar atraso

> Baseado nos arquivos: `estrutura.md`, `diretrizes.md`, `regras.md`, `Ideias.md` e piloto existente.
> **Objetivo da Fase 1 (conforme diretrizes.md):** Sistema funcional — boas-vindas, páginas definidas, consulta e respostas estruturadas.

---

## ✅ Fazer na Fase 1 — simples agora, preparado para evoluir

| # | Item | Como fazer na Fase 1 | Como evoluir depois |
|---|------|----------------------|---------------------|
| 1 | **CRM / Provedores** | Implementar apenas o SGP (TSMX) — integração já validada no piloto | Adicionar novos CRMs via padrão de adapter/plugin sem quebrar nada |
| 2 | **Empresas conveniadas** | Cadastrar empresas manualmente no banco (seed/admin) | Criar painel de self-service para cadastro de novas empresas |
| 3 | **Dashboard de estatísticas** | Página estática com contadores básicos (total de consultas, empresas ativas) | Evoluir para gráficos reais com filtros por período/empresa |
| 4 | **Log de pesquisas** | Registrar apenas: data + empresa + hash do CPF (sem dado pessoal) | Relatórios exportáveis e filtros avançados por período |
| 5 | **Autenticação (JWT + bcrypt)** | Login simples, troca de senha obrigatória no 1º acesso | Adicionar 2FA, SSO, recuperação de senha por e-mail |
| 6 | **Página de pagamento** | Manter como **placeholder "em construção"** — já previsto na estrutura | Integrar gateway real (PagSeguro, Stripe, etc.) |
| 7 | **Pesquisa de CPF** | Consultar apenas no SGP e retornar resultado estruturado | Consultas paralelas em múltiplos CRMs, agregação de resultados |
| 8 | **Ofuscação de CPF** | Implementar a regra de mascaramento já documentada em `regras.md` | Nenhuma evolução necessária — já especificado corretamente |
| 9 | **E-mail de resultado** | Botão "Enviar por e-mail" disparando resultado da consulta | Fila de envio, templates HTML, histórico de envios |
| 10 | **CORS / Segurança** | Whitelist de origens, JWT nos endpoints, HTTPS | Rate limiting, audit log, WAF |

---

## ⚠️ Deixar fora da Fase 1 — risco de atraso ou bloqueio legal

- 🔴 **Ideias.md — Consultar pai/mãe / verificar endereço / cruzamento de CEP**
  - Alta complexidade de integração + risco jurídico (LGPD)
  - Entrar somente em Fase 2+ após validação jurídica

- 🔴 **Captcha**
  - Relevante para segurança, mas não bloqueia o MVP
  - Adicionar na Fase 1.5 sem impacto na entrega

- 🔴 **Docker (orquestração completa)**
  - Criar `Dockerfile` básico é suficiente na Fase 1
  - Docker Compose completo + CI/CD vem depois

- 🔴 **TDD completo**
  - Na Fase 1: cobertura apenas nos endpoints críticos (consulta e login)
  - Testes completos na Fase 2

---

## 🧱 Fazer corretamente desde a Fase 1 — não dá para remediar depois

> Esses itens precisam ser bem feitos agora ou gerarão **retrabalho caro** nas fases seguintes.

- ✅ **Banco de dados normalizado** — Tabelas separadas para `empresas`, `usuarios`, `logs_consulta`
- ✅ **Adapter pattern para CRMs** — Interface genérica `ICrmProvider` desde o início, mesmo com apenas 1 CRM
- ✅ **Não armazenar dados pessoais** — Auditado em cada endpoint (conforme `#PS` da estrutura.md)
- ✅ **TOKEN por empresa** — Campo obrigatório no cadastro de empresa desde a Fase 1
- ✅ **SOFT delete em empresas/usuários** — Nunca deletar fisicamente, apenas desativar

---

## 📋 Ordem de entrega sugerida — Fase 1

```
1. Setup base: React + Node.js + PostgreSQL + Docker básico
2. Autenticação: login, JWT, bcrypt, troca de senha obrigatória no 1º acesso
3. Cadastro de empresa: CNPJ, nome, site, CRM, token (via admin)
4. Página de pesquisa: CPF mascarado (regras.md), integração SGP
5. Log de consultas: data + empresa (sem dados pessoais)
6. Dashboard: contadores simples (total consultas, empresas ativas)
7. Página de pagamento: placeholder "em construção"
8. Home + tela de contato + tela de login (área pública)
```

---

## 📌 Notas legais importantes

- Verificar com jurídico o uso do termo "clientes inadimplentes" na home page
- O log de consultas deve ser validado juridicamente — se houver dúvidas, seguir o modelo simplificado (apenas data + empresa)
- As ideias de cruzamento de dados de terceiros (pai/mãe, endereço) dependem de parecer jurídico antes de qualquer implementação
