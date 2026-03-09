/**
 * ICrmProvider - Interface genérica para adapters de CRM
 * Todos os CRMs devem implementar: searchClient, getInvoices
 */
class ICrmProvider {
    constructor(company) {
        if (new.target === ICrmProvider) {
            throw new Error('ICrmProvider é uma interface abstrata e não pode ser instanciada diretamente.');
        }
        this.company = company;
    }

    /**
     * Busca cliente pelo CPF/CNPJ
     * @param {string} document - CPF ou CNPJ (apenas dígitos)
     * @returns {Promise<CrmResult>}
     */
    async searchClient(document) {
        throw new Error('searchClient() não implementado.');
    }

    /**
     * Busca boletos/faturas de um contrato
     * @param {string} contractId
     * @returns {Promise<Invoice[]>}
     */
    async getInvoices(contractId) {
        throw new Error('getInvoices() não implementado.');
    }
}

module.exports = { ICrmProvider };
