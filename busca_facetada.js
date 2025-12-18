// =============================================================================
// FACETED SEARCH MANAGER - Sistema de Busca Facetada Dinâmica
// =============================================================================

const FacetedSearchManager = {
    container: null,
    activeFacets: new Map(), // Facetas ativas selecionadas pelo usuário
    
    init() {
        this.container = document.querySelector('.faceted-search');
        if (!this.container) {
            console.warn('Container de busca facetada não encontrado');
            return;
        }
    },

    // Renderizar todas as facetas
    render(facetsData) {
        if (!this.container) return;

        // Limpar conteúdo atual (manter apenas o título)
        const title = this.container.querySelector('.faceted-title');
        this.container.innerHTML = '';
        if (title) this.container.appendChild(title);

        // Renderizar cada grupo de facetas
        facetsData.forEach(facetGroup => {
            const groupElement = this.createFacetGroup(facetGroup);
            this.container.appendChild(groupElement);
        });

        // Adicionar eventos
        this.attachEvents();
    },

    // Criar um grupo de facetas
    createFacetGroup(facetGroup) {
        const group = document.createElement('div');
        group.className = 'facet-group';
        group.dataset.field = facetGroup.field;

        // Label do grupo
        const label = document.createElement('div');
        label.className = 'facet-label';
        label.textContent = facetGroup.label;
        group.appendChild(label);

        // Itens da faceta
        facetGroup.items.forEach(item => {
            const facetItem = this.createFacetItem(item, facetGroup.field);
            group.appendChild(facetItem);
        });

        return group;
    },

    // Criar um item de faceta
    createFacetItem(item, field) {
        const facetItem = document.createElement('div');
        facetItem.className = 'facet-item';
        
        // Se já está ativo
        if (this.isActive(field, item.value)) {
            facetItem.classList.add('active');
        }

        facetItem.innerHTML = `
            <a href="#" class="facet-link" data-field="${field}" data-value="${item.value}">
                ${item.label}
            </a>
            <span class="facet-badge">${item.count}</span>
        `;

        return facetItem;
    },

    // Verificar se uma faceta está ativa
    isActive(field, value) {
        const activeFacets = this.activeFacets.get(field);
        return activeFacets && activeFacets.includes(value);
    },

    // Adicionar eventos de clique
    attachEvents() {
        const facetLinks = this.container.querySelectorAll('.facet-link');
        
        facetLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleFacet(link.dataset.field, link.dataset.value);
            });
        });
    },

    // Alternar faceta (adicionar/remover)
    toggleFacet(field, value) {
        const facets = this.activeFacets.get(field) || [];
        const index = facets.indexOf(value);

        if (index > -1) {
            // Remover faceta
            facets.splice(index, 1);
            if (facets.length === 0) {
                this.activeFacets.delete(field);
            }
        } else {
            // Adicionar faceta
            facets.push(value);
            this.activeFacets.set(field, facets);
        }

        // Atualizar visual
        this.updateActiveState(field, value);

        // Executar busca com facetas
        this.applyFacets();
    },

    // Atualizar estado visual da faceta
    updateActiveState(field, value) {
        const link = this.container.querySelector(
            `.facet-link[data-field="${field}"][data-value="${value}"]`
        );
        
        if (link) {
            link.closest('.facet-item').classList.toggle('active');
        }
    },

    // Aplicar facetas à busca
    async applyFacets() {
        // Construir query com facetas
        const query = this.buildFacetQuery();
        
        console.log('Aplicando facetas:', query);

        try {
            // Buscar com facetas aplicadas
            const data = await this.searchWithFacets(query);
            
            // Renderizar resultados
            ResultCardsManager.render(data.results, data.total);
            
            // Atualizar contadores das facetas
            this.updateFacetCounts(data.facets);
            
        } catch (error) {
            console.error('Erro ao aplicar facetas:', error);
        }
    },

    // Construir query Solr com facetas
    buildFacetQuery() {
        const mainQuery = document.querySelector('.search-input')?.value || '*:*';
        const facetQueries = [];

        this.activeFacets.forEach((values, field) => {
            values.forEach(value => {
                facetQueries.push(`${field}:"${value}"`);
            });
        });

        if (facetQueries.length === 0) {
            return mainQuery;
        }

        return `${mainQuery} AND (${facetQueries.join(' OR ')})`;
    },

    // Buscar com facetas
    async searchWithFacets(query) {
        const params = new URLSearchParams({
            q: query,
            rows: 10,
            start: 0,
            wt: 'json',
            'facet': 'true',
            'facet.field': ['tipo_documento_s', 'grupo_processo_s', 'unidade_origem_s', 'tributo_act_s'],
            'facet.mincount': 1,
            'facet.limit': 20
        });

        const url = `${CONFIG.SOLR_BASE_URL}/select?${params}`;
        
        const response = await fetch(url);
        const data = await response.json();

        return {
            results: data.response.docs.map(doc => ResultCardsManager.transformSolrDoc(doc)),
            total: data.response.numFound,
            facets: this.parseFacets(data.facet_counts?.facet_fields || {})
        };
    },

    // Parsear facetas do Solr
    parseFacets(facetFields) {
        const parsed = {};

        Object.keys(facetFields).forEach(field => {
            const values = facetFields[field];
            parsed[field] = [];

            for (let i = 0; i < values.length; i += 2) {
                if (values[i + 1] > 0) {
                    parsed[field].push({
                        value: values[i],
                        count: values[i + 1]
                    });
                }
            }
        });

        return parsed;
    },

    // Atualizar contadores das facetas
    updateFacetCounts(facets) {
        Object.keys(facets).forEach(field => {
            facets[field].forEach(item => {
                const badge = this.container.querySelector(
                    `.facet-link[data-field="${field}"][data-value="${item.value}"] + .facet-badge`
                );
                
                if (badge) {
                    badge.textContent = item.count;
                }
            });
        });
    },

    // Limpar todas as facetas
    clearAll() {
        this.activeFacets.clear();
        
        // Remover classe active de todos os itens
        this.container.querySelectorAll('.facet-item.active').forEach(item => {
            item.classList.remove('active');
        });

        // Recarregar resultados sem filtros
        this.applyFacets();
    },

    // Obter facetas ativas
    getActiveFacets() {
        const facets = {};
        this.activeFacets.forEach((values, field) => {
            facets[field] = values;
        });
        return facets;
    },

    // Definir facetas ativas (útil para restaurar estado)
    setActiveFacets(facets) {
        this.activeFacets.clear();
        Object.keys(facets).forEach(field => {
            this.activeFacets.set(field, facets[field]);
        });
        this.applyFacets();
    }
};

