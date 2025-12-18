# 🔍 Enhanced Autocomplete - Documentação

## 📋 Visão Geral

O **Enhanced Autocomplete** é um sistema de sugestões inteligente que:
- ✅ **Mostra domínio completo ao clicar** no campo (antes mesmo de digitar)
- ✅ **Filtra conforme o usuário digita**
- ✅ **Cache inteligente** para performance
- ✅ **Highlight visual** do termo buscado
- ✅ **Contador de ocorrências** em cada sugestão
- ✅ **Feedback visual** ao selecionar

---

## 🎯 Como Funciona

### 1. Ao Clicar no Campo (Campo Vazio)

```
Usuário clica em "Tipo Documento"
      ↓
Mostra TOP 50 valores mais frequentes
      ↓
┌─────────────────────────────────────────┐
│ IMPUGNAÇÃO (1.234)                      │
│ AUTO DE INFRAÇÃO (987)                  │
│ NOTIFICAÇÃO DE LANÇAMENTO (654)         │
│ RECURSO VOLUNTÁRIO (432)                │
│ ...                                     │
└─────────────────────────────────────────┘
```

**Vantagem:** Usuário vê padrão (MAIÚSCULO, nomenclatura exata)

### 2. Ao Digitar

```
Usuário digita: "imp"
      ↓
Filtra em tempo real
      ↓
┌─────────────────────────────────────────┐
│ IMPUGNAÇÃO (1.234)                      │ ← "imp" destacado
│ SIMPLESMENTE (45)                       │ ← "imp" destacado
└─────────────────────────────────────────┘
```

**Vantagem:** Busca instantânea, sem precisar digitar completo

### 3. Ao Selecionar

```
Usuário clica em "IMPUGNAÇÃO"
      ↓
Campo fica verde brevemente (feedback)
      ↓
Valor preenchido: "IMPUGNAÇÃO"
```

---

## ⚙️ Configuração de Campos

Abrir `autocomplete-enhanced.js` e editar:

```javascript
fields: {
    'campo_solr_s': { 
        minLength: 0,      // 0 = mostra ao clicar
        limit: 50,         // Quantidade de sugestões
        cache: true        // Cachear resultados?
    }
}
```

### Campos Pré-Configurados

| Campo | Min Length | Limit | Cache | Observação |
|-------|-----------|-------|-------|------------|
| `grupo_processo_s` | 0 | 50 | ✅ | Domínio pequeno, cachear |
| `tipo_processo_s` | 0 | 50 | ✅ | Domínio pequeno, cachear |
| `tipo_documento_s` | 0 | 50 | ✅ | Domínio pequeno, cachear |
| `tributo_act_s` | 0 | 30 | ✅ | Domínio pequeno, cachear |
| `unidade_origem_s` | 0 | 100 | ✅ | Domínio médio, cachear |
| `situacao_s` | 0 | 30 | ✅ | Domínio pequeno, cachear |
| `aleg_recurso_contrib_txt` | 2 | 30 | ❌ | Texto livre, não cachear |
| `nome_relator_drj_s` | 2 | 50 | ❌ | Muitos valores, não cachear |

### Adicionar Novo Campo

```javascript
// Em autocomplete-enhanced.js
fields: {
    // ... campos existentes ...
    
    'meu_novo_campo_s': {
        minLength: 0,     // 0 = mostra ao clicar
        limit: 30,        // Top 30 sugestões
        cache: true       // Sim, cachear
    }
}
```

Depois recarregar a página!

---

## 🎨 Customização Visual

### Alterar Cor do Highlight

```css
/* Em styles.css ou inline no autocomplete-enhanced.js */
.enhanced-autocomplete-menu mark {
    background-color: #ffeb3b;  /* Amarelo atual */
    color: #333;
}

/* Trocar para azul, por exemplo: */
.enhanced-autocomplete-menu mark {
    background-color: #2196F3;
    color: white;
}
```

### Alterar Altura Máxima do Menu

```css
.enhanced-autocomplete-menu {
    max-height: 300px;  /* Altura atual */
}

/* Aumentar para 500px: */
.enhanced-autocomplete-menu {
    max-height: 500px;
}
```

### Alterar Cor ao Selecionar

