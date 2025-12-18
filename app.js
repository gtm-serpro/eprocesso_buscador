// =============================================================================
// EPROCESSO BUSCADOR - CÓDIGO OTIMIZADO
// =============================================================================

// Constantes e Configurações
const CONFIG = {
    SOLR_BASE_URL: 'https://eprocesso-buscador.receita.fazenda/solr/eprocesso',
    AUTOCOMPLETE_LIMIT: 20,
    COPY_FEEDBACK_DURATION: 3000,
    OPERATORS: {
        contem: 'Contém',
        'nao-contem': 'Não Contém',
        igual: 'Igual'
    },
    FIELD_MAP: {
        'Grupo Processo': 'grupo_processo_s',
        'Tipo Processo': 'tipo_processo_s',
        'Subtipo Processo': 'subtipo_processo_s',
        'Nr Processo': 'processo_s',
        'Situação do Documento': 'situacao_s',
        'Assuntos/Objetos': 'assuntos_objetos_s',
        'Tipo do Documento': 'tipo_documento_s',
        'Título Documento': 'titulo_s',
        'Nr Doc Principal': 'numero_doc_principal_exp_s',
        'Tributo ACT': 'tributo_act_s',
        'Unidade de Origem do Documento': 'unidade_origem_s',
        'Equipe de Origem do Documento': 'equipe_origem_s',
        'Unidade Atual': 'nome_unidade_atual_s',
        'Equipe Atual': 'nome_equipe_atual_s',
        'NI Contribuinte': 'ni_contribuinte_s',
        'Nome do Contribuinte': 'nome_contribuinte_s',
        'CPF Responsável': 'cpf_responsavel_s',
        'Nome Usuário Juntada': 'nome_usuario_juntada_doc_s',
        'Nome Relator DRJ': 'nome_relator_drj_s',
        'Alegações no Recurso': 'aleg_recurso_contrib_txt',
        'Result Julgamento DRJ nível 1': 'result_questdrj_nivel1_s',
        'Result Julgamento DRJ nível 2': 'result_questdrj_nivel2_s'
    },
    DATE_FIELD_MAP: {
        'Protocolo': 'dt_protocolo_tdt',
        'Juntada': 'dt_juntada_tdt',
        'Registro': 'dt_registro_tdt',
        'Anexação': 'dt_anexacao_tdt'
    }
};

// =============================================================================
// UTILIDADES
// =============================================================================

const Utils = {
    // Formatar data de ISO para BR
    formatDate(isoDate) {
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    },

    // Escapar caracteres especiais do Solr
    escapeSolr(value) {
        return value.replace(/([+\-&|!(){}[\]^"~*?:\\])/g, '\\$1');
    },

    // Truncar texto longo
    truncate(text, maxLength = 50) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },

    // Obter data atual em formato ISO
    getTodayISO() {
        return new Date().toISOString().slice(0, 10);
    },

    // Debounce para otimizar eventos
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
};

// =============================================================================
// CLIPBOARD - Copiar valores dos campos
// =============================================================================

const Clipboard = {
    async copy(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showFeedback(text);
        } catch (err) {
            this.fallbackCopy(text);
        }
    },

    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            this.showFeedback(text);
        } catch (err) {
            console.error('Erro ao copiar:', err);
        }
        
        document.body.removeChild(textarea);
    },

    showFeedback(text) {
        const existing = document.querySelector('.copy-feedback');
        if (existing) existing.remove();

        const feedback = document.createElement('div');
        feedback.className = 'copy-feedback';
        feedback.innerHTML = `✓ Copiado: <strong>${Utils.truncate(text)}</strong>`;
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => feedback.remove(), 300);
        }, CONFIG.COPY_FEEDBACK_DURATION);
    }
};

// =============================================================================
// MODAL - Gerenciamento do modal de filtros
// =============================================================================

const Modal = {
    overlay: null,
    
    init() {
        this.overlay = document.getElementById('modalOverlay');
        this.attachEvents();
    },

    attachEvents() {
        // Botões de abertura/fechamento
        document.querySelector('.btn-filter')?.addEventListener('click', () => this.open());
        document.getElementById('closeModal')?.addEventListener('click', () => this.close());
        document.getElementById('btnCancel')?.addEventListener('click', () => this.close());

        // Fechar ao clicar no overlay
        this.overlay?.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) this.close();
        });
    },

    open() {
        this.overlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    close() {
        this.overlay?.classList.remove('active');
        document.body.style.overflow = 'auto';
    },

    isOpen() {
        return this.overlay?.classList.contains('active');
    }
};

// =============================================================================
// OPERATOR TOGGLE - Alternar operadores de busca
// =============================================================================

