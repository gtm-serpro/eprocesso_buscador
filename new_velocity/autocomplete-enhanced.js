// =============================================================================
// AUTOCOMPLETE MELHORADO - Mostra domínio ao clicar + filtra ao digitar
// =============================================================================

const EnhancedAutocomplete = {
    cache: new Map(),
    solrUrl: window.EPROCESSO_CONFIG?.solrBaseUrl || '/solr/eprocesso',
    
    // Configuração de campos que terão autocomplete
    fields: {
        'grupo_processo_s': { minLength: 0, limit: 50, cache: true },
        'tipo_processo_s': { minLength: 0, limit: 50, cache: true },
        'subtipo_processo_s': { minLength: 0, limit: 50, cache: true },
        'situacao_s': { minLength: 0, limit: 30, cache: true },
        'tipo_documento_s': { minLength: 0, limit: 50, cache: true },
        'tributo_act_s': { minLength: 0, limit: 30, cache: true },
        'unidade_origem_s': { minLength: 0, limit: 100, cache: true },
        'equipe_origem_s': { minLength: 0, limit: 100, cache: true },
        'nome_unidade_atual_s': { minLength: 0, limit: 100, cache: true },
        'nome_equipe_atual_s': { minLength: 0, limit: 100, cache: true },
        'aleg_recurso_contrib_txt': { minLength: 2, limit: 30, cache: false },
        'result_questdrj_nivel1_s': { minLength: 0, limit: 20, cache: true },
        'nome_relator_drj_s': { minLength: 2, limit: 50, cache: false }
    },

    // =============================================================================
    // INICIALIZAÇÃO
    // =============================================================================
    init() {
        console.log('🔍 Inicializando Enhanced Autocomplete...');
        
        // Verificar se jQuery está disponível
        if (typeof jQuery === 'undefined') {
            console.error('❌ jQuery não encontrado. Autocomplete desabilitado.');
            return;
        }

        // Inicializar autocomplete em todos os campos configurados
        this.initializeFields();
        
        console.log('✅ Enhanced Autocomplete inicializado!');
    },

    // =============================================================================
    // INICIALIZAR CAMPOS
    // =============================================================================
    initializeFields() {
        Object.keys(this.fields).forEach(fieldId => {
            const input = document.getElementById(fieldId);
            if (input) {
                this.setupAutocomplete(input, fieldId);
            }
        });
    },

    // =============================================================================
    // SETUP AUTOCOMPLETE PARA UM CAMPO
    // =============================================================================
    setupAutocomplete(input, fieldId) {
        const config = this.fields[fieldId];
        const self = this;

        // Configurar jQuery UI Autocomplete
        jQuery(input).autocomplete({
            minLength: config.minLength,
            delay: 300,
            autoFocus: true,
            
            // SOURCE: Buscar dados do Solr
            source: function(request, response) {
                self.fetchSuggestions(fieldId, request.term, config)
                    .then(suggestions => {
                        if (suggestions.length === 0) {
                            response([{ 
                                label: 'Nenhuma sugestão encontrada', 
                                value: '',
                                disabled: true 
                            }]);
                        } else {
                            response(suggestions);
                        }
                    })
                    .catch(error => {
                        console.error('Erro no autocomplete:', error);
                        response([]);
                    });
            },

            // SELECT: Quando usuário seleciona uma opção
            select: function(event, ui) {
                if (ui.item.disabled) {
                    return false;
                }
                
                // Feedback visual
                jQuery(input).addClass('autocomplete-selected');
                setTimeout(() => {
                    jQuery(input).removeClass('autocomplete-selected');
                }, 1000);
                
                return true;
            },

            // OPEN: Ao abrir o dropdown
            open: function() {
                const widget = jQuery(this).autocomplete('widget');
                widget.css('z-index', 10000);
                
                // Adicionar classe para estilização
                widget.addClass('enhanced-autocomplete-menu');
                
                // Highlighting do termo buscado
                const term = jQuery(input).val();
                if (term) {
                    self.highlightTerm(widget, term);
                }
            },

            // CLOSE: Ao fechar o dropdown
            close: function() {
                // Cleanup se necessário
            }
        });

        // EVENTO: Mostrar sugestões ao clicar (mesmo vazio)
        jQuery(input).on('focus click', function(e) {
            const currentValue = jQuery(this).val();
            
            // Se campo vazio ou com poucos caracteres, mostrar domínio completo
            if (currentValue.length < config.minLength) {
                jQuery(this).autocomplete('search', '');
            } else {
                jQuery(this).autocomplete('search', currentValue);
            }
        });

        // EVENTO: Debounce para busca ao digitar
        let typingTimer;
        jQuery(input).on('input', function() {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                jQuery(this).autocomplete('search', jQuery(this).val());
            }, 300);
        });

        // Adicionar indicador visual de que campo tem autocomplete
        this.addAutocompleteIndicator(input);
    },

    // =============================================================================
    // BUSCAR SUGESTÕES NO SOLR
    // =============================================================================
    async fetchSuggestions(fieldId, term, config) {
        // Verificar cache
        const cacheKey = `${fieldId}:${term || '_empty_'}`;
        
        if (config.cache && this.cache.has(cacheKey)) {
            console.log(`📦 Cache hit: ${cacheKey}`);
            return this.cache.get(cacheKey);
        }

        // Construir URL do Solr Terms
        const params = new URLSearchParams({
            'terms': 'true',
            'terms.fl': fieldId,
            'terms.sort': 'count',
            'terms.limit': config.limit,
            'terms.mincount': '1',
            'wt': 'json',
            'omitHeader': 'true'
        });

        // Se tem termo, adicionar prefix
        if (term && term.trim() !== '') {
            params.set('terms.prefix', term.trim());
        }

        const url = `${this.solrUrl}/terms?${params.toString()}`;

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            // Processar resposta do Solr
            const suggestions = this.parseSolrTerms(data, fieldId);
            
            // Cachear resultado
            if (config.cache) {
                this.cache.set(cacheKey, suggestions);
            }

            return suggestions;

        } catch (error) {
            console.error(`Erro ao buscar sugestões para ${fieldId}:`, error);
            return [];
        }
    },

    // =============================================================================
    // PARSEAR RESPOSTA DO SOLR TERMS
    // =============================================================================
    parseSolrTerms(data, fieldId) {
        const suggestions = [];
        
        if (!data.terms || !data.terms[fieldId]) {
            return suggestions;
        }

        const terms = data.terms[fieldId];
        
        // Terms vem como array: [value1, count1, value2, count2, ...]
        for (let i = 0; i < terms.length; i += 2) {
            const value = terms[i];
            const count = terms[i + 1];
            
            if (value && count > 0) {
                suggestions.push({
                    label: this.formatSuggestionLabel(value, count),
                    value: value,
                    count: count,
                    rawValue: value
                });
            }
        }

        return suggestions;
    },

    // =============================================================================
    // FORMATAR LABEL DA SUGESTÃO
    // =============================================================================
    formatSuggestionLabel(value, count) {
        // Truncar se muito longo
        let displayValue = value;
        if (value.length > 60) {
            displayValue = value.substring(0, 57) + '...';
        }

        // Adicionar contador
        const countFormatted = new Intl.NumberFormat('pt-BR').format(count);
        
        return `${displayValue} (${countFormatted})`;
    },

    // =============================================================================
    // HIGHLIGHT DO TERMO BUSCADO
    // =============================================================================
    highlightTerm(widget, term) {
        if (!term || term.trim() === '') return;

        const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
        
        widget.find('li').each(function() {
            const text = jQuery(this).text();
            const highlighted = text.replace(regex, '<mark>$1</mark>');
            jQuery(this).html(highlighted);
        });
    },

    // =============================================================================
    // ESCAPE REGEX
    // =============================================================================
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    // =============================================================================
    // ADICIONAR INDICADOR VISUAL
    // =============================================================================
    addAutocompleteIndicator(input) {
        // Verificar se já tem indicador
        if (input.parentElement.querySelector('.autocomplete-icon')) {
            return;
        }

        // Criar ícone
        const icon = document.createElement('span');
        icon.className = 'autocomplete-icon';
        icon.innerHTML = '▾';
        icon.title = 'Clique para ver sugestões';
        
        // Estilo inline (ou adicionar no CSS)
        icon.style.cssText = `
            position: absolute;
            right: 40px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
            font-size: 16px;
            pointer-events: none;
            z-index: 5;
        `;

        // Adicionar ao DOM
        const parent = input.parentElement;
        if (parent.style.position !== 'relative') {
            parent.style.position = 'relative';
        }
        parent.appendChild(icon);

        // Animação ao focar
        jQuery(input).on('focus', function() {
            jQuery(icon).css('color', '#1351B4');
        });

        jQuery(input).on('blur', function() {
            jQuery(icon).css('color', '#999');
        });
    },

    // =============================================================================
    // LIMPAR CACHE
    // =============================================================================
    clearCache(fieldId) {
        if (fieldId) {
            // Limpar cache de um campo específico
            for (const key of this.cache.keys()) {
                if (key.startsWith(`${fieldId}:`)) {
                    this.cache.delete(key);
                }
            }
            console.log(`🗑️ Cache limpo para ${fieldId}`);
        } else {
            // Limpar todo o cache
            this.cache.clear();
            console.log('🗑️ Todo cache limpo');
        }
    },

    // =============================================================================
    // PRÉ-CARREGAR DOMÍNIOS (opcional, para campos importantes)
    // =============================================================================
    async preloadDomains(fields) {
        console.log('📥 Pré-carregando domínios...');
        
        const fieldsToPreload = fields || [
            'tipo_documento_s',
            'grupo_processo_s',
            'tributo_act_s',
            'situacao_s'
        ];

        const promises = fieldsToPreload.map(fieldId => {
            const config = this.fields[fieldId];
            if (config) {
                return this.fetchSuggestions(fieldId, '', config);
            }
        });

        await Promise.all(promises);
        
        console.log('✅ Domínios pré-carregados!');
    }
};

