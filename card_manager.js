// =============================================================================
// RESULT CARDS MANAGER - Sistema de Cards Dinâmicos
// =============================================================================

const ResultCardsManager = {
    container: null,
    currentPage: 1,
    totalPages: 0,
    resultsPerPage: 10,

    init() {
        this.container = document.getElementById('resultsContainer');
        this.attachPaginationEvents();
    },

    // Renderizar múltiplos cards
    render(results, totalResults = 0) {
        if (!this.container) return;

        // Limpar container
        this.container.innerHTML = '';

        // Se não houver resultados
        if (!results || results.length === 0) {
            this.renderEmpty();
            return;
        }

        // Renderizar cada card
        results.forEach(result => {
            const card = this.createCard(result);
            this.container.appendChild(card);
        });

        // Atualizar informações de paginação
        this.updatePaginationInfo(totalResults);

        // Adicionar eventos de clique nos campos
        this.attachCopyEvents();
    },

    // Criar um card individual
    createCard(data) {
        const card = document.createElement('article');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="result-header">
                <div class="result-icon">
                    <a href="${data.pdfUrl || '#'}" aria-label="Visualizar PDF">
                        <img src="img/file-pdf-solid-full.svg" alt="">
                    </a>
                    <a href="${data.pdfUrlBlank || '#'}" aria-label="Visualizar PDF em branco">
                        <img src="img/file-pdf-regular-full.svg" alt="">
                    </a>
                </div>
                <span>${data.titulo || 'Sem título'}</span>
            </div>

            <div class="result-grid">
                ${this.createFields(data.fields)}
            </div>
        `;

        return card;
    },

    // Criar os campos do card
    createFields(fields) {
        if (!fields || fields.length === 0) return '';

        return fields.map(field => `
            <div class="result-field" data-field="${this.slugify(field.label)}">
                <div class="field-label">${field.label}</div>
                <div class="field-value">${field.value || '-'}</div>
            </div>
        `).join('');
    },

    // Renderizar estado vazio
    renderEmpty() {
        this.container.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <h3>Nenhum resultado encontrado</h3>
                <p>Tente ajustar os filtros ou fazer uma nova busca</p>
            </div>
        `;
    },

    // Adicionar eventos de cópia
    attachCopyEvents() {
        const fields = this.container.querySelectorAll('.result-field');
        fields.forEach(field => {
            field.addEventListener('click', () => {
                const value = field.querySelector('.field-value')?.textContent.trim();
                if (value && value !== '-') {
                    Clipboard.copy(value);
                }
            });
        });
    },

    // Converter texto em slug
    slugify(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    },

    // Atualizar informações de paginação
    updatePaginationInfo(totalResults) {
        this.totalPages = Math.ceil(totalResults / this.resultsPerPage);

        const resultsFoundEl = document.querySelector('.results-found');
        const pageNumEl = document.querySelector('.page-num');
        const pageCountEl = document.querySelector('.page-count');

        if (resultsFoundEl) resultsFoundEl.textContent = totalResults;
        if (pageNumEl) pageNumEl.textContent = this.currentPage;
        if (pageCountEl) pageCountEl.textContent = this.totalPages;

        // Atualizar botões de paginação
        this.updatePaginationButtons();
    },

    // Atualizar estado dos botões de paginação
    updatePaginationButtons() {
        const prevBtn = document.querySelector('.pagination button:first-child');
        const nextBtn = document.querySelector('.pagination button:last-child');

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= this.totalPages;
        }
    },

    // Adicionar eventos de paginação
    attachPaginationEvents() {
        const prevBtn = document.querySelector('.pagination button:first-child');
        const nextBtn = document.querySelector('.pagination button:last-child');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousPage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextPage());
        }
    },

    // Ir para página anterior
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadPage(this.currentPage);
        }
    },

    // Ir para próxima página
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadPage(this.currentPage);
        }
    },

    // Carregar página específica
    async loadPage(page) {
        // Implementar requisição ao servidor/Solr
        console.log(`Carregando página ${page}...`);
        
        // Exemplo de como seria a requisição:
        try {
            const response = await this.fetchResults(page);
            this.render(response.results, response.total);
        } catch (error) {
            console.error('Erro ao carregar página:', error);
        }
    },

    // Buscar resultados (implementar conforme sua API)
    async fetchResults(page) {
        const start = (page - 1) * this.resultsPerPage;
        const query = document.querySelector('.search-input')?.value || '*:*';
        
        const url = `${CONFIG.SOLR_BASE_URL}/select?q=${encodeURIComponent(query)}&start=${start}&rows=${this.resultsPerPage}&wt=json`;

        const response = await fetch(url);
        const data = await response.json();

        // Transformar dados do Solr para formato do card
        return {
            total: data.response.numFound,
            results: data.response.docs.map(doc => this.transformSolrDoc(doc))
        };
    },

    // Transformar documento Solr para formato do card
    transformSolrDoc(doc) {
        return {
            titulo: doc.titulo_s || doc.tipo_documento_s || 'Documento sem título',
            pdfUrl: doc.url_pdf_s || '#',
            pdfUrlBlank: doc.url_pdf_blank_s || '#',
            fields: [
                { label: 'Número do processo', value: doc.processo_s },
                { label: 'Data anexação', value: this.formatDate(doc.dt_anexacao_tdt) },
                { label: 'Data protocolo', value: this.formatDate(doc.dt_protocolo_tdt) },
                { label: 'Data juntada', value: this.formatDate(doc.dt_juntada_tdt) },
                { label: 'Unidade origem', value: doc.unidade_origem_s },
                { label: 'Equipe origem', value: doc.equipe_origem_s },
                { label: 'Tipo documento', value: doc.tipo_documento_s },
                { label: 'Grupo processo', value: doc.grupo_processo_s },
                { label: 'Tipo processo', value: doc.tipo_processo_s },
                { label: 'Subtipo processo', value: doc.subtipo_processo_s },
                { label: 'NI do Contribuinte', value: doc.ni_contribuinte_s },
                { label: 'Nome do Contribuinte', value: doc.nome_contribuinte_s },
                { label: 'Nome Equipe Atual', value: doc.nome_equipe_atual_s },
                { label: 'Nome Unidade Atual', value: doc.nome_unidade_atual_s },
                { label: 'CPF Responsável', value: doc.cpf_responsavel_s },
                { label: 'Nome usuário juntada', value: doc.nome_usuario_juntada_doc_s },
                { label: 'Tributo ACT', value: doc.tributo_act_s },
                { label: 'Trecho', value: doc.trecho_txt }
            ].filter(field => field.value) // Remove campos vazios
        };
    },

    // Formatar data do Solr
    formatDate(solrDate) {
        if (!solrDate) return null;
        
        const date = new Date(solrDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    },

    // Adicionar um card individual (útil para atualizações em tempo real)
    addCard(data, position = 'end') {
        const card = this.createCard(data);
        
        if (position === 'start') {
            this.container.insertBefore(card, this.container.firstChild);
        } else {
            this.container.appendChild(card);
        }

        this.attachCopyEvents();
    },

    // Remover um card
    removeCard(index) {
        const cards = this.container.querySelectorAll('.result-card');
        if (cards[index]) {
            cards[index].remove();
        }
    },

    // Limpar todos os cards
    clear() {
        this.container.innerHTML = '';
    }
};

