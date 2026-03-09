Usuario abre a interface web e faz login.
acessa a pagina de pesquisa.
digita o cpf ou cnpj do cliente.
clica em pesquisar.
o algoritmo faz a pesquisa nos bancos de dados de todas as empersas conveniadas.
as chamadas são feitas assincronas e em paralelo.
conforme as respostas chegam, elas são exibidas na interface.
exemplo:
Provedo A : Cliente não encontrado.
Provedo B : Ciente possui 2 contratos , multa e mensalidades pendentes no valor de R$ 1.000,00. 
Provedo C : Ciente possui 1 contrato, multa e mensalidades pendentes no valor de R$ 2.000,00.
em cada provedor tem o botao para consultar os boletos em aberto e qual endereço os debitos se referem.


é uma ferramenta para criar mecanismos para que os provedores possam se defender de clientes que não pagam suas contas.


#fluxo Consulta

consulta cliente
consulta contratos do cliente
consulta boletos dos contratos