```css
.autocomplete-selected {
    border-color: #4CAF50 !important;       /* Verde */
    background-color: #e8f5e9 !important;
}

/* Trocar para azul: */
.autocomplete-selected {
    border-color: #2196F3 !important;
    background-color: #e3f2fd !important;
}
```

---

## 🚀 Performance

### Cache

O sistema cacheia automaticamente:
- ✅ Domínios completos (ao clicar com campo vazio)
- ✅ Buscas já realizadas
- ❌ Campos com `cache: false` (texto livre)

**Limpar cache:**
```javascript
// Console do browser
clearAutocompleteCache('tipo_documento_s');  // Um campo específico
clearAutocompleteCache();                    // Todo cache
```

### Pré-Carregamento

Campos importantes são pré-carregados 2 segundos após a página carregar:

```javascript
// Em autocomplete-enhanced.js
async preloadDomains(fields) {
    const fieldsToPreload = fields || [
        'tipo_documento_s',      // ← Estes são pré-carregados
        'grupo_processo_s',
        'tributo_act_s',
        'situacao_s'
    ];
    // ...
}
```

**Desabilitar pré-carregamento:**
```javascript
// Em head.vm ou inline
window.EPROCESSO_CONFIG.preloadAutocomplete = false;
```

### Métricas

```javascript
// Console do browser
console.log(EnhancedAutocomplete.cache.size);  // Quantos itens cacheados
```

---

## 🔧 Troubleshooting

### Problema: Autocomplete não aparece

**Sintomas:**
- Clico no campo, nada acontece
- Digito, não filtra

**Soluções:**

1. **Verificar se jQuery está carregado:**
```javascript
// Console
console.log(typeof jQuery);  // Deve ser "function"
```

2. **Verificar se campo está configurado:**
```javascript
// Console
console.log(EnhancedAutocomplete.fields);
// Deve mostrar seu campo
```

3. **Verificar logs:**
```javascript
// Console → procurar por erros
testAutocomplete('tipo_documento_s');
```

4. **Verificar se Solr responde:**
```bash
curl "http://localhost:8983/solr/eprocesso/terms?terms.fl=tipo_documento_s&terms.limit=10&wt=json"
```

### Problema: Sugestões vazias

**Sintomas:**
- Menu abre mas mostra "Nenhuma sugestão encontrada"

**Soluções:**

1. **Verificar se campo existe no Solr:**
```bash
curl "http://localhost:8983/solr/eprocesso/schema/fields/tipo_documento_s"
```

2. **Verificar se campo tem dados:**
```bash
curl "http://localhost:8983/solr/eprocesso/select?q=*:*&rows=1&fl=tipo_documento_s"
```

3. **Testar Terms diretamente:**
```bash
curl "http://localhost:8983/solr/eprocesso/terms?terms.fl=tipo_documento_s&wt=json"
```

### Problema: Muito lento

**Sintomas:**
- Demora > 2 segundos para mostrar sugestões

**Soluções:**

1. **Reduzir limite de sugestões:**
```javascript
'tipo_documento_s': { 
    minLength: 0, 
    limit: 20,    // ← Reduzir de 50 para 20
    cache: true 
}
```

2. **Aumentar minLength para campos texto:**
```javascript
'aleg_recurso_contrib_txt': { 
    minLength: 3,  // ← Só busca com 3+ caracteres
    limit: 20, 
    cache: false 
}
```

3. **Desabilitar pré-carregamento:**
```javascript
window.EPROCESSO_CONFIG.preloadAutocomplete = false;
```

4. **Verificar performance do Solr:**
```bash
curl "http://localhost:8983/solr/admin/metrics?group=core" | \
  jq '.metrics["solr.core.eprocesso"]["QUERY./terms.requestTimes"]'
```

### Problema: Valores desatualizados

**Sintomas:**
- Cache mostra valores antigos

**Solução:**
```javascript
// Console
clearAutocompleteCache();  // Limpar todo cache
// OU
EnhancedAutocomplete.clearCache('tipo_documento_s');  // Campo específico
```

---

## 📊 Monitoramento

### Verificar Taxa de Cache Hit

```javascript
// Ativar logs
localStorage.setItem('DEBUG_AUTOCOMPLETE', 'true');

// Usar autocomplete normalmente

// Verificar console:
// "📦 Cache hit: tipo_documento_s:_empty_"  ← Cache funcionando
// Vs
// "Fetching from Solr..."                   ← Buscando no servidor
```

### Benchmark

