const fetch = require('node-fetch');
const FormData = require('form-data');
const { ICrmProvider } = require('./ICrmProvider');
const logger = require('../utils/logger');

/**
 * Adapter para o CRM SGP da TSMX
 * Implementa ICrmProvider
 */
class SgpTsmxAdapter extends ICrmProvider {
    constructor(company) {
        super(company);
        this.baseUrl = company.base_url;
        this.token = company.token;
        this.tokenName = company.token_name || 'chatbot';
    }

    async searchClient(document) {
        try {
            const cleanDoc = document.replace(/\D/g, '');
            const form = new FormData();
            form.append('token', this.token);
            form.append('app', this.tokenName);
            form.append('cpfcnpj', cleanDoc);

            const response = await fetch(`${this.baseUrl}api/ura/consultacliente/`, {
                method: 'POST',
                body: form,
                timeout: 10000,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const contracts = data.dados || data.contratos || [];

            if (!contracts.length) {
                return {
                    provider: this.company.name,
                    companyId: this.company.id,
                    status: 'OK',
                    hasDebt: false,
                    message: 'Nenhum contrato ativo ou pendência encontrada neste provedor.',
                    contracts: [],
                    invoices: [],
                    address: null,
                    totalDebt: 0,
                };
            }

            // Busca boletos de cada contrato em paralelo
            const invoiceResults = await Promise.all(
                contracts.map(c => this.getInvoices(c.contratoId).catch(() => []))
            );

            let allInvoices = [];
            let address = '';

            contracts.forEach((c, i) => {
                if (c.endereco_logradouro && !address) {
                    address = `${c.endereco_logradouro}, ${c.endereco_numero} - ${c.endereco_bairro}`;
                }
                allInvoices = allInvoices.concat(invoiceResults[i] || []);
            });

            const totalDebt = allInvoices.reduce((sum, inv) => sum + (inv.valor || 0), 0);

            logger.info(`[SGP] ${this.company.name} → ${contracts.length} contrato(s), ${allInvoices.length} boleto(s)`);

            return {
                provider: this.company.name,
                companyId: this.company.id,
                status: allInvoices.length > 0 ? 'PENDING' : 'OK',
                hasDebt: allInvoices.length > 0,
                message: `${contracts.length} contrato(s) encontrado(s).${allInvoices.length > 0 ? ` Boletos pendentes: ${allInvoices.length}` : ''}`,
                contracts: contracts.map(c => ({ id: c.contratoId, name: c.nome })),
                invoices: allInvoices,
                address: address || 'Endereço não informado',
                totalDebt,
            };

        } catch (err) {
            logger.error(`[SGP] Erro em ${this.company.name}: ${err.message}`);
            return {
                provider: this.company.name,
                companyId: this.company.id,
                status: 'ERROR',
                hasDebt: false,
                message: 'Falha ao consultar a API do provedor.',
                isError: true,
                contracts: [],
                invoices: [],
                address: null,
                totalDebt: 0,
            };
        }
    }

    async getInvoices(contractId) {
        try {
            const form = new FormData();
            form.append('token', this.token);
            form.append('app', this.tokenName);
            form.append('contrato', contractId);

            const response = await fetch(`${this.baseUrl}api/ura/fatura2via/`, {
                method: 'POST',
                body: form,
                timeout: 8000,
            });

            const data = await response.json();
            return data.links || [];
        } catch (err) {
            logger.error(`[SGP] Erro ao buscar boletos contrato ${contractId}: ${err.message}`);
            return [];
        }
    }
}

module.exports = { SgpTsmxAdapter };