// =============================================================================
// SOLR FACETS INTEGRATION - Integração específica com Solr
// =============================================================================

const SolrFacetsIntegration = {
    // Configuração dos campos de faceta
    facetFields: {
        'tipo_documento_s': 'Tipo de Documento',
        'grupo_processo_s': 'Grupo de Processo',
        'unidade_origem_s': 'Unidade',
        'tributo_act_s': 'Tributo',
        'situacao_s': 'Situação',
        'tipo_processo_s': 'Tipo de Processo'
    },

    // Carregar facetas iniciais
    async loadInitialFacets(query = '*:*') {
        try {
            const params = new URLSearchParams({
                q: query,
                rows: 0, // Não precisamos dos resultados, apenas das facetas
                wt: 'json',
                'facet': 'true',
                'facet.mincount': 1,
                'facet.limit': 20
            });

            // Adicionar todos os campos de faceta
            Object.keys(this.facetFields).forEach(field => {
                params.append('facet.field', field);
            });

            const url = `${CONFIG.SOLR_BASE_URL}/select?${params}`;
            const response = await fetch(url);
            const data = await response.json();

            return this.transformToFacetGroups(data.facet_counts?.facet_fields || {});
        } catch (error) {
            console.error('Erro ao carregar facetas:', error);
            return [];
        }
    },

    // Transformar resposta Solr em grupos de facetas
    transformToFacetGroups(facetFields) {
        const groups = [];

        Object.keys(facetFields).forEach(field => {
            const label = this.facetFields[field];
            if (!label) return;

            const items = [];
            const values = facetFields[field];

            for (let i = 0; i < values.length; i += 2) {
                const value = values[i];
                const count = values[i + 1];

                if (count > 0) {
                    items.push({
                        value: value,
                        label: value,
                        count: count
                    });
                }
            }

            if (items.length > 0) {
                groups.push({
                    field: field,
                    label: label,
                    items: items
                });
            }
        });

        return groups;
    },

    // Atualizar facetas com base em uma nova busca
    async updateFacets(query) {
        const facetGroups = await this.loadInitialFacets(query);
        FacetedSearchManager.render(facetGroups);
    }
};

// =============================================================================
// FACET VISUALIZATIONS - Visualizações adicionais
// =============================================================================