const OperatorToggle = {
    states: ['contem', 'nao-contem', 'igual'],

    init() {
        document.querySelectorAll('.operator-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => this.cycle(e.currentTarget));
        });
    },

    cycle(toggle) {
        const current = toggle.dataset.operator;
        const currentIndex = this.states.indexOf(current);
        const nextIndex = (currentIndex + 1) % this.states.length;
        const nextState = this.states[nextIndex];

        toggle.dataset.operator = nextState;
        toggle.querySelector('.operator-text').textContent = CONFIG.OPERATORS[nextState];
    },

    reset(toggle) {
        toggle.dataset.operator = 'contem';
        toggle.querySelector('.operator-text').textContent = CONFIG.OPERATORS['contem'];
    }
};

// =============================================================================
// FILTER MANAGER - Gerenciamento de filtros
// =============================================================================

const FilterManager = {
    appliedFilters: [],

    init() {
        document.getElementById('btnClear')?.addEventListener('click', () => this.clearAll());
        document.getElementById('btnApply')?.addEventListener('click', () => this.apply());
        document.getElementById('btnClearAllFilters')?.addEventListener('click', () => this.removeAll());
    },

    clearAll() {
        // Limpar inputs
        document.querySelectorAll('.filter-input, .date-input').forEach(input => {
            input.value = '';
        });

        // Resetar operadores
        document.querySelectorAll('.operator-toggle').forEach(toggle => {
            OperatorToggle.reset(toggle);
        });
    },

    apply() {
        this.appliedFilters = [];
        let solrQuery = '';

        // Coletar filtros de data
        const dateFilters = this.collectDateFilters();
        this.appliedFilters.push(...dateFilters.filters);
        solrQuery += dateFilters.solr;

        // Coletar filtros de texto
        const textFilters = this.collectTextFilters();
        this.appliedFilters.push(...textFilters.filters);
        solrQuery += textFilters.solr;

        // Coletar filtros de valor
        const valueFilters = this.collectValueFilters();
        this.appliedFilters.push(...valueFilters.filters);
        solrQuery += valueFilters.solr;

        // Atualizar busca principal
        if (solrQuery) {
            const searchInput = document.querySelector('.search-input');
            const currentQuery = searchInput.value.trim();
            searchInput.value = currentQuery ? `${currentQuery} ${solrQuery}` : solrQuery;
        }

        this.render();
        Modal.close();
    },

    collectDateFilters() {
        const filters = [];
        let solr = '';
        const today = Utils.getTodayISO();

        document.querySelectorAll('.filter-section').forEach(section => {
            const title = section.querySelector('.filter-section-title')?.textContent;
            if (!title?.includes('Data')) return;

            section.querySelectorAll('.filter-group').forEach(group => {
                const label = group.querySelector('.field-label')?.textContent.trim();
                const dateInputs = group.querySelectorAll('.date-input');
                const dateFrom = dateInputs[0]?.value;
                const dateTo = dateInputs[1]?.value;

                if (!dateFrom && !dateTo) return;

                // Determinar campo Solr
                const solrField = Object.entries(CONFIG.DATE_FIELD_MAP).find(([key]) => 
                    label.includes(key)
                )?.[1];

                if (solrField) {
                    const from = dateFrom ? `${dateFrom}T00:00:00Z` : '*';
                    const to = dateTo ? `${dateTo}T23:59:59Z` : `${today}T23:59:59Z`;
                    solr += `${solrField}:[${from} TO ${to}] `;
                }

                // Criar texto de exibição
                let displayValue;
                if (dateFrom && dateTo) {
                    displayValue = `${Utils.formatDate(dateFrom)} até ${Utils.formatDate(dateTo)}`;
                } else if (dateFrom) {
                    displayValue = `A partir de ${Utils.formatDate(dateFrom)}`;
                } else {
                    displayValue = `Até ${Utils.formatDate(dateTo)}`;
                }

                filters.push({
                    campo: label,
                    valor: displayValue,
                    operador: null,
                    tipo: 'data'
                });
            });
        });

        return { filters, solr };
    },

    collectTextFilters() {
        const filters = [];
        let solr = '';

        document.querySelectorAll('.filter-group').forEach(group => {
            const input = group.querySelector('.filter-input[type="text"]');
            if (!input?.value) return;

            const label = group.querySelector('.field-label')?.textContent.trim().replace(' (AUTO)', '');
            const value = input.value.trim();
            const toggle = group.querySelector('.operator-toggle');
            const operador = toggle?.dataset.operator || 'contem';

            const solrField = CONFIG.FIELD_MAP[label];
            if (solrField) {
                const escaped = Utils.escapeSolr(value);
                
                switch (operador) {
                    case 'nao-contem':
                        solr += `-${solrField}:*${escaped}* `;
                        break;
                    case 'igual':
                        solr += `${solrField}:"${escaped}" `;
                        break;
                    default: // contem
                        solr += `${solrField}:*${escaped}* `;
                }
            }

            filters.push({
                campo: label,
                valor: value,
                operador,
                tipo: 'texto'
            });
        });

        return { filters, solr };
    },

    collectValueFilters() {
        const filters = [];
        let solr = '';

        const valueGroups = document.querySelectorAll('.filter-value');
        valueGroups.forEach(group => {
            const inputs = group.querySelectorAll('.filter-input[type="number"]');
            const min = inputs[0]?.value || '*';
            const max = inputs[1]?.value || '*';

            if (min === '*' && max === '*') return;

            solr += `valor_processo_d:[${min} TO ${max}] `;

            let displayValue;
            if (min !== '*' && max !== '*') {
                displayValue = `R$ ${min} até R$ ${max}`;
            } else if (min !== '*') {
                displayValue = `Mínimo: R$ ${min}`;
            } else {
                displayValue = `Máximo: R$ ${max}`;
            }

            filters.push({
                campo: 'Valor',
                valor: displayValue,
                operador: null,
                tipo: 'valor'
            });
        });

        return { filters, solr };
    },

    render() {
        const container = document.getElementById('appliedFilters');
        const list = document.getElementById('appliedFiltersList');

        if (this.appliedFilters.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        list.innerHTML = '';

        this.appliedFilters.forEach((filter, index) => {
            const tag = this.createFilterTag(filter, index);
            list.appendChild(tag);
        });
    },

    createFilterTag(filter, index) {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.setAttribute('data-operador', filter.operador || 'null');

        let operadorHtml = '';
        if (filter.operador) {
            operadorHtml = `<span class="filter-operator">${CONFIG.OPERATORS[filter.operador]}</span>`;
        }

        tag.innerHTML = `
            <span class="filter-label">${filter.campo}:</span>
            ${operadorHtml}
            <span class="filter-value">"${filter.valor}"</span>
            <button class="filter-remove" data-index="${index}" title="Remover filtro">×</button>
        `;

        tag.querySelector('.filter-remove').addEventListener('click', () => {
            this.remove(index);
        });

        return tag;
    },

    remove(index) {
        this.appliedFilters.splice(index, 1);
        this.render();
    },

    removeAll() {
        this.appliedFilters = [];
        this.render();
        this.clearAll();
    }
};

// =============================================================================
// AUTOCOMPLETE - Sugestões de busca
// =============================================================================

const Autocomplete = {
    cache: new Map(),

    async fetchSuggestions(field, prefix) {
        const cacheKey = `${field}:${prefix}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const url = `${CONFIG.SOLR_BASE_URL}/terms?limit=${CONFIG.AUTOCOMPLETE_LIMIT}&terms.prefix=${prefix}&terms.sort=count&omitHeader=true&terms.fl=${field}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            const suggestions = [];
            
            const terms = data.terms[field] || [];
            for (let i = 0; i < terms.length; i += 2) {
                suggestions.push(terms[i]);
            }

            this.cache.set(cacheKey, suggestions);
            return suggestions;
        } catch (error) {
            console.error('Erro ao buscar sugestões:', error);
            return [];
        }
    },

    init() {
        const mainSearch = document.querySelector('.search-input');
        if (mainSearch && typeof $ !== 'undefined' && $.fn.autocomplete) {
            const debouncedLoad = Utils.debounce(async (input) => {
                const field = input.name === 'q' ? 'conteudo_txt' : input.name;
                const suggestions = await this.fetchSuggestions(field, input.value);
                
                $(input).autocomplete({
                    source: suggestions
                });

                $("[id^='ui-id-']").css('z-index', 9999);
            }, 300);

            mainSearch.addEventListener('keyup', function() {
                if (this.value.length >= 2) {
                    debouncedLoad(this);
                }
            });
        }
    }
};