// =============================================================================
// EXEMPLO DE USO
// =============================================================================

// Exemplo 1: Dados mockados para teste
const mockData = [
    {
        titulo: 'AUTO DE INFRAÇÃO - IRPJ',
        pdfUrl: '#',
        pdfUrlBlank: '#',
        fields: [
            { label: 'Número do processo', value: '11065720723201585' },
            { label: 'Data anexação', value: '16/04/2015 17:00' },
            { label: 'Data protocolo', value: '10/03/2015 03:00' },
            { label: 'Data juntada', value: '14/04/2015 13:31' },
            { label: 'Unidade origem', value: 'RS SÃO SEBASTIÃO DO CAÍ ARF' },
            { label: 'Tipo documento', value: 'IMPUGNAÇÃO' },
            { label: 'Grupo processo', value: 'PROCESSO TRIBUTÁRIO' },
            { label: 'NI do Contribuinte', value: '92315332000183' },
            { label: 'Nome do Contribuinte', value: 'MK QUÍMICA DO BRASIL LTDA' },
            { label: 'Tributo ACT', value: '20 - IRPJ - Imposto sobre a Renda da Pessoa Jurídica' }
        ]
    },
    {
        titulo: 'NOTIFICAÇÃO DE LANÇAMENTO - COFINS',
        pdfUrl: '#',
        pdfUrlBlank: '#',
        fields: [
            { label: 'Número do processo', value: '10580350820191234' },
            { label: 'Data anexação', value: '20/05/2019 14:30' },
            { label: 'Data protocolo', value: '15/05/2019 09:15' },
            { label: 'Tipo documento', value: 'NOTIFICAÇÃO' },
            { label: 'Grupo processo', value: 'PROCESSO TRIBUTÁRIO' },
            { label: 'NI do Contribuinte', value: '12345678000199' },
            { label: 'Nome do Contribuinte', value: 'EMPRESA EXEMPLO LTDA' },
            { label: 'Tributo ACT', value: '35 - COFINS' }
        ]
    }
];

