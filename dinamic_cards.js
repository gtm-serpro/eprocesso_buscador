// =============================================================================
// EXEMPLOS PRÁTICOS DE USO - RESULT CARDS MANAGER
// =============================================================================

// =============================================================================
// EXEMPLO 1: Carregar dados de uma API/Solr
// =============================================================================

async function loadResultsFromAPI() {
    try {
        // Mostrar loading
        showLoading();

        // Fazer requisição
        const response = await fetch('/api/busca?q=processo&page=1');
        const data = await response.json();

        // Renderizar resultados
        ResultCardsManager.render(data.results, data.total);

        // Esconder loading
        hideLoading();
    } catch (error) {
        console.error('Erro ao carregar resultados:', error);
        showError('Erro ao carregar resultados. Tente novamente.');
    }
}

// =============================================================================
// EXEMPLO 2: Carregar dados de um JSON local
// =============================================================================

async function loadFromJSON() {
    try {
        const response = await fetch('data/resultados.json');
        const data = await response.json();
        
        ResultCardsManager.render(data.resultados, data.total);
    } catch (error) {
        console.error('Erro ao carregar JSON:', error);
    }
}

// =============================================================================
// EXEMPLO 3: Adicionar cards progressivamente (infinite scroll)
// =============================================================================

let currentOffset = 0;
const BATCH_SIZE = 10;

async function loadMoreResults() {
    try {
        const response = await fetch(`/api/busca?offset=${currentOffset}&limit=${BATCH_SIZE}`);
        const data = await response.json();

        // Adicionar cada resultado ao final
        data.results.forEach(result => {
            ResultCardsManager.addCard(result, 'end');
        });

        currentOffset += BATCH_SIZE;
    } catch (error) {
        console.error('Erro ao carregar mais resultados:', error);
    }
}

// Implementar infinite scroll
function setupInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadMoreResults();
        }
    }, { threshold: 0.5 });

    const sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    document.querySelector('.results-container').appendChild(sentinel);
    observer.observe(sentinel);
}

// =============================================================================
// EXEMPLO 4: Busca em tempo real com debounce
// =============================================================================

