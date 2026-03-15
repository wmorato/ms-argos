#!/bin/bash
# ============================================================
# ms-argos — Testes de Saúde dos Serviços
# Executa validações incrementais a cada execução
# ============================================================

BASE_URL="http://localhost:5040"
FRONTEND_URL="http://localhost:5041"
PASS=0
FAIL=0
TOTAL=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}  ✅ $1${NC}"; ((PASS++)); ((TOTAL++)); }
fail() { echo -e "${RED}  ❌ $1${NC}"; ((FAIL++)); ((TOTAL++)); }

echo ""
echo "========================================"
echo "  ms-argos — Health Check Suite"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

# ---- 1. Backend healthcheck ----
echo "[ 1 ] Backend API"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL/api/health" 2>/dev/null || echo "000")
if [ "$STATUS" = "200" ]; then
  BODY=$(curl -s --max-time 10 "$BASE_URL/api/health")
  ok "GET /api/health → $STATUS | $BODY"
else
  fail "GET /api/health → $STATUS (esperado 200)"
fi

# ---- 2. Login com credenciais válidas ----
echo ""
echo "[ 2 ] Autenticação"
LOGIN_RES=$(curl -s --max-time 20 -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"wilsonmorato@hotmail.com","password":"@Palmeirascampeao"}')

TOKEN=$(echo "$LOGIN_RES" | jq -r '.token // empty' 2>/dev/null)

if [ -n "$TOKEN" ]; then
  ok "POST /api/auth/login → token obtido (${#TOKEN} chars)"
else
  fail "POST /api/auth/login → falhou: $(echo "$LOGIN_RES" | head -c 100)"
fi

# ---- 3. Dashboard (autenticado) ----
echo ""
echo "[ 3 ] Dashboard"
if [ -n "$TOKEN" ]; then
  DASH=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/dashboard" 2>/dev/null || echo "000")
  [ "$DASH" = "200" ] && ok "GET /api/dashboard → $DASH" || fail "GET /api/dashboard → $DASH"
else
  fail "Skipped — sem token"
fi

# ---- 4. Listagem de empresas ----
echo ""
echo "[ 4 ] Empresas"
if [ -n "$TOKEN" ]; then
  COMP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/companies" 2>/dev/null || echo "000")
  if [ "$COMP" = "200" ]; then
    COUNT=$(curl -s --max-time 10 -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/companies" | jq '.companies | length' 2>/dev/null || echo "?")
    ok "GET /api/companies → $COMP ($COUNT empresa(s) cadastrada(s))"
  else
    fail "GET /api/companies → $COMP"
  fi
else
  fail "Skipped — sem token"
fi

# ---- 5. Endpoint sem token (deve retornar 401) ----
echo ""
echo "[ 5 ] Segurança (rota protegida sem token)"
UNAUTH=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL/api/companies" 2>/dev/null || echo "000")
[ "$UNAUTH" = "401" ] && ok "Rota sem token retorna 401 (correto)" || fail "Rota sem token retorna $UNAUTH (esperado 401)"

# ---- 6. Login inválido (deve retornar 401) ----
echo ""
echo "[ 6 ] Credenciais inválidas"
BAD=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"hacker@x.com","password":"errado"}' 2>/dev/null || echo "000")
[ "$BAD" = "401" ] && ok "Login inválido retorna 401 (correto)" || fail "Login inválido retorna $BAD (esperado 401)"

# ---- 7. Frontend container ----
echo ""
echo "[ 7 ] Frontend"
FE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$FRONTEND_URL/argos/" 2>/dev/null || echo "000")
[ "$FE" = "200" ] && ok "GET $FRONTEND_URL/argos/ → $FE" || fail "GET $FRONTEND_URL/argos/ → $FE"

# ---- 8. PostgreSQL via Docker ----
echo ""
echo "[ 8 ] Banco de Dados"
if docker exec argos-postgres pg_isready -U u_bd_ms_argos -d ms_argos > /dev/null 2>&1; then
  ok "PostgreSQL (argos-postgres) respondendo"
else
  fail "PostgreSQL não respondeu"
fi

# ---- 9. Nginx rota /argos/api/ ----
echo ""
echo "[ 9 ] Nginx → /argos/api/"
NGINX_API=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://moratosolucoes.com.br/argos/api/health" 2>/dev/null || echo "000")
[ "$NGINX_API" = "200" ] && ok "HTTPS /argos/api/health → $NGINX_API" || fail "HTTPS /argos/api/health → $NGINX_API (verifique nginx)"

# ---- 10. Test Mode (Acme) ----
echo ""
echo "[ 10 ] Modo Teste (Empresa Acme)"
ACME_LOGIN=$(curl -s --max-time 15 -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"wilsonmorato@gmail.com","password":"changeme123"}')
ACME_TOKEN=$(echo "$ACME_LOGIN" | jq -r '.token // empty' 2>/dev/null)

if [ -n "$ACME_TOKEN" ] && [ "$ACME_TOKEN" != "null" ]; then
  SEARCH_RES=$(curl -s --max-time 15 -X POST "$BASE_URL/api/search" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACME_TOKEN" \
    -d '{"document":"12345678901"}')
  
  IS_TEST=$(echo "$SEARCH_RES" | jq -r '.isTestMode // false' 2>/dev/null)
  RES_COUNT=$(echo "$SEARCH_RES" | jq -r '.results | length' 2>/dev/null)
  
  if [ "$IS_TEST" = "true" ] && [ "$RES_COUNT" = "3" ]; then
    ok "Busca CPF em Modo Teste retornou 3 resultados e isTestMode=true"
  else
    fail "Modo Teste falhou: isTestMode=$IS_TEST, results=$RES_COUNT"
  fi
else
  fail "Falha no login da Acme para teste de modo teste: $ACME_LOGIN"
fi

# ---- Resultado ----
echo ""
echo "========================================"
echo "  Resultado: $PASS/$TOTAL passaram"
if [ $FAIL -gt 0 ]; then
  echo -e "  ${RED}$FAIL falha(s) detectada(s)${NC}"
else
  echo -e "  ${GREEN}Todos os testes passaram!${NC}"
fi
echo "========================================"
echo ""

[ $FAIL -gt 0 ] && exit 1 || exit 0