// =============================================================================
// CSS ADICIONAL PARA AUTOCOMPLETE
// =============================================================================
const autocompleteCSS = `
<style>
/* Menu do autocomplete */
.enhanced-autocomplete-menu {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #1351B4 !important;
    border-radius: 4px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    font-family: 'Rawline', sans-serif !important;
}

.enhanced-autocomplete-menu .ui-menu-item {
    padding: 0 !important;
    margin: 0 !important;
    border-bottom: 1px solid #f0f0f0;
}

.enhanced-autocomplete-menu .ui-menu-item:last-child {
    border-bottom: none;
}

.enhanced-autocomplete-menu .ui-menu-item-wrapper {
    padding: 10px 12px !important;
    font-size: 13px !important;
    color: #333 !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
}

.enhanced-autocomplete-menu .ui-menu-item-wrapper:hover,
.enhanced-autocomplete-menu .ui-state-active {
    background-color: #e3f2fd !important;
    border: none !important;
    color: #1565c0 !important;
    font-weight: 500 !important;
}

.enhanced-autocomplete-menu .ui-menu-item-wrapper.ui-state-disabled {
    color: #999 !important;
    font-style: italic !important;
    cursor: default !important;
    background-color: #f5f5f5 !important;
}

/* Highlight do termo buscado */
.enhanced-autocomplete-menu mark {
    background-color: #ffeb3b;
    color: #333;
    font-weight: 600;
    padding: 0 2px;
    border-radius: 2px;
}

/* Feedback visual quando seleciona */
.autocomplete-selected {
    border-color: #4CAF50 !important;
    background-color: #e8f5e9 !important;
    transition: all 0.3s ease !important;
}

/* Loading indicator (opcional) */
.autocomplete-loading {
    position: relative;
}

.autocomplete-loading::after {
    content: '';
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #1351B4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: translateY(-50%) rotate(0deg); }
    100% { transform: translateY(-50%) rotate(360deg); }
}

/* Scrollbar customizada no menu */
.enhanced-autocomplete-menu::-webkit-scrollbar {
    width: 8px;
}

.enhanced-autocomplete-menu::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.enhanced-autocomplete-menu::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}

.enhanced-autocomplete-menu::-webkit-scrollbar-thumb:hover {
    background: #555;
}

/* Indicador de autocomplete disponível */
.autocomplete-icon {
    transition: all 0.2s ease;
}

input:focus + .autocomplete-icon {
    color: #1351B4 !important;
    transform: translateY(-50%) rotate(180deg) !important;
}
</style>
`;

