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

## 2026-03-09 — Melhorias Administrativas, UX Financeira e Publicação GitHub

**Tarefa:** Implementar funcionalidade de edição, máscara de CNPJ e publicar projeto no GitHub.

**O que foi feito:**
- **Edição de Empresas**: Adicionada funcionalidade de editar dados técnicos (CNPJ, Token, URL Base) para administradores, com botões de ação condicionais por perfil.
- **Máscara de CNPJ**: Implementada máscara dinâmica (`00.000.000/0001-00`) durante a digitação e exibição na listagem.
- **UX Financeira**: Redesenhado o modal de detalhes da pesquisa com dashboard de métricas (Contratos/Boletos/Saldo) e listagem expansível, seguindo o padrão modern dark.
- **Robustez Backend**: Ativado `trust proxy` para correta captura de IPs e adicionado controle de cache no backend para evitar dados desatualizados no frontend.
- **Gestão de Git**: Criado `.gitignore` robusto, inicializado repositório local e publicado no GitHub: `https://github.com/wmorato/ms-argos`.