function setupRealtimeSearch() {
    const searchInput = document.querySelector('.search-input');
    
    const debouncedSearch = Utils.debounce(async (query) => {
        if (query.length < 3) return; // Mínimo 3 caracteres

        try {
            const response = await fetch(`/api/busca?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            ResultCardsManager.render(data.results, data.total);
        } catch (error) {
            console.error('Erro na busca:', error);
        }
    }, 500);

    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });
}

// =============================================================================
// EXEMPLO 5: Integração completa com Solr
// =============================================================================

const SolrIntegration = {
    baseUrl: 'https://eprocesso-buscador.receita.fazenda/solr/eprocesso',
    
    async search(query, page = 1, rows = 10) {
        const start = (page - 1) * rows;
        const params = new URLSearchParams({
            q: query || '*:*',
            start: start,
            rows: rows,
            wt: 'json',
            indent: 'true'
        });

        try {
            const response = await fetch(`${this.baseUrl}/select?${params}`);
            const data = await response.json();

            return {
                results: data.response.docs.map(doc => this.transformDoc(doc)),
                total: data.response.numFound,
                time: data.responseHeader.QTime
            };
        } catch (error) {
            console.error('Erro ao buscar no Solr:', error);
            throw error;
        }
    },

    transformDoc(doc) {
        return {
            titulo: doc.titulo_s || doc.tipo_documento_s || 'Documento',
            pdfUrl: doc.url_pdf || '#',
            pdfUrlBlank: doc.url_pdf_blank || '#',
            fields: [
                { label: 'Número do processo', value: doc.processo_s },
                { label: 'Data protocolo', value: this.formatDate(doc.dt_protocolo_tdt) },
                { label: 'Data juntada', value: this.formatDate(doc.dt_juntada_tdt) },
                { label: 'Tipo documento', value: doc.tipo_documento_s },
                { label: 'Unidade origem', value: doc.unidade_origem_s },
                { label: 'NI do Contribuinte', value: doc.ni_contribuinte_s },
                { label: 'Nome do Contribuinte', value: doc.nome_contribuinte_s },
                { label: 'Tributo ACT', value: doc.tributo_act_s }
            ].filter(f => f.value)
        };
    },

    formatDate(isoDate) {
        if (!isoDate) return null;
        const date = new Date(isoDate);
        return date.toLocaleString('pt-BR');
    }
};

// Usar integração Solr
async function searchSolr(query) {
    try {
        showLoading();
        
        const data = await SolrIntegration.search(query, 1, 10);
        
        ResultCardsManager.render(data.results, data.total);
        
        // Mostrar tempo de busca
        console.log(`Busca realizada em ${data.time}ms`);
        
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Erro ao realizar busca');
    }
}

// =============================================================================
// EXEMPLO 6: Exportar resultados
// =============================================================================

function setupExportButtons() {
    const exportButtons = document.querySelectorAll('.export-btn');
    
    exportButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const format = btn.dataset.format;
            
            try {
                const query = document.querySelector('.search-input').value || '*:*';
                const url = `${SolrIntegration.baseUrl}/select?q=${encodeURIComponent(query)}&wt=${format}&rows=1000`;
                
                // Download do arquivo
                window.location.href = url;
            } catch (error) {
                console.error('Erro ao exportar:', error);
            }
        });
    });
}

// =============================================================================
// EXEMPLO 7: Cache de resultados
// =============================================================================

const ResultsCache = {
    cache: new Map(),
    maxAge: 5 * 60 * 1000, // 5 minutos

    set(key, value) {
        this.cache.set(key, {
            data: value,
            timestamp: Date.now()
        });
    },

    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const age = Date.now() - cached.timestamp;
        if (age > this.maxAge) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    },

    clear() {
        this.cache.clear();
    }
};

// Usar cache na busca
async function searchWithCache(query, page = 1) {
    const cacheKey = `${query}_${page}`;
    
    // Verificar cache
    const cached = ResultsCache.get(cacheKey);
    if (cached) {
        console.log('✅ Resultado do cache');
        ResultCardsManager.render(cached.results, cached.total);
        return;
    }

    // Buscar novo
    try {
        const data = await SolrIntegration.search(query, page);
        
        // Salvar no cache
        ResultsCache.set(cacheKey, data);
        
        ResultCardsManager.render(data.results, data.total);
    } catch (error) {
        console.error('Erro na busca:', error);
    }
}

// =============================================================================
// EXEMPLO 8: Animações ao adicionar/remover cards
// =============================================================================

const AnimatedCards = {
    fadeIn(card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    },

    fadeOut(card) {
        return new Promise(resolve => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '0';
            card.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                card.remove();
                resolve();
            }, 300);
        });
    },

    staggeredLoad(cards, delay = 100) {
        cards.forEach((card, index) => {
            setTimeout(() => {
                this.fadeIn(card);
            }, index * delay);
        });
    }
};

// =============================================================================
// EXEMPLO 9: Filtrar resultados já carregados (client-side)
// =============================================================================

function filterLoadedResults(filterFn) {
    const cards = document.querySelectorAll('.result-card');
    
    cards.forEach(card => {
        const shouldShow = filterFn(card);
        card.style.display = shouldShow ? 'block' : 'none';
    });
}

// Exemplo: filtrar por tipo de documento
function filterByTipoDocumento(tipo) {
    filterLoadedResults(card => {
        const tipoField = card.querySelector('[data-field="tipo-documento"] .field-value');
        return tipoField?.textContent.includes(tipo);
    });
}

// =============================================================================
// EXEMPLO 10: Loading states
// =============================================================================

function showLoading() {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Carregando resultados...</p>
        </div>
    `;
}

function hideLoading() {
    const loading = document.querySelector('.loading-state');
    if (loading) loading.remove();
}

function showError(message) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = `
        <div class="error-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>Erro</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary">Tentar novamente</button>
        </div>
    `;
}

// =============================================================================
// INICIALIZAÇÃO COMPLETA
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistema de cards
    ResultCardsManager.init();
    
    // Configurar busca em tempo real
    setupRealtimeSearch();
    
    // Configurar botões de exportação
    setupExportButtons();
    
    // Configurar scroll infinito (opcional)
    // setupInfiniteScroll();
    
    // Fazer busca inicial
    searchWithCache('*:*', 1);
    
    console.log('✅ Sistema de cards inicializado!');
});

// =============================================================================
// EXPOR FUNÇÕES ÚTEIS PARA O CONSOLE
// =============================================================================

window.loadResults = loadResultsFromAPI;
window.searchSolr = searchSolr;
window.filterByTipo = filterByTipoDocumento;
window.clearCache = () => ResultsCache.clear();

// Teste rápido
window.quickTest = async () => {
    console.log('🧪 Executando teste rápido...');
    
    const mockResults = [
        {
            titulo: 'TESTE - AUTO DE INFRAÇÃO',
            pdfUrl: '#',
            fields: [
                { label: 'Processo', value: '12345678901234567' },
                { label: 'Contribuinte', value: 'TESTE EMPRESA LTDA' },
                { label: 'Data', value: '01/01/2024 10:00' }
            ]
        }
    ];
    
    ResultCardsManager.render(mockResults, 1);
    console.log('✅ Teste concluído! 1 card renderizado.');
};