// =============================================================================
// SEARCH - Funções de busca
// =============================================================================

const Search = {
    clear() {
        const input = document.querySelector('.search-input');
        input.value = '';
        input.focus();
    },

    submit() {
        const input = document.querySelector('.search-input');
        if (!input.value.trim()) {
            input.value = '*:*';
        }
        // Aqui você pode adicionar a lógica de submissão do formulário
    }
};

const input = document.getElementById('q');
const clearBtn = document.getElementById('clearBtn');

function toggleClearButton() {
    clearBtn.classList.toggle('is-visible', input.value.trim() !== '');
}

input.addEventListener('input', toggleClearButton);

clearBtn.addEventListener('click', () => {
    input.value = '';
    input.focus();
    toggleClearButton();
});

// =============================================================================
// RESULT CARDS - Interação com cards de resultado
// =============================================================================

const ResultCards = {
    init() {
        document.querySelectorAll('.result-field').forEach(field => {
            field.addEventListener('click', () => {
                const value = field.querySelector('.field-value')?.textContent.trim();
                if (value) Clipboard.copy(value);
            });
        });
    }
};

// =============================================================================
// INICIALIZAÇÃO
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    Modal.init();
    OperatorToggle.init();
    FilterManager.init();
    Autocomplete.init();
    ResultCards.init();

    // Expor funções globais necessárias
    window.clearMainSearch = () => Search.clear();
    window.checkQueryEmpty = () => Search.submit();
});

// Expor para uso no HTML inline (se necessário)
window.loadValues = function(input) {
    if (input.value.length >= 2) {
        const field = input.name === 'q' ? 'conteudo_txt' : input.name;
        Autocomplete.fetchSuggestions(field, input.value);
    }
};