// Injetar CSS
document.head.insertAdjacentHTML('beforeend', autocompleteCSS);

// =============================================================================
// INICIALIZAÇÃO AUTOMÁTICA
// =============================================================================
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar jQuery carregar
    if (typeof jQuery !== 'undefined') {
        EnhancedAutocomplete.init();
        
        // Opcional: Pré-carregar domínios importantes
        if (window.EPROCESSO_CONFIG?.preloadAutocomplete !== false) {
            setTimeout(() => {
                EnhancedAutocomplete.preloadDomains();
            }, 2000); // Aguardar 2s após load da página
        }
    } else {
        console.warn('⚠️ jQuery não encontrado. Autocomplete desabilitado.');
    }
});

// =============================================================================
// EXPOR GLOBALMENTE
// =============================================================================
window.EnhancedAutocomplete = EnhancedAutocomplete;

// Função para usar no Velocity (compatibilidade)
window.loadAutocomplete = function(input) {
    const fieldId = input.id;
    if (EnhancedAutocomplete.fields[fieldId]) {
        jQuery(input).autocomplete('search', input.value);
    }
};

// =============================================================================
// TESTES RÁPIDOS
// =============================================================================
window.testAutocomplete = function(fieldId) {
    const input = document.getElementById(fieldId);
    if (input) {
        input.focus();
        input.click();
        console.log(`✅ Testando autocomplete em: ${fieldId}`);
    } else {
        console.error(`❌ Campo não encontrado: ${fieldId}`);
    }
};

window.clearAutocompleteCache = function(fieldId) {
    EnhancedAutocomplete.clearCache(fieldId);
};

console.log(`
╔════════════════════════════════════════════╗
║  Enhanced Autocomplete v2.0 Carregado!    ║
║  - Mostra domínio ao clicar                ║
║  - Filtra conforme digita                  ║
║  - Cache inteligente                       ║
║  - Highlight de termos                     ║
╚════════════════════════════════════════════╝

Comandos disponíveis:
  testAutocomplete('campo_s')
  clearAutocompleteCache('campo_s')
  EnhancedAutocomplete.preloadDomains()
`);