const { SgpTsmxAdapter } = require('./SgpTsmxAdapter');

/**
 * Factory: cria o adapter correto baseado no campo crm da empresa
 */
function createCrmAdapter(company) {
    switch (company.crm) {
        case 'sgp_tsmx':
            return new SgpTsmxAdapter(company);
        default:
            throw new Error(`CRM não suportado: ${company.crm}`);
    }
}

module.exports = { createCrmAdapter };