```javascript
// Console
async function benchmarkAutocomplete(fieldId, iterations = 10) {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await EnhancedAutocomplete.fetchSuggestions(fieldId, '', { limit: 50, cache: false });
        times.push(performance.now() - start);
    }
    
    const avg = times.reduce((a, b) => a + b) / times.length;
    console.log(`Média: ${avg.toFixed(2)}ms`);
    console.log(`Mín: ${Math.min(...times).toFixed(2)}ms`);
    console.log(`Máx: ${Math.max(...times).toFixed(2)}ms`);
}

benchmarkAutocomplete('tipo_documento_s');
```

---

## 🎓 Exemplos de Uso

### Exemplo 1: Campo Simples

```html
<!-- HTML -->
<input type="text" 
       id="tipo_documento_s" 
       name="tipo_documento_s" 
       placeholder="Tipo de Documento">
```

```javascript
// JavaScript (autocomplete-enhanced.js)
fields: {
    'tipo_documento_s': { 
        minLength: 0,   // Mostra ao clicar
        limit: 50,
        cache: true 
    }
}
```

**Resultado:**
- Usuário clica → Mostra top 50 tipos
- Usuário digita "imp" → Filtra para "IMPUGNAÇÃO", etc
- Usuário seleciona → Campo preenchido

### Exemplo 2: Campo com Busca Mínima

```javascript
// Para campos com MUITOS valores (milhares)
fields: {
    'nome_contribuinte_s': { 
        minLength: 3,    // Só busca com 3+ caracteres
        limit: 30,       // Máximo 30 sugestões
        cache: false     // Não cachear (muitos valores)
    }
}
```

**Resultado:**
- Usuário clica → Nada acontece (minLength = 3)
- Usuário digita "emp" → Busca e mostra sugestões
- Usuário digita "empresa" → Refina busca

### Exemplo 3: Pré-Carregar ao Abrir Modal

```javascript
// No evento de abertura do modal
document.getElementById('openModalBtn').addEventListener('click', function() {
    openFiltersModal();
    
    // Pré-carregar campos importantes
    EnhancedAutocomplete.preloadDomains([
        'tipo_documento_s',
        'tributo_act_s',
        'unidade_origem_s'
    ]);
});
```

---

## 🔐 Segurança

### Sanitização de Input

O autocomplete **não executa queries arbitrárias**. Apenas usa:
- `terms.fl` = nome do campo (hardcoded)
- `terms.prefix` = valor digitado (escapado automaticamente pelo Solr)

### Rate Limiting

Implementar no Solr (solrconfig.xml):

```xml
<!-- Limitar requests por IP -->
<requestHandler name="/terms" class="solr.SearchHandler">
  <lst name="defaults">
    <!-- ... configurações ... -->
  </lst>
  
  <!-- Rate limiter (exemplo com plugin externo) -->
  <processor class="solr.RateLimitingUpdateProcessorFactory">
    <int name="allowedRequests">100</int>
    <int name="timeWindow">60000</int> <!-- 1 minuto -->
  </processor>
</requestHandler>
```

---

## 📚 Referências

- [jQuery UI Autocomplete](https://jqueryui.com/autocomplete/)
- [Solr Terms Component](https://solr.apache.org/guide/solr/latest/query-guide/terms-component.html)
- [Solr Query Performance](https://solr.apache.org/guide/solr/latest/deployment-guide/performance-tuning.html)

---

## ✅ Checklist de Integração

- [ ] Arquivo `autocomplete-enhanced.js` copiado para `/eprocesso/`
- [ ] Script incluído no `head.vm`
- [ ] jQuery e jQuery UI carregados antes
- [ ] Campos configurados em `fields: {}`
- [ ] CSS aplicado (já incluído no .js)
- [ ] Testado em todos os navegadores
- [ ] Performance validada (< 500ms)
- [ ] Cache funcionando
- [ ] Documentado para equipe

---

## 🆘 Suporte

**Problemas comuns:**
1. Não aparece → Verificar jQuery
2. Lento → Reduzir `limit` ou aumentar `minLength`
3. Cache errado → `clearAutocompleteCache()`
4. Solr erro → Verificar se campo existe no schema

**Testes rápidos:**
```javascript
testAutocomplete('tipo_documento_s');
clearAutocompleteCache();
EnhancedAutocomplete.preloadDomains();
```