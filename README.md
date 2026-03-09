# ms-argos — Argos Hub

Hub centralizado para pesquisa de histórico de clientes em múltiplos provedores conveniados (ISPs e similares).

## Objetivo
Empresas de internet se unem para compartilhar, de forma segura e anonimizada, o histórico de inadimplência de clientes — permitindo tomar decisões melhores na contratação de serviços.

## Arquitetura

```
ms-argos/
├── frontend/        # React + Vite (SPA em /argos/)
│   └── src/pages/   # Estrutura modular (/login, /dashboard, /search...)
├── backend/         # Node.js + Express REST API (porta 5040)
├── docker/          # Dockerfiles + docker-compose + backup
├── data/            # schema.sql do PostgreSQL
├── Institucional/   # Documentos do projeto (diretrizes, avaliação, fluxo)
├── Piloto/          # Protótipo HTML original (referência)
├── Collection/      # Coleções Postman da API SGP
└── testes/          # Suite de health check
```

## Stack
| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite 7 + React Router 6 |
| Backend | Node.js 20 + Express 4 |
| Banco de Dados | PostgreSQL 16 |
| Auth | JWT + bcrypt |
| CRM Adapter | SGP TSMX (extensível via ICrmProvider) |
| Infraestrutura | Docker (compose v2) + Nginx |

## Acessos e Portas
| Serviço | Porta | Rota Nginx |
|---------|-------|-----------|
| Backend API | 5040 | `/argos/api/` |
| Frontend | 5041 | `/argos/` |
| PostgreSQL | 5441 | — interno |

## Executar

### Primeira vez
```bash
cd /var/www/ms-argos/docker
sudo docker compose up -d --build
```

### Rebuild completo
```bash
sudo docker rm -f argos-backend argos-frontend argos-postgres argos-backup
sudo docker compose build --no-cache
sudo docker compose up -d
```

### Verificar saúde
```bash
bash /var/www/ms-argos/testes/health_check.sh
```

## Credenciais Padrão
| Usuário | E-mail | Senha | Perfil |
|---------|--------|-------|--------|
| Wilson Morato | wilsonmorato@hotmail.com | @Palmeirascampeao | admin |
| Wilson Morato | wilsonmorato@gmail.com   | @Palmeirascampeao | dev |

## Segurança (LGPD)
- ✅ Nenhum dado pessoal do cliente consultado é armazenado
- ✅ Log de pesquisas contém apenas hash SHA-256 do CPF, tipo, data e empresa
- ✅ CPF ofuscado na interface — padrão `123.***.***-00`
- ✅ JWT com expiração de 8h
- ✅ bcrypt com 12 rounds
- ✅ CORS restrito a origens autorizadas
- ✅ Rate limiting (100 req/15min)

## CRM Adapters
O sistema usa o **Adapter Pattern** para suportar múltiplos CRMs.
Para adicionar um novo CRM:
1. Crie `backend/src/crm/SeuCrmAdapter.js` implementando `ICrmProvider`
2. Registre no `CrmFactory.js`
3. Cadastre a empresa com `crm: 'seu_crm'` no banco

## Backup
- Automático via container `argos-backup` — a cada 1 hora
- Arquivo: `database/ms-argos-postgres_ms_argos_YYYYMMDD_HHMMSS.bkp`
- Retenção: 7 dias

## Fase 1 — Status
- [x] Setup base: React + Node.js + PostgreSQL + Docker
- [x] Autenticação: login, JWT, bcrypt, troca de senha obrigatória
- [x] Cadastro de empresa via painel admin
- [x] Página de pesquisa com CPF mascarado
- [x] Adapter Pattern para CRMs (SGP TSMX implementado)
- [x] Log de consultas LGPD-compliant
- [x] Dashboard com estatísticas
- [x] Gestão de usuários
- [x] Página de pagamento (placeholder)
- [x] Nginx configurado
- [x] Testes de health check
