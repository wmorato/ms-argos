# Histórico de Execuções — ms-argos

## 2026-03-09 — Implementação Completa Fase 1

**Tarefa:** Implementar o projeto ms-argos com base no piloto existente (`Piloto/`) e nos documentos institucionais (`Institucional/`).

**O que foi feito:**
- Criada estrutura completa do projeto: `frontend/`, `backend/`, `docker/`, `data/`, `testes/`, `doc/`
- **Backend** Node.js + Express com: autenticação JWT+bcrypt, adapter pattern para CRMs (ICrmProvider → SgpTsmxAdapter), CRUD de empresas e usuários (soft delete), log de pesquisas LGPD-compliant (hash SHA-256), rate limiting, CORS restrito
- **Frontend** React + Vite com: login com JWT, sidebar glassmorphism, pesquisa com CPF mascarado (padrão `123.***.***-00`), resultados em tempo real por cards, tabela de boletos expansível, dashboard com estatísticas, admin de empresas/usuários, logs, página de pagamento (placeholder)
- **PostgreSQL 16**: migrations automáticas na inicialização, seeds com empresas IcarusNet e Interbyte e usuários admin/dev
- **Docker**: 4 containers (`argos-postgres`, `argos-backend`, `argos-frontend`, `argos-backup`), backup automático a cada 1 hora
- **Nginx**: rotas `/argos/` (SPA) e `/argos/api/` (backend) adicionadas em `ms-site.conf`
- **Testes**: health check com 9 validações incrementais — 9/9 passando
- **Secrets**: `/var/www/secrets/ms-argos.env` criado com todas as variáveis

## 2026-03-09 — Refatoração Frontend (UX) e Estrutura de Pastas

**Tarefa:** Organizar páginas em pastas (/pages/modulo/*) e simplificar a visualização de resultados de pesquisa conforme solicitação.

**O que foi feito:**
- **Reorganização Estrutural**: Todas as páginas movidas para subpastas (`src/pages/login/`, `src/pages/dashboard/`, etc.), melhorando a escalabilidade.
- **Nova UX de Pesquisa**: 
  - Cards de resultado simplificados (apenas Provedor e Status).
  - Implementado **ResultModal**: Popup com detalhes completos ao clicar no card.
  - Removidos links para boletos de pagamento (mantida apenas a listagem informativa).
- **Refatoração de Caminhos**: Atualizados todos os `imports` e refinado o build do frontend para evitar conflitos de cache após a movimentação.
