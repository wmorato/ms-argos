# Histórico de Execuções — ms-argos

## 2026-03-09 — Implementação Completa Fase 1

**Tarefa:** Implementar o projeto ms-argos com base no piloto existente (`Piloto/`) e nos documentos institucionais (`Institucional/`).

**O que foi feito:**
- Criada estrutura completa do projeto: `frontend/`, `backend/`, `docker/`, `data/`, `testes/`, `doc/`
- **Backend** Node.js + Express com: autenticação JWT+bcrypt, adapter pattern para CRMs (ICrmProvider → SgpTsmxAdapter), CRUD de empresas e usuários (soft delete), log de pesquisas LGPD-compliant (hash SHA-256), rate limiting, CORS restrito
- **Frontend** React + Vite with: login with JWT, sidebar glassmorphism, pesquisa com CPF mascarado (padrão `123.***.***-00`), resultados em tempo real por cards, tabela de boletos expansível, dashboard com estatísticas, admin de empresas/usuários, logs, página de pagamento (placeholder)
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

## 2026-03-09 — Implementação de Edição de Usuários

**Tarefa:** Implementar funcionalidade de edição de usuários e alternância de status (ativo/inativo) no painel administrativo, seguindo o padrão da página de empresas.

**O que foi feito:**
- **Frontend**: Adicionada a lógica de edição em `UsersPage.jsx`, incluindo o estado `editingId`, funções `handleEdit` e `handleToggle`.
- **UX**: Atualizada a interface de usuários com botões de Ações (Editar, Ativar/Desativar, Remover) e formulário dinâmico que permite atualizar perfil, empresa vinculada e senha (opcional).
- **Backend Robustez**: Atualizada a rota `PATCH /api/users/:id` para suportar atualização de e-mail e senha (com hash bcrypt), além de permitir desvincular empresa (admin global).
- **Validação**: Executado rebuild dos containers (`argos-frontend`, `argos-backend`) e validado via `health_check.sh` (9/9 OK).

## 2026-03-09 — Remoção de Ofuscagem na Pesquisa

**Tarefa:** Remover a ofuscagem automática do CPF durante a digitação na página de pesquisa.

**O que foi feito:**
- **Frontend**: Modificada a lógica em `SearchPage.jsx` para remover o `timerRef` e o `setTimeout` que escondiam os dígitos após 1.2 segundos.
- **UX**: Alterado o estado inicial `visible` para `true`, garantindo que o CPF digitado permaneça visível por padrão, mantendo o botão de "olho" funcional para ocultação manual se desejado.
- **Validação**: Frontend rebuildado e container `argos-frontend` reiniciado.

## 2026-03-09 — Implementação de Layout Responsivo (Mobile)

**Tarefa:** Implementar layout compatível com dispositivos móveis (celular) em todo o sistema.

**O que foi feito:**
- **Layout Global**: Modificado `Layout.jsx` e `Layout.module.css` para incluir um header mobile com menu hamburger e uma sidebar que se transforma em drawer deslizante em telas menores que 1024px.
- **Páginas Administrativas**: Ajustados `AdminPage.module.css`, `CompaniesPage` e `UsersPage` para que formulários e tabelas se adaptem a telas pequenas (grids de 1 coluna e scroll lateral para tabelas).
- **Pesquisa**: Otimizado `SearchPage.module.css` para que os cards de resultado, o painel de testes rápidos e o modal de detalhes sejam totalmente responsivos.
- **Validação**: Frontend rebuildado (`argos-frontend`) e validado.

## 2026-03-09 — Correção de Layout Mobile (Sidebar)

**Tarefa:** Corrigir problema onde o menu lateral ocupava metade da tela no celular em vez de ficar recolhido.

**O que foi feito:**
- **Layout CSS**: Alterada a propriedade `flex-direction` do container `.layout` para `column` em telas mobile, garantindo que o header e o conteúdo principal ocupem toda a largura e não fiquem lado a lado.
- **Sidebar**: Reforçado o posicionamento `fixed` e ajuste do `left` negativo para garantir que o menu fique totalmente oculto fora da área visível quando fechado.
- **Validação**: Frontend rebuildado e testado.

