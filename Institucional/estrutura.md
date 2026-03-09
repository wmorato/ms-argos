#seguir regras globais em complemento itens abaixo

#Arquitetura
Frontend
- react
Backend
- nodejs

#Docker

#Metodologia
- SOLID
- Clean Code
- TDD

#Banco de dados
- postgres: usuario u_bd_ms-credit senha: @çeçod@d0s!

#serviços
- Email
- base de dados apenas as bases das empresas conveniadas com acesso via API e token

#CRM
- SGP TSMX - ok
- criar estrutura para escala e adição de novos crms

#segurança
- jwt
- bcrypt
- https 
- captchat  para evitar robôs
-cors
- Todas as funções serão executadas de dentro do servidor
- as chamadas só poderão ter origem de dentro do ambiente seguro.



#empresas
- CNPJ
- Nome
- site
- CRM ?
- TOKEN
- nome do token ( mandatorio, de acordo com cada crm): chatbot

#usuarios vinculado a empresa
- wilsonmorato@hotmail.com - admin - senha @Palmeirascampeao
- dados:
- trocar a senha no primeiro acesso.

#paginas
Home page

Boas Vindas
Descrição da ferramenta
Ecossistema para empresas trocarem informações sobre clientes inadimplentes. ( verificar se é permitido esses termos por lei )

tela de contato
tela de login

Logado

#Dashboard de estatisticas

#Pagina de empresas conveniadas

#Pagina de pesquisa
- seguir modelo ja criado @piloto/index.html

Log com todas as pesquisas realizadas
- data
- Empresa
- obs: verificar questoes legais, se nao tiver mais detalhes seguir com modelo simplificado.


#pagina administração
Cadastrar empresa e usuario

#pagina de pagamento placehold em construção

#PS
- devido a lei de proteção de dados, não podemos armazenar dados pessoais dos clientes.
- vamos apenas fazer a consulta e retornar o resultado para o usuario.
- não vamos armazenar dados pessoais dos clientes.
- não vamos armazenar dados pessoais dos usuarios.
- não vamos armazenar dados pessoais das empresas.
- vamos dar a opção de enviar para por email da empresa que esta consultando.