// =============================================================================
// INTEGRAÇÃO COM O SISTEMA EXISTENTE
// =============================================================================

// Atualizar o FilterManager para renderizar cards após aplicar filtros
const originalApply = FilterManager.apply;
FilterManager.apply = function() {
    originalApply.call(this);
    
    // Após aplicar filtros, carregar resultados
    ResultCardsManager.loadPage(1);
};

// Atualizar Search.submit para carregar resultados
const originalSubmit = Search.submit;
Search.submit = function() {
    originalSubmit.call(this);
    
    // Carregar resultados após busca
    ResultCardsManager.loadPage(1);
};

// =============================================================================
// INICIALIZAÇÃO
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    ResultCardsManager.init();
    
    // EXEMPLO: Carregar dados mockados para demonstração
    // Remova isso em produção
    setTimeout(() => {
        ResultCardsManager.render(mockData, 123);
    }, 500);
});

// =============================================================================
// FUNÇÕES AUXILIARES PARA TESTES
// =============================================================================

// Gerar dados aleatórios para teste
function generateMockResults(count = 10) {
    const tipos = ['AUTO DE INFRAÇÃO', 'NOTIFICAÇÃO', 'IMPUGNAÇÃO', 'RECURSO'];
    const tributos = ['IRPJ', 'CSLL', 'PIS', 'COFINS', 'IPI'];
    
    return Array.from({ length: count }, (_, i) => ({
        titulo: `${tipos[i % tipos.length]} - ${tributos[i % tributos.length]}`,
        pdfUrl: '#',
        pdfUrlBlank: '#',
        fields: [
            { label: 'Número do processo', value: `${10000000000000000 + i}` },
            { label: 'Data protocolo', value: `${String(i + 1).padStart(2, '0')}/01/2024 10:00` },
            { label: 'Tipo documento', value: tipos[i % tipos.length] },
            { label: 'NI do Contribuinte', value: `${10000000000000 + i}` },
            { label: 'Nome do Contribuinte', value: `EMPRESA ${i + 1} LTDA` },
            { label: 'Tributo ACT', value: `${(i % 5) + 1} - ${tributos[i % tributos.length]}` }
        ]
    }));
}

// Teste rápido via console
window.testCards = function(count = 5) {
    const mockResults = generateMockResults(count);
    ResultCardsManager.render(mockResults, count);
    console.log(`✅ ${count} cards renderizados com sucesso!`);
};

// Expor para uso global
window.ResultCardsManager = ResultCardsManager;