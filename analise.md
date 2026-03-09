# Análise do Projeto — ms-argos

## Visão Geral
Sistema de consulta centralizada de histórico de clientes para provedores de internet.

## Estrutura Atual
- **Frontend**: React (Vite) + Lucide Icons + React Toastify. Organizado por módulos (/pages).
- **Backend**: Node.js + Express + PostgreSQL.
- **Docker-First**: Totalmente containerizado com suporte a multi-ambiente (dev/prod).

## Modificações Recentes (2026-03-09)
1. **Refatoração de Pastas**: 
   - Objetivo: Escalabilidade e organização.
   - Padrão: `src/pages/{feature}/{Page}.jsx`.
2. **UX de Pesquisa**: 
   - Mudança: De Cards expandidos para Modal.
   - Detalhes Técnicos: Uso de `createRoot` portal para o Modal.
3. **Gestão de Usuários**:
   - Implementada edição completa (Nome, Email, Senha, Perfil, Empresa).
   - Adicionado controle de status (Ativo/Inativo) direto na listagem.

## Próximos Passos
- Implementação real da página de pagamentos.
- Integração com mais CRMs (Tsmx e SGP já mapeados via adapter).
- Testes automatizados de UI (Playwright).
- Implementação de auditoria (Logs detalhados de quem alterou o quê).
