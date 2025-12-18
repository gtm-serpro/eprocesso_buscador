# 🔍 Exemplos de Queries Otimizadas - eProcesso Buscador

## 📖 Índice

1. [Buscas Básicas](#buscas-básicas)
2. [Buscas com Filtros](#buscas-com-filtros)
3. [Buscas de Data](#buscas-de-data)
4. [Facetas](#facetas)
5. [Paginação](#paginação)
6. [Autocomplete](#autocomplete)
7. [Export](#export)
8. [Queries Complexas](#queries-complexas)

---

## Buscas Básicas

### 1. Busca Simples (todos os documentos)
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*"
```

### 2. Busca por Termo
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=impugnação"
```

### 3. Busca em Campo Específico
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=processo_s:11065720723201585"
```

### 4. Busca com Múltiplos Termos (AND implícito)
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=impugnação+IRPJ"
```

### 5. Busca com OR
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=impugnação+OR+recurso"
```

### 6. Busca com Exclusão (NOT)
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=processo+-cancelado"
```

---

## Buscas com Filtros

### 7. Filtro por Tipo de Documento
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=tipo_documento_s:IMPUGNACAO"
```

### 8. Múltiplos Filtros (AND)
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=tipo_documento_s:IMPUGNACAO&fq=tributo_act_s:IRPJ"
```

### 9. Filtro com Wildcard
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=unidade_origem_s:*SAO+PAULO*"
```

### 10. Filtro Negativo
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=-tipo_documento_s:CANCELADO"
```

### 11. Filtro por Range Numérico
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=valor_processo_d:[100000+TO+1000000]"
```

---

## Buscas de Data

### 12. Data Específica
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=dt_protocolo_tdt:2024-01-15T00:00:00Z"
```

### 13. Range de Datas
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=dt_protocolo_tdt:[2024-01-01T00:00:00Z+TO+2024-12-31T23:59:59Z]"
```

### 14. Últimos 30 Dias
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=dt_protocolo_tdt:[NOW-30DAY+TO+NOW]"
```

### 15. Último Ano
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=dt_protocolo_tdt:[NOW-1YEAR+TO+NOW]"
```

### 16. Antes de Data Específica
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=dt_protocolo_tdt:[*+TO+2023-12-31T23:59:59Z]"
```

### 17. Após Data Específica
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=dt_protocolo_tdt:[2024-01-01T00:00:00Z+TO+*]"
```

---

## Facetas

### 18. Facetas Básicas
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&facet=true&facet.field=tipo_documento_s"
```

### 19. Múltiplas Facetas
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&facet=true&facet.field=tipo_documento_s&facet.field=tributo_act_s&facet.field=unidade_origem_s"
```

### 20. Facetas com Limite
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&facet=true&facet.field=tipo_documento_s&facet.limit=10"
```

### 21. Facetas Ordenadas por Count
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&facet=true&facet.field=tipo_documento_s&facet.sort=count"
```

### 22. Facetas com Mínimo de Ocorrências
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&facet=true&facet.field=tipo_documento_s&facet.mincount=10"
```

### 23. Facetas de Range (Datas)
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&facet=true&facet.range=dt_protocolo_tdt&facet.range.start=2020-01-01T00:00:00Z&facet.range.end=2025-01-01T00:00:00Z&facet.range.gap=%2B1YEAR"
```

### 24. Facetas de Range (Valores)
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&facet=true&facet.range=valor_processo_d&facet.range.start=0&facet.range.end=10000000&facet.range.gap=1000000"
```

---

## Paginação

### 25. Primeira Página (10 resultados)
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&rows=10&start=0"
```

### 26. Segunda Página
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&rows=10&start=10"
```

### 27. Página 5 (20 por página)
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&rows=20&start=80"
```

### 28. Últimos 50 Resultados
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&rows=50&sort=dt_protocolo_tdt+desc"
```

---

## Autocomplete

### 29. Sugestões para Tipo de Documento
```bash
curl "http://localhost:8983/solr/eprocesso/terms?terms.fl=tipo_documento_s&terms.prefix=IMP&terms.limit=10"
```

### 30. Sugestões para Unidade
```bash
curl "http://localhost:8983/solr/eprocesso/terms?terms.fl=unidade_origem_s&terms.prefix=SP&terms.limit=10"
```

### 31. Sugestões Ordenadas por Frequência
```bash
curl "http://localhost:8983/solr/eprocesso/terms?terms.fl=tributo_act_s&terms.prefix=I&terms.sort=count&terms.limit=10"
```

---

## Export

### 32. Export XML (10 registros)
```bash
curl "http://localhost:8983/solr/eprocesso/select?q=*:*&rows=10&wt=xml" > export.xml
```

### 33. Export JSON (100 registros)
```bash
curl "http://localhost:8983/solr/eprocesso/select?q=*:*&rows=100&wt=json&indent=false" > export.json
```

### 34. Export CSV (1000 registros)
```bash
curl "http://localhost:8983/solr/eprocesso/export?q=*:*&rows=1000&wt=csv&csv.header=true" > export.csv
```

### 35. Export com Campos Específicos
```bash
curl "http://localhost:8983/solr/eprocesso/select?q=*:*&rows=1000&wt=csv&fl=id,processo_s,tipo_documento_s,dt_protocolo_tdt" > export_custom.csv
```

---

## Queries Complexas

### 36. Busca com Boost
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=processo^5.0+impugnação^2.0"
```

### 37. Busca Fuzzy (tolerância a erros)
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=impugnacão~2"
```

### 38. Busca de Proximidade
```bash
curl 'http://localhost:8983/solr/eprocesso/browse?q="auto+infração"~5'
```

### 39. Busca com Highlighting
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=impugnação&hl=true&hl.fl=conteudo_txt&hl.snippets=3"
```

### 40. Busca com Agrupamento
```bash
curl "http://localhost:8983/solr/eprocesso/select?q=*:*&group=true&group.field=processo_s&group.limit=5&wt=json"
```

### 41. Busca com Spell Check
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=impugnaçao&spellcheck=true&spellcheck.collate=true"
```

### 42. Busca com More Like This
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=id:11065720723201585&mlt=true&mlt.fl=conteudo_txt&mlt.count=5"
```

### 43. Busca com Function Query (Boost por Data Recente)
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=impugnação&bf=recip(ms(NOW,dt_protocolo_tdt),3.16e-11,1,1)"
```

### 44. Busca com Local Params (parser específico)
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q={!edismax+qf='conteudo_txt^2.0+titulo_s^3.0'}impugnação"
```

### 45. Busca com Collapse (Deduplicação)
```bash
curl "http://localhost:8983/solr/eprocesso/select?q=*:*&fq={!collapse+field=processo_s}&wt=json"
```

---

## 🎯 Queries para Casos de Uso Reais

### Caso 1: Todos os processos de um contribuinte
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=ni_contribuinte_s:12345678000190&sort=dt_protocolo_tdt+desc"
```

### Caso 2: Processos com valor acima de 1 milhão
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=valor_processo_d:[1000000+TO+*]&sort=valor_processo_d+desc"
```

### Caso 3: Impugnações de IRPJ em São Paulo no último ano
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=tipo_documento_s:IMPUGNACAO&fq=tributo_act_s:IRPJ&fq=unidade_origem_s:*SAO+PAULO*&fq=dt_protocolo_tdt:[NOW-1YEAR+TO+NOW]"
```

### Caso 4: Processos aguardando julgamento
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=situacao_s:AGUARDANDO_JULGAMENTO&sort=dt_protocolo_tdt+asc"
```

### Caso 5: Decisões favoráveis ao contribuinte
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=tipo_documento_s:DECISAO&fq=result_questdrj_nivel1_s:FAVORAVEL&sort=dt_juntada_tdt+desc"
```

### Caso 6: Processos de um período específico por unidade
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=dt_protocolo_tdt:[2024-01-01T00:00:00Z+TO+2024-03-31T23:59:59Z]&fq=unidade_origem_s:*BRASILIA*&facet=true&facet.field=tipo_documento_s"
```

---

## 🔧 Dicas de Otimização

### Use fq (filter query) em vez de q para filtros
❌ Errado:
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=tipo_documento_s:IMPUGNACAO+AND+tributo_act_s:IRPJ"
```

✅ Correto:
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=tipo_documento_s:IMPUGNACAO&fq=tributo_act_s:IRPJ"
```

**Por quê?** `fq` é cacheado, `q` não.

### Limite o número de rows
❌ Errado:
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&rows=10000"
```

✅ Correto:
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&rows=50"
```

**Por quê?** Com milhões de docs, rows alto mata performance.

### Use facet.threads para facetas pesadas
❌ Errado:
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&facet=true&facet.field=tipo_documento_s&facet.field=unidade_origem_s&facet.field=tributo_act_s"
```

✅ Correto:
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&facet=true&facet.threads=true&facet.field=tipo_documento_s&facet.field=unidade_origem_s&facet.field=tributo_act_s"
```

**Por quê?** Paraleliza cálculo das facetas.

### Use timeAllowed para evitar queries eternas
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&timeAllowed=5000"
```

**Por quê?** Se query passar de 5s, Solr retorna parcial.

---

## 📊 Análise de Performance

### Verificar tempo de query
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&debug=timing" | grep QTime
```

### Verificar explain (score)
```bash
curl "http://localhost:8983/solr/eprocesso/browse?q=impugnação&debug=query" | jq '.debug.explain'
```

### Verificar cache stats
```bash
curl "http://localhost:8983/solr/admin/metrics?group=core&prefix=CACHE" | jq .
```

---

## 🆘 Troubleshooting de Queries

### Query retorna 0 resultados
1. Verificar se campo existe: `schema.xml`
2. Verificar se campo está indexado
3. Testar query simples: `q=*:*`
4. Verificar filtros: remover `fq` um por um

### Query muito lenta
1. Verificar QTime no response
2. Usar `debug=timing`
3. Verificar cache hit ratio
4. Considerar otimizar índice

### Erro de timeout
1. Reduzir rows
2. Simplificar query
3. Aumentar timeAllowed
4. Verificar se índice está otimizado

---

## 📚 Referências

- [Solr Query Syntax](https://solr.apache.org/guide/solr/latest/query-guide/standard-query-parser.html)
- [Filter Queries](https://solr.apache.org/guide/solr/latest/query-guide/common-query-parameters.html#fq-filter-query-parameter)
- [Faceting](https://solr.apache.org/guide/solr/latest/query-guide/faceting.html)
- [Date Math](https://solr.apache.org/guide/solr/latest/indexing-guide/date-formatting-math.html)