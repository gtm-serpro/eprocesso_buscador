// =============================================================================
// MOCK DATA COMPLETO - Facetas e Cards
// Sistema de dados mockados realistas para testes
// =============================================================================

const MockDataGenerator = {
    // =============================================================================
    // CONFIGURAÇÕES BASE
    // =============================================================================
    
    config: {
        unidades: [
            'SP - São Paulo ARF',
            'RJ - Rio de Janeiro ARF',
            'MG - Belo Horizonte ARF',
            'RS - Porto Alegre ARF',
            'PR - Curitiba ARF',
            'BA - Salvador ARF',
            'DF - Brasília ARF',
            'PE - Recife ARF',
            'CE - Fortaleza ARF',
            'GO - Goiânia ARF'
        ],
        
        tiposDocumento: [
            'AUTO DE INFRAÇÃO',
            'NOTIFICAÇÃO DE LANÇAMENTO',
            'IMPUGNAÇÃO',
            'RECURSO VOLUNTÁRIO',
            'DECISÃO DRJ',
            'ACÓRDÃO',
            'MANIFESTAÇÃO DE INCONFORMIDADE',
            'DESPACHO DECISÓRIO',
            'TERMO DE REVELIA',
            'CERTIDÃO'
        ],
        
        gruposProcesso: [
            'PROCESSO TRIBUTÁRIO',
            'PROCESSO ADMINISTRATIVO',
            'PROCESSO DE RESTITUIÇÃO',
            'PROCESSO DE CONSULTA',
            'PROCESSO DE RECONHECIMENTO DE IMUNIDADE'
        ],
        
        tributos: [
            { code: '20', name: 'IRPJ - Imposto sobre a Renda da Pessoa Jurídica' },
            { code: '30', name: 'CSLL - Contribuição Social sobre o Lucro Líquido' },
            { code: '10', name: 'PIS/PASEP' },
            { code: '35', name: 'COFINS - Contribuição para Financiamento da Seguridade Social' },
            { code: '05', name: 'IPI - Imposto sobre Produtos Industrializados' },
            { code: '25', name: 'IRPF - Imposto sobre a Renda da Pessoa Física' },
            { code: '15', name: 'IOF - Imposto sobre Operações Financeiras' },
            { code: '40', name: 'CIDE - Contribuição de Intervenção no Domínio Econômico' }
        ],
        
        situacoes: [
            'EM ANÁLISE',
            'AGUARDANDO JULGAMENTO',
            'JULGADO',
            'ARQUIVADO',
            'CANCELADO',
            'EM RECURSO',
            'TRÂNSITO EM JULGADO'
        ],
        
        empresas: [
            { cnpj: '12345678000190', nome: 'INDÚSTRIA BRASILEIRA DE ALIMENTOS LTDA' },
            { cnpj: '98765432000123', nome: 'COMÉRCIO E DISTRIBUIDORA NACIONAL S/A' },
            { cnpj: '11223344000156', nome: 'TECNOLOGIA E INOVAÇÃO BRASIL LTDA' },
            { cnpj: '55667788000199', nome: 'SERVIÇOS EMPRESARIAIS INTEGRADOS LTDA' },
            { cnpj: '99887766000145', nome: 'CONSTRUÇÃO E ENGENHARIA DO SUL S/A' },
            { cnpj: '44556677000188', nome: 'TRANSPORTES E LOGÍSTICA EXPRESS LTDA' },
            { cnpj: '77889900000123', nome: 'QUÍMICA INDUSTRIAL DO BRASIL LTDA' },
            { cnpj: '33445566000167', nome: 'METALÚRGICA E FUNDIÇÃO NACIONAL S/A' },
            { cnpj: '66778899000134', nome: 'PRODUTOS FARMACÊUTICOS BRASIL LTDA' },
            { cnpj: '22334455000178', nome: 'AGRICULTURA E PECUÁRIA MODERNA S/A' }
        ],
        
        responsaveis: [
            { cpf: '12345678901', nome: 'MARIA SILVA SANTOS' },
            { cpf: '98765432109', nome: 'JOÃO OLIVEIRA SOUZA' },
            { cpf: '11223344556', nome: 'ANA PAULA FERREIRA' },
            { cpf: '55667788990', nome: 'CARLOS EDUARDO LIMA' },
            { cpf: '99887766554', nome: 'PATRICIA COSTA ALMEIDA' },
            { cpf: '44556677889', nome: 'ROBERTO PEREIRA SILVA' },
            { cpf: '77889900112', nome: 'JULIANA MARTINS ROCHA' },
            { cpf: '33445566778', nome: 'FERNANDO SANTOS OLIVEIRA' }
        ],
        
        trechos: [
            'exclusão indevida de valores correspondentes a subvenções para investimento do lucro real',
            'não recolhimento de tributos sobre operações de importação de mercadorias',
            'compensação de créditos de PIS/COFINS considerados indevidos pela fiscalização',
            'dedução de despesas não comprovadas ou não relacionadas à atividade',
            'omissão de receitas detectadas através de levantamento bancário',
            'falta de recolhimento de IRRF sobre pagamentos a beneficiários não identificados',
            'creditamento indevido de IPI na aquisição de insumos não tributados',
            'glosa de créditos presumidos de ICMS utilizados indevidamente',
            'apropriação de créditos de PIS/COFINS sobre aquisições de não contribuintes',
            'desconsideração de custos por falta de documentação fiscal idônea'
        ]
    },

    // =============================================================================
    // GERADOR DE DATAS
    // =============================================================================
    
    generateRandomDate(start, end) {
        const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return date;
    },

    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    },

    // =============================================================================
    // GERADOR DE NÚMERO DE PROCESSO
    // =============================================================================
    
    generateProcessNumber() {
        const year = 2020 + Math.floor(Math.random() * 5);
        const sequential = String(Math.floor(Math.random() * 99999) + 10000);
        const regional = String(Math.floor(Math.random() * 99) + 10);
        const type = String(Math.floor(Math.random() * 9) + 1);
        
        return `${sequential}.${sequential}${year}${regional}${type}`;
    },

    // =============================================================================
    // GERADOR DE VALOR MONETÁRIO
    // =============================================================================
    
    generateValue() {
        const values = [
            5000, 10000, 25000, 50000, 75000, 100000, 
            250000, 500000, 750000, 1000000, 2500000, 5000000
        ];
        const base = values[Math.floor(Math.random() * values.length)];
        const variation = base * (0.8 + Math.random() * 0.4); // ±20%
        return Math.round(variation * 100) / 100;
    },

    // =============================================================================
    // MOCK: FACETAS
    // =============================================================================
    
    generateFacets() {
        return [
            {
                field: 'tipo_documento_s',
                label: 'Tipo de Documento',
                items: [
                    { value: 'AUTO_INFRACAO', label: 'Auto de Infração', count: 234 },
                    { value: 'NOTIFICACAO', label: 'Notificação de Lançamento', count: 189 },
                    { value: 'IMPUGNACAO', label: 'Impugnação', count: 156 },
                    { value: 'RECURSO', label: 'Recurso Voluntário', count: 123 },
                    { value: 'DECISAO_DRJ', label: 'Decisão DRJ', count: 98 },
                    { value: 'ACORDAO', label: 'Acórdão', count: 87 },
                    { value: 'MANIFESTACAO', label: 'Manifestação de Inconformidade', count: 67 },
                    { value: 'DESPACHO', label: 'Despacho Decisório', count: 54 },
                    { value: 'TERMO_REVELIA', label: 'Termo de Revelia', count: 43 },
                    { value: 'CERTIDAO', label: 'Certidão', count: 32 }
                ]
            },
            {
                field: 'grupo_processo_s',
                label: 'Grupo de Processo',
                items: [
                    { value: 'PROCESSO_TRIBUTARIO', label: 'Processo Tributário', count: 567 },
                    { value: 'PROCESSO_ADMINISTRATIVO', label: 'Processo Administrativo', count: 234 },
                    { value: 'PROCESSO_RESTITUICAO', label: 'Processo de Restituição', count: 123 },
                    { value: 'PROCESSO_CONSULTA', label: 'Processo de Consulta', count: 89 },
                    { value: 'PROCESSO_IMUNIDADE', label: 'Processo de Reconhecimento de Imunidade', count: 45 }
                ]
            },
            {
                field: 'unidade_origem_s',
                label: 'Unidade de Origem',
                items: [
                    { value: 'SP_SAO_PAULO', label: 'SP - São Paulo ARF', count: 298 },
                    { value: 'RJ_RIO_JANEIRO', label: 'RJ - Rio de Janeiro ARF', count: 234 },
                    { value: 'MG_BELO_HORIZONTE', label: 'MG - Belo Horizonte ARF', count: 167 },
                    { value: 'RS_PORTO_ALEGRE', label: 'RS - Porto Alegre ARF', count: 145 },
                    { value: 'PR_CURITIBA', label: 'PR - Curitiba ARF', count: 123 },
                    { value: 'BA_SALVADOR', label: 'BA - Salvador ARF', count: 98 },
                    { value: 'DF_BRASILIA', label: 'DF - Brasília ARF', count: 87 },
                    { value: 'PE_RECIFE', label: 'PE - Recife ARF', count: 76 },
                    { value: 'CE_FORTALEZA', label: 'CE - Fortaleza ARF', count: 65 },
                    { value: 'GO_GOIANIA', label: 'GO - Goiânia ARF', count: 54 }
                ]
            },
            {
                field: 'tributo_act_s',
                label: 'Tributo',
                items: [
                    { value: 'IRPJ', label: '20 - IRPJ', count: 312 },
                    { value: 'CSLL', label: '30 - CSLL', count: 267 },
                    { value: 'PIS', label: '10 - PIS/PASEP', count: 234 },
                    { value: 'COFINS', label: '35 - COFINS', count: 223 },
                    { value: 'IPI', label: '05 - IPI', count: 156 },
                    { value: 'IRPF', label: '25 - IRPF', count: 134 },
                    { value: 'IOF', label: '15 - IOF', count: 98 },
                    { value: 'CIDE', label: '40 - CIDE', count: 67 }
                ]
            },
            {
                field: 'situacao_s',
                label: 'Situação',
                items: [
                    { value: 'EM_ANALISE', label: 'Em Análise', count: 423 },
                    { value: 'AGUARDANDO_JULGAMENTO', label: 'Aguardando Julgamento', count: 298 },
                    { value: 'JULGADO', label: 'Julgado', count: 189 },
                    { value: 'EM_RECURSO', label: 'Em Recurso', count: 134 },
                    { value: 'ARQUIVADO', label: 'Arquivado', count: 87 },
                    { value: 'TRANSITO_JULGADO', label: 'Trânsito em Julgado', count: 76 },
                    { value: 'CANCELADO', label: 'Cancelado', count: 45 }
                ]
            },
            {
                field: 'tipo_processo_s',
                label: 'Tipo de Processo',
                items: [
                    { value: 'LANCAMENTO', label: 'Lançamento', count: 456 },
                    { value: 'COBRANCA', label: 'Cobrança', count: 298 },
                    { value: 'RESTITUICAO', label: 'Restituição', count: 178 },
                    { value: 'CONSULTA', label: 'Consulta', count: 123 },
                    { value: 'OUTROS', label: 'Outros', count: 98 }
                ]
            }
        ];
    },

    // =============================================================================
    // MOCK: CARDS
    // =============================================================================
    
    generateCard() {
        const empresa = this.config.empresas[Math.floor(Math.random() * this.config.empresas.length)];
        const responsavel = this.config.responsaveis[Math.floor(Math.random() * this.config.responsaveis.length)];
        const tributo = this.config.tributos[Math.floor(Math.random() * this.config.tributos.length)];
        const tipoDoc = this.config.tiposDocumento[Math.floor(Math.random() * this.config.tiposDocumento.length)];
        const grupoProc = this.config.gruposProcesso[Math.floor(Math.random() * this.config.gruposProcesso.length)];
        const unidade = this.config.unidades[Math.floor(Math.random() * this.config.unidades.length)];
        const situacao = this.config.situacoes[Math.floor(Math.random() * this.config.situacoes.length)];
        const trecho = this.config.trechos[Math.floor(Math.random() * this.config.trechos.length)];
        
        const hoje = new Date();
        const anoPassado = new Date(hoje.getFullYear() - 1, 0, 1);
        
        const dtProtocolo = this.generateRandomDate(anoPassado, hoje);
        const dtJuntada = new Date(dtProtocolo.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
        const dtAnexacao = new Date(dtJuntada.getTime() + Math.random() * 15 * 24 * 60 * 60 * 1000);
        
        return {
            titulo: `${tipoDoc} - ${tributo.name.split(' - ')[0]}`,
            pdfUrl: '#',
            pdfUrlBlank: '#',
            fields: [
                { label: 'Número do processo', value: this.generateProcessNumber() },
                { label: 'Data anexação', value: this.formatDate(dtAnexacao) },
                { label: 'Data protocolo', value: this.formatDate(dtProtocolo) },
                { label: 'Data juntada', value: this.formatDate(dtJuntada) },
                { label: 'Unidade origem', value: unidade },
                { label: 'Equipe origem', value: `EQUIPE-${unidade.split(' - ')[0]}-${Math.floor(Math.random() * 9) + 1}` },
                { label: 'Tipo documento', value: tipoDoc },
                { label: 'Grupo processo', value: grupoProc },
                { label: 'Tipo processo', value: 'LANÇAMENTO' },
                { label: 'Subtipo processo', value: 'AUTO DE INFRAÇÃO E/OU NOTIFICAÇÃO DE LANÇAMENTO(FISCEL)' },
                { label: 'NI do Contribuinte', value: empresa.cnpj },
                { label: 'Nome do Contribuinte', value: empresa.nome },
                { label: 'Nome Equipe Atual', value: `EQUIPE-ATUAL-${Math.floor(Math.random() * 99) + 1}` },
                { label: 'Nome Unidade Atual', value: unidade },
                { label: 'CPF Responsável', value: responsavel.cpf },
                { label: 'Nome usuário juntada', value: responsavel.nome },
                { label: 'Tributo ACT', value: `${tributo.code} - ${tributo.name}` },
                { label: 'Situação', value: situacao },
                { label: 'Valor do Processo', value: `R$ ${this.generateValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
                { label: 'Trecho', value: trecho }
            ]
        };
    },

    generateCards(count = 10) {
        return Array.from({ length: count }, () => this.generateCard());
    },

    // =============================================================================
    // MOCK: RESPOSTA COMPLETA (SOLR-LIKE)
    // =============================================================================
    
    generateCompleteResponse(query = '*:*', page = 1, rows = 10) {
        const totalResults = 1247; // Total simulado
        const start = (page - 1) * rows;
        
        return {
            response: {
                numFound: totalResults,
                start: start,
                docs: this.generateCards(rows)
            },
            facet_counts: {
                facet_fields: this.generateFacetFields()
            },
            responseHeader: {
                status: 0,
                QTime: Math.floor(Math.random() * 50) + 5, // 5-55ms
                params: {
                    q: query,
                    start: start,
                    rows: rows
                }
            }
        };
    },

    generateFacetFields() {
        const facets = this.generateFacets();
        const fields = {};
        
        facets.forEach(facet => {
            fields[facet.field] = [];
            facet.items.forEach(item => {
                fields[facet.field].push(item.value, item.count);
            });
        });
        
        return fields;
    },

    // =============================================================================
    // EXPORTAR PARA JSON
    // =============================================================================
    
    exportToJSON(data) {
        return JSON.stringify(data, null, 2);
    },

    downloadJSON(data, filename = 'mock-data.json') {
        const json = this.exportToJSON(data);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
};

// =============================================================================
// FUNÇÕES DE ATALHO PARA USO FÁCIL
// =============================================================================

// Gerar e renderizar facetas mockadas
window.mockFacets = function() {
    const facets = MockDataGenerator.generateFacets();
    FacetedSearchManager.render(facets);
    console.log('✅ Facetas mockadas renderizadas!');
    return facets;
};

// Gerar e renderizar cards mockados
window.mockCards = function(count = 10) {
    const cards = MockDataGenerator.generateCards(count);
    ResultCardsManager.render(cards, 1247); // Total simulado
    console.log(`✅ ${count} cards mockados renderizados!`);
    return cards;
};

// Gerar resposta completa (Solr-like)
window.mockComplete = function(page = 1, rows = 10) {
    const response = MockDataGenerator.generateCompleteResponse('*:*', page, rows);
    
    // Renderizar facetas
    const facets = MockDataGenerator.generateFacets();
    FacetedSearchManager.render(facets);
    
    // Renderizar cards
    ResultCardsManager.render(response.response.docs, response.response.numFound);
    
    console.log('✅ Sistema completo mockado renderizado!');
    console.log(`📊 ${response.response.numFound} resultados encontrados em ${response.responseHeader.QTime}ms`);
    
    return response;
};

// Simular busca com delay (mais realista)
window.mockSearch = async function(query = '*:*', page = 1) {
    console.log(`🔍 Buscando: "${query}"...`);
    
    // Simular loading
    showLoading();
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    
    const response = MockDataGenerator.generateCompleteResponse(query, page, 10);
    
    // Renderizar
    const facets = MockDataGenerator.generateFacets();
    FacetedSearchManager.render(facets);
    ResultCardsManager.render(response.response.docs, response.response.numFound);
    
    hideLoading();
    
    console.log(`✅ Busca concluída! ${response.response.numFound} resultados em ${response.responseHeader.QTime}ms`);
    
    return response;
};

// Baixar dados mockados como JSON
window.downloadMockData = function() {
    const data = {
        facets: MockDataGenerator.generateFacets(),
        cards: MockDataGenerator.generateCards(20),
        completeResponse: MockDataGenerator.generateCompleteResponse()
    };
    
    MockDataGenerator.downloadJSON(data, 'eprocesso-mock-data.json');
    console.log('✅ Arquivo JSON baixado!');
};

// Gerar dados para teste específico
window.mockCustom = function(config = {}) {
    const {
        cardsCount = 10,
        includeFacets = true,
        query = '*:*',
        page = 1
    } = config;
    
    const response = MockDataGenerator.generateCompleteResponse(query, page, cardsCount);
    
    if (includeFacets) {
        const facets = MockDataGenerator.generateFacets();
        FacetedSearchManager.render(facets);
    }
    
    ResultCardsManager.render(response.response.docs, response.response.numFound);
    
    console.log('✅ Mock customizado renderizado!', config);
    
    return response;
};

// Simular paginação
window.mockPagination = async function() {
    console.log('📄 Simulando paginação...');
    
    for (let page = 1; page <= 3; page++) {
        console.log(`⏳ Carregando página ${page}...`);
        await mockSearch('*:*', page);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('✅ Simulação de paginação concluída!');
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function showLoading() {
    const container = document.getElementById('resultsContainer');
    if (container) {
        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Carregando resultados...</p>
            </div>
        `;
    }
}

function hideLoading() {
    const loading = document.querySelector('.loading-state');
    if (loading) loading.remove();
}

// =============================================================================
// AUTO-INICIALIZAÇÃO PARA DEMONSTRAÇÃO
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎭 Mock Data Generator carregado!');
    console.log('');
    console.log('📋 Comandos disponíveis:');
    console.log('  mockFacets()           - Gera facetas mockadas');
    console.log('  mockCards(10)          - Gera 10 cards mockados');
    console.log('  mockComplete()         - Gera facetas + cards');
    console.log('  mockSearch("query")    - Simula busca com loading');
    console.log('  mockPagination()       - Simula navegação entre páginas');
    console.log('  downloadMockData()     - Baixa JSON com dados mock');
    console.log('  mockCustom({...})      - Mock personalizado');
    console.log('');
    
    // Carregar dados iniciais automaticamente após 1 segundo
    setTimeout(() => {
        console.log('🚀 Carregando dados mockados iniciais...');
        mockComplete();
    }, 1000);
});

// Expor gerador globalmente
window.MockDataGenerator = MockDataGenerator;