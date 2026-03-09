document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const loginOverlay = document.getElementById('login-overlay');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    const searchForm = document.getElementById('search-form');
    const documentInput = document.getElementById('document-input');
    const searchBtn = document.getElementById('search-btn');
    const searchText = document.querySelector('.search-text');
    const spinner = document.querySelector('.spinner');

    const resultsContainer = document.getElementById('results-container');
    const resultsGrid = document.getElementById('results-grid');
    const searchQueryDisplay = document.querySelector('#search-query-display strong');
    const toggleCpfBtn = document.getElementById('toggle-cpf-btn');

    const quickFillItems = document.querySelectorAll('.quick-fill-item');

    let realDocumentValue = '';
    let obfuscationTimer = null;
    let isCpfVisible = false;

    // Funções de formato
    function getFormattedCpf(cpf) {
        if (!cpf) return '';
        let res = cpf.substring(0, 3);
        if (cpf.length > 3) res += '.' + cpf.substring(3, 6);
        if (cpf.length > 6) res += '.' + cpf.substring(6, 9);
        if (cpf.length > 9) res += '-' + cpf.substring(9, 11);
        return res;
    }

    function getMaskedCpf(cpf) {
        if (!cpf) return '';
        let mask = cpf.padEnd(11, '*').substring(0, 11);
        let first3 = mask.substring(0, 3);
        let rest = mask.substring(3).replace(/\d/g, '*');
        let blended = first3 + rest;
        return getFormattedCpf(blended);
    }

    // Providers Database Config (valores importados do credentials.js)
    const providersList = [
        {
            id: '1',
            name: 'IcarusNet',
            baseUrl: config.icarusnet.baseUrl,
            apiUrl: config.icarusnet.baseUrl + 'api/ura/consultacliente/',
            faturaUrl: config.icarusnet.baseUrl + 'api/ura/fatura2via/',
            token: config.icarusnet.token
        },
        {
            id: '2',
            name: 'Interbyte',
            baseUrl: config.interbyte.baseUrl,
            apiUrl: config.interbyte.baseUrl + 'api/ura/consultacliente/',
            faturaUrl: config.interbyte.baseUrl + 'api/ura/fatura2via/',
            token: config.interbyte.token
        }
    ];

    // Quick fill event
    quickFillItems.forEach(item => {
        item.addEventListener('click', () => {
            realDocumentValue = item.getAttribute('data-cpf');
            documentInput.value = isCpfVisible ? getFormattedCpf(realDocumentValue) : getMaskedCpf(realDocumentValue);
        });
    });

    // Handle Input
    documentInput.addEventListener('focus', () => {
        if (!isCpfVisible) {
            documentInput.value = getFormattedCpf(realDocumentValue);
        }
    });

    documentInput.addEventListener('input', (e) => {
        realDocumentValue = e.target.value.replace(/[^\d]/g, '').substring(0, 11);
        documentInput.value = getFormattedCpf(realDocumentValue);

        clearTimeout(obfuscationTimer);
        if (!isCpfVisible) {
            obfuscationTimer = setTimeout(() => {
                documentInput.value = getMaskedCpf(realDocumentValue);
            }, 1000);
        }
    });

    documentInput.addEventListener('blur', () => {
        clearTimeout(obfuscationTimer);
        if (!isCpfVisible && realDocumentValue) {
            documentInput.value = getMaskedCpf(realDocumentValue);
        }
    });

    // Eye button
    toggleCpfBtn.addEventListener('click', () => {
        isCpfVisible = !isCpfVisible;
        if (isCpfVisible) {
            clearTimeout(obfuscationTimer);
            documentInput.value = getFormattedCpf(realDocumentValue);
            toggleCpfBtn.textContent = '🙈';
        } else {
            documentInput.value = getMaskedCpf(realDocumentValue);
            toggleCpfBtn.textContent = '👁️';
        }
    });

    // Login Handle
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = usernameInput.value;
        const pass = passwordInput.value;

        if (user === 'admin' && pass === 'admin') {
            loginOverlay.classList.add('hidden');
            dashboard.classList.remove('hidden');
            loginError.classList.add('hidden');

            // Limpa os campos
            usernameInput.value = '';
            passwordInput.value = '';
        } else {
            loginError.classList.remove('hidden');
        }
    });

    // Logout Handle
    logoutBtn.addEventListener('click', () => {
        dashboard.classList.add('hidden');
        loginOverlay.classList.remove('hidden');

        // Limpa resultados
        resultsContainer.classList.add('hidden');
        resultsGrid.innerHTML = '';
        documentInput.value = '';
    });

    // Search Handle
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const docValue = realDocumentValue;
        if (!docValue) return;

        // UI State
        searchText.classList.add('hidden');
        spinner.classList.remove('hidden');
        searchBtn.disabled = true;

        resultsContainer.classList.remove('hidden');
        resultsGrid.innerHTML = '';
        searchQueryDisplay.textContent = getMaskedCpf(docValue);

        // API Calls
        const searchPromises = providersList.map(provider => {
            if (provider.isMock) {
                return mimicApiCall(provider, docValue);
            } else {
                return realApiCall(provider, docValue);
            }
        });

        // Process results as they come in
        searchPromises.forEach(promise => {
            promise.then(result => {
                if (result) renderResultCard(result);
            });
        });

        // Wait for all to finish to restore button state
        await Promise.all(searchPromises);

        searchText.classList.remove('hidden');
        spinner.classList.add('hidden');
        searchBtn.disabled = false;
    });

    // Simulate an API delay and response based on Postman collection context
    function mimicApiCall(provider, docValue) {
        return new Promise((resolve) => {
            const delay = Math.random() * 2000 + 500; // 0.5s to 2.5s delay

            setTimeout(() => {
                // Randomly determine if there's a debt based on document string length/chars for consistency MVP
                const isDebt = Math.random() > 0.5;

                if (!isDebt) {
                    resolve({
                        provider: provider.name,
                        status: 'OK',
                        message: 'Cliente não encontrado ou sem pendências.',
                        hasDebt: false
                    });
                } else {
                    const contractsCount = Math.floor(Math.random() * 3) + 1;
                    const amount = (Math.random() * 2000 + 100).toFixed(2);
                    resolve({
                        provider: provider.name,
                        status: 'PENDING',
                        message: `Cliente possui ${contractsCount} contrato(s), multas e mensalidades pendentes.`,
                        hasDebt: true,
                        debtAmount: amount,
                        address: 'Rua Exemplo, 123 - Centro'
                    });
                }
            }, delay);
        });
    }

    // Real API Call
    async function realApiCall(provider, docValue) {
        try {
            const formData = new FormData();
            formData.append('token', provider.token);
            formData.append('app', 'chatbot');
            formData.append('cpfcnpj', docValue.replace(/[^\d]/g, ''));

            const response = await fetch(provider.apiUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Analyze the SGP API pattern: it returns a `dados` ou `contratos` array.
            const contratosList = data.dados || data.contratos;

            if (contratosList && contratosList.length > 0) {
                let totalAberto = 0;
                let address = '';
                let todosBoletos = [];

                // Busca os boletos para cada contrato (Assíncrono e paralelo)
                const boletosPromises = contratosList.map(async (contrato) => {
                    if (contrato.endereco_logradouro && !address) {
                        address = `${contrato.endereco_logradouro}, ${contrato.endereco_numero} - ${contrato.endereco_bairro}`;
                    }

                    try {
                        const formBoletos = new FormData();
                        formBoletos.append('token', provider.token);
                        formBoletos.append('app', 'chatbot');
                        formBoletos.append('contrato', contrato.contratoId);

                        const resBoleto = await fetch(provider.faturaUrl, {
                            method: 'POST',
                            body: formBoletos
                        });

                        const dataBoleto = await resBoleto.json();

                        if (dataBoleto.links && dataBoleto.links.length > 0) {
                            return dataBoleto.links;
                        }
                    } catch (e) {
                        console.error('Erro ao buscar boletos', e);
                    }
                    return [];
                });

                const resultadosBoletos = await Promise.all(boletosPromises);

                resultadosBoletos.forEach(boletos => {
                    todosBoletos = todosBoletos.concat(boletos);
                });

                todosBoletos.forEach(boleto => {
                    totalAberto += boleto.valor || 0;
                });

                const isDebt = todosBoletos.length > 0;

                return {
                    provider: provider.name,
                    status: isDebt ? 'PENDING' : 'OK',
                    message: contratosList.length + ' contrato(s) encontrado(s).' + (isDebt ? ` Boletos pendentes: ${todosBoletos.length}` : ''),
                    hasDebt: isDebt,
                    debtAmount: isDebt ? totalAberto.toFixed(2) : 0,
                    address: address || 'Endereço não informado',
                    boletos: todosBoletos
                };
            } else {
                return {
                    provider: provider.name,
                    status: 'OK',
                    message: 'Nenhum contrato ativo ou pendência encontrada neste provedor.',
                    hasDebt: false
                };
            }
        } catch (error) {
            console.error('Provider Error:', provider.name, error);
            return {
                provider: provider.name,
                status: 'ERROR',
                message: 'Falha ao consultar a API do provedor.',
                hasDebt: false,
                isError: true
            };
        }
    }

    // Render individual card
    function renderResultCard(result) {
        const card = document.createElement('div');
        let statusClass = 'status-ok';
        let statusText = 'Nada Consta';

        if (result.hasDebt) {
            statusClass = 'status-pending';
            statusText = 'Pendências Encontradas';
        } else if (result.isError) {
            statusClass = 'status-error';
            statusText = 'Erro de Conexão';
        }

        card.className = `result-card ${statusClass}`;

        let contentHtml = `
            <div class="provider-header">
                <span class="provider-name">${result.provider}</span>
                <span class="provider-status">${statusText}</span>
            </div>
            <div class="result-details">
                <p>${result.message}</p>
        `;

        if (result.isError) {
            contentHtml += `
                <p style="color: var(--danger-color); font-size: 0.85rem; margin-top: 1rem;">O servidor pode estar bloqueando a conexão via navegador (CORS).</p>
             `;
        } else if (result.hasDebt) {

            let boletosHtml = '';
            if (result.boletos && result.boletos.length > 0) {
                boletosHtml = `
                    <div class="boletos-list hidden" id="boletos-${result.provider.replace(/\s+/g, '')}">
                        <table class="boletos-table">
                            <thead>
                                <tr>
                                    <th>Vencimento</th>
                                    <th>Valor</th>
                                    <th>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${result.boletos.map(b => `
                                    <tr>
                                        <td>${new Date(b.vencimento).toLocaleDateString()}</td>
                                        <td>R$ ${b.valor.toFixed(2)}</td>
                                        <td><a href="${b.link}" target="_blank" class="link-boleto">Boleto/Pix</a></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }

            contentHtml += `
                <p><strong>Endereço do Débito:</strong> ${result.address}</p>
                <div class="debt-amount">R$ ${result.debtAmount}</div>
                ${boletosHtml}
                <div class="card-actions">
                    <button class="btn-primary toggle-boletos-btn" data-target="boletos-${result.provider.replace(/\s+/g, '')}">Ver Boletos</button>
                    <button class="btn-secondary" onclick="alert('Detalhes do contrato em desenvolvimento.')">Ver Contrato</button>
                </div>
            `;
        } else {
            contentHtml += `
                <div class="card-actions" style="margin-top: 1rem;">
                    <button class="btn-success" onclick="alert('Funcionalidade de Viabilidade (APIura/viabilidade) em desenvolvimento.')">Verificar Disponibilidade</button>
                </div>
            `;
        }

        contentHtml += `</div>`;
        card.innerHTML = contentHtml;

        resultsGrid.appendChild(card);

        // Add event listener for boletos toggle
        const toggleBtn = card.querySelector('.toggle-boletos-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                const targetId = e.target.getAttribute('data-target');
                const boletosDiv = card.querySelector('#' + targetId);
                if (boletosDiv) {
                    boletosDiv.classList.toggle('hidden');
                    if (boletosDiv.classList.contains('hidden')) {
                        e.target.textContent = 'Ver Boletos';
                    } else {
                        e.target.textContent = 'Ocultar Boletos';
                    }
                }
            });
        }
    }
});