const FacetVisualizations = {
    // Criar facetas com barras de progresso
    createProgressBar(item, maxCount) {
        const percentage = (item.count / maxCount) * 100;
        
        return `
            <div class="facet-item-with-bar">
                <div class="facet-info">
                    <a href="#" class="facet-link">${item.label}</a>
                    <span class="facet-badge">${item.count}</span>
                </div>
                <div class="facet-progress">
                    <div class="facet-progress-bar" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    },

    // Criar facetas colapsáveis
    createCollapsibleGroup(facetGroup) {
        return `
            <div class="facet-group collapsible" data-field="${facetGroup.field}">
                <div class="facet-label collapsible-header">
                    <span>${facetGroup.label}</span>
                    <svg class="collapse-icon" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" fill="none"/>
                    </svg>
                </div>
                <div class="facet-items">
                    ${facetGroup.items.map(item => `
                        <div class="facet-item">
                            <a href="#" class="facet-link">${item.label}</a>
                            <span class="facet-badge">${item.count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Adicionar funcionalidade de colapsar
    makeCollapsible() {
        document.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', () => {
                const group = header.closest('.facet-group');
                group.classList.toggle('collapsed');
            });
        });
    }
};

// =============================================================================
// FACET SEARCH - Busca dentro das facetas
// =============================================================================

const FacetSearch = {
    // Adicionar campo de busca em um grupo de facetas
    addSearchBox(facetGroup) {
        const searchBox = document.createElement('div');
        searchBox.className = 'facet-search-box';
        searchBox.innerHTML = `
            <input type="text" 
                   class="facet-search-input" 
                   placeholder="Buscar..." 
                   data-field="${facetGroup.dataset.field}">
        `;

        const label = facetGroup.querySelector('.facet-label');
        label.after(searchBox);

        const input = searchBox.querySelector('input');
        input.addEventListener('input', (e) => {
            this.filterFacetItems(facetGroup, e.target.value);
        });
    },

    // Filtrar itens de faceta
    filterFacetItems(facetGroup, searchTerm) {
        const items = facetGroup.querySelectorAll('.facet-item');
        const term = searchTerm.toLowerCase();

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(term) ? '' : 'none';
        });
    },

    // Adicionar busca em todos os grupos
    addToAllGroups() {
        document.querySelectorAll('.facet-group').forEach(group => {
            this.addSearchBox(group);
        });
    }
};

// =============================================================================
// EXEMPLOS DE DADOS MOCKADOS
// =============================================================================

const mockFacetsData = [
    {
        field: 'tipo_documento_s',
        label: 'Tipo de Documento',
        items: [
            { value: 'AUTO_INFRACAO', label: 'Auto de Infração', count: 156 },
            { value: 'NOTIFICACAO', label: 'Notificação', count: 89 },
            { value: 'IMPUGNACAO', label: 'Impugnação', count: 67 },
            { value: 'RECURSO', label: 'Recurso', count: 45 },
            { value: 'DECISAO', label: 'Decisão', count: 34 }
        ]
    },
    {
        field: 'grupo_processo_s',
        label: 'Grupo de Processo',
        items: [
            { value: 'PROCESSO_TRIBUTARIO', label: 'Processo Tributário', count: 234 },
            { value: 'PROCESSO_ADMINISTRATIVO', label: 'Processo Administrativo', count: 123 },
            { value: 'PROCESSO_JUDICIAL', label: 'Processo Judicial', count: 89 }
        ]
    },
    {
        field: 'unidade_origem_s',
        label: 'Unidade',
        items: [
            { value: 'SP_SAO_PAULO', label: 'SP - São Paulo', count: 178 },
            { value: 'RJ_RIO_JANEIRO', label: 'RJ - Rio de Janeiro', count: 145 },
            { value: 'MG_BELO_HORIZONTE', label: 'MG - Belo Horizonte', count: 98 },
            { value: 'RS_PORTO_ALEGRE', label: 'RS - Porto Alegre', count: 67 }
        ]
    },
    {
        field: 'tributo_act_s',
        label: 'Tributo',
        items: [
            { value: 'IRPJ', label: '20 - IRPJ', count: 145 },
            { value: 'CSLL', label: '30 - CSLL', count: 123 },
            { value: 'PIS', label: '10 - PIS', count: 98 },
            { value: 'COFINS', label: '35 - COFINS', count: 87 },
            { value: 'IPI', label: '05 - IPI', count: 56 }
        ]
    }
];

// =============================================================================
// INICIALIZAÇÃO
// =============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar gerenciador de facetas
    FacetedSearchManager.init();

    // OPÇÃO 1: Carregar facetas do Solr
    try {
        const facetGroups = await SolrFacetsIntegration.loadInitialFacets();
        FacetedSearchManager.render(facetGroups);
    } catch (error) {
        console.error('Erro ao carregar facetas do Solr:', error);
        
        // OPÇÃO 2: Usar dados mockados como fallback
        FacetedSearchManager.render(mockFacetsData);
    }

    // Adicionar busca nas facetas (opcional)
    // FacetSearch.addToAllGroups();

    console.log('✅ Sistema de facetas inicializado!');
});

// =============================================================================
// INTEGRAÇÃO COM BUSCA PRINCIPAL
// =============================================================================

// Atualizar facetas quando a busca principal mudar
const originalSearchSubmit = Search.submit;
Search.submit = async function() {
    originalSearchSubmit.call(this);
    
    const query = document.querySelector('.search-input')?.value || '*:*';
    await SolrFacetsIntegration.updateFacets(query);
};

// Limpar facetas quando limpar filtros
const originalClearAll = FilterManager.clearAll;
FilterManager.clearAll = function() {
    originalClearAll.call(this);
    FacetedSearchManager.clearAll();
};

// =============================================================================
// EXPOR PARA USO GLOBAL
// =============================================================================

window.FacetedSearchManager = FacetedSearchManager;
window.SolrFacetsIntegration = SolrFacetsIntegration;

// Testes rápidos
window.testFacets = () => {
    FacetedSearchManager.render(mockFacetsData);
    console.log('✅ Facetas mockadas renderizadas!');
};

window.clearFacets = () => {
    FacetedSearchManager.clearAll();
    console.log('✅ Facetas limpas!');
};