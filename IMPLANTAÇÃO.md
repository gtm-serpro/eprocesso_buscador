🚀 Guia de Implantação - eProcesso Buscador Atualizado
📋 Checklist Pré-Deploy
 Backup completo do Solr atual
 Backup dos templates Velocity antigos
 Teste em ambiente de homologação
 Validar performance com dados reais
 Documentar mudanças para equipe
📁 Estrutura de Arquivos
solr/
├── conf/
│   ├── solrconfig.xml          ← SUBSTITUIR (otimizado)
│   └── velocity/
│       ├── layout.vm           ← SUBSTITUIR
│       ├── browse.vm           ← SUBSTITUIR
│       ├── head.vm             ← SUBSTITUIR
│       ├── modal_filters.vm    ← NOVO
│       ├── filter_processor.vm ← NOVO
│       └── VM_global_library.vm (manter existente)
│
└── webapp/
    └── eprocesso/
        ├── styles.css          ← NOVO
        ├── app.js              ← NOVO (opcional)
        └── img/
            ├── eProcessoBuscador.svg
            ├── file-pdf-solid-full.svg
            ├── file-pdf-regular-full.svg
            ├── filter-solid-full.svg
            ├── Receita.svg
            ├── PGFN.svg
            └── CARF.svg
🔧 Passo a Passo
1. Backup
bash
# Backup do core Solr
cd /opt/solr/server/solr
tar -czf eprocesso_backup_$(date +%Y%m%d_%H%M%S).tar.gz eprocesso/

# Backup dos templates Velocity
tar -czf velocity_backup_$(date +%Y%m%d_%H%M%S).tar.gz eprocesso/conf/velocity/
2. Atualizar solrconfig.xml
bash
cd /opt/solr/server/solr/eprocesso/conf/

# Fazer backup
cp solrconfig.xml solrconfig.xml.bak

# Substituir (ajustar caminhos conforme seu ambiente)
# Copiar o novo solrconfig.xml otimizado
Alterações críticas no solrconfig.xml:

xml
<!-- ANTES -->
<int name="rows">10</int>

<!-- DEPOIS (com limite de segurança) -->
<int name="rows">10</int>
<int name="maxRows">50</int>
xml
<!-- ANTES -->
<str name="facet.threads">false</str>

<!-- DEPOIS (paralelizar facetas) -->
<str name="facet.threads">true</str>
xml
<!-- ANTES -->
<filterCache size="128"/>

<!-- DEPOIS (cache maior) -->
<filterCache 
  class="solr.CaffeineCache" 
  size="512"
  maxRamMB="512"/>
3. Atualizar Templates Velocity
bash
cd /opt/solr/server/solr/eprocesso/conf/velocity/

# Layout principal
cp layout.vm layout.vm.bak
# Substituir com novo layout.vm

# Head
cp head.vm head.vm.bak
# Substituir com novo head.vm

# Browse
cp browse.vm browse.vm.bak
# Substituir com novo browse.vm (otimizado)

# Adicionar novos arquivos
# Copiar modal_filters.vm
# Copiar filter_processor.vm
4. Adicionar Assets (CSS/JS/Imagens)
bash
cd /opt/solr/server/solr-webapp/webapp/

# Criar diretório
mkdir -p eprocesso/img

# Copiar arquivos
cp styles.css eprocesso/
cp app.js eprocesso/ (opcional)

# Copiar imagens
cp *.svg eprocesso/img/
5. Ajustar Permissões
bash
chown -R solr:solr /opt/solr/server/solr/eprocesso/
chmod -R 755 /opt/solr/server/solr/eprocesso/conf/velocity/
6. Recarregar Solr
bash
# Reload do core (sem downtime)
curl "http://localhost:8983/solr/admin/cores?action=RELOAD&core=eprocesso"

# OU restart completo (se necessário)
systemctl restart solr
7. Validar Implantação
bash
# Testar endpoint
curl "http://localhost:8983/solr/eprocesso/browse?q=*:*"

# Verificar logs
tail -f /var/solr/logs/solr.log

# Verificar métricas
curl "http://localhost:8983/solr/admin/metrics?group=core&prefix=QUERY"
⚙️ Configurações de JVM (Recomendadas)
Para lidar com milhões de registros, ajustar /etc/default/solr.in.sh:

bash
# Heap mínima e máxima (ajustar conforme servidor)
SOLR_HEAP="8g"

# GC otimizado
GC_TUNE="-XX:+UseG1GC \
         -XX:+PerfDisableSharedMem \
         -XX:+ParallelRefProcEnabled \
         -XX:MaxGCPauseMillis=250 \
         -XX:+UseLargePages \
         -XX:+AlwaysPreTouch"

# Thread stack
SOLR_OPTS="$SOLR_OPTS -Xss512k"

# Otimizações adicionais
SOLR_OPTS="$SOLR_OPTS -XX:+UseStringDeduplication"
SOLR_OPTS="$SOLR_OPTS -Dsolr.autoSoftCommit.maxTime=10000"
🧪 Testes de Performance
Teste 1: Busca Simples
bash
time curl "http://localhost:8983/solr/eprocesso/browse?q=processo"
# Esperado: < 500ms
Teste 2: Busca com Facetas
bash
time curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&facet=true&facet.field=tipo_documento_s"
# Esperado: < 1000ms
Teste 3: Busca com Filtros
bash
time curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&fq=tipo_documento_s:IMPUGNACAO&fq=dt_protocolo_tdt:[2023-01-01T00:00:00Z TO NOW]"
# Esperado: < 800ms
Teste 4: Paginação Profunda
bash
time curl "http://localhost:8983/solr/eprocesso/browse?q=*:*&start=9999&rows=10"
# Esperado: < 2000ms
Teste 5: Autocomplete
bash
time curl "http://localhost:8983/solr/eprocesso/terms?terms.fl=tipo_documento_s&terms.prefix=IMP"
# Esperado: < 100ms
📊 Monitoramento
Métricas Críticas
bash
# Tamanho do índice
du -sh /opt/solr/server/solr/eprocesso/data/

# Número de documentos
curl "http://localhost:8983/solr/eprocesso/admin/luke?numTerms=0" | jq '.index.numDocs'

# Cache hit ratio (deve ser > 80%)
curl "http://localhost:8983/solr/admin/metrics?group=core" | \
  jq '.metrics["solr.core.eprocesso"]["CACHE.searcher.filterCache"]'

# Tempo médio de query
curl "http://localhost:8983/solr/admin/metrics?group=core" | \
  jq '.metrics["solr.core.eprocesso"]["QUERY./select.requestTimes"]'
Logs para Monitorar
bash
# Queries lentas (> 1s)
grep "QTime=[1-9][0-9][0-9][0-9]" /var/solr/logs/solr.log

# Erros de timeout
grep "timeAllowed" /var/solr/logs/solr.log

# OOM ou memory issues
grep -E "(OutOfMemory|GC overhead)" /var/solr/logs/solr_gc.log
🔥 Troubleshooting
Problema: Queries Lentas
Sintoma: QTime > 5000ms

Soluções:

Verificar cache hit ratio
Otimizar índice: curl "http://localhost:8983/solr/eprocesso/update?optimize=true"
Aumentar filterCache size
Habilitar facet.threads
Problema: OutOfMemoryError
Sintoma: Solr crasha com OOM

Soluções:

Aumentar heap: SOLR_HEAP="16g"
Reduzir cache sizes
Limitar rows máximo
Adicionar circuit breaker
Problema: Facetas não aparecem
Sintoma: Sidebar vazia

Soluções:

Verificar facet.mincount=1
Verificar se campos estão indexados
Verificar logs do Velocity
Problema: Modal não abre
Sintoma: Click no botão não faz nada

Soluções:

Verificar se jQuery carregou: console.log(jQuery)
Verificar se CSS carregou
Verificar erros no console do browser
Verificar se openFiltersModal() existe
🎨 Customizações
Alterar Cores
Editar styles.css:

css
:root {
  --primary: #1351B4;      /* Azul Receita */
  --primary-dark: #0C326F;
  --success: #168821;
  --danger: #dc3545;
}
Alterar Facetas Exibidas
Editar solrconfig.xml:

xml
<str name="facet.field">tipo_documento_s</str>
<str name="facet.field">SEU_NOVO_CAMPO</str>
Editar browse.vm:

velocity
#if($field.name == 'SEU_NOVO_CAMPO')Seu Rótulo
Adicionar Novo Filtro
Adicionar campo no modal_filters.vm
Adicionar processamento no filter_processor.vm
Testar
📚 Referências
Apache Solr Performance Tuning
VelocityResponseWriter
Solr Caching
✅ Checklist Pós-Deploy
 Validar busca simples
 Validar filtros avançados
 Validar facetas
 Validar paginação
 Validar export (XML/JSON/CSV)
 Validar autocomplete
 Validar responsividade mobile
 Validar performance (< 1s)
 Validar logs (sem erros)
 Documentar para equipe
 Treinar usuários
🆘 Suporte
Em caso de problemas:

Verificar logs: /var/solr/logs/
Verificar métricas: http://localhost:8983/solr/admin/metrics
Rollback: Restaurar arquivos .bak
Contatar equipe de infraestrutura
Rollback rápido:

bash
cd /opt/solr/server/solr/eprocesso/conf/
mv solrconfig.xml solrconfig.xml.new
mv solrconfig.xml.bak solrconfig.xml

cd velocity/
mv layout.vm layout.vm.new
mv layout.vm.bak layout.vm
# ... repetir para outros arquivos

curl "http://localhost:8983/solr/admin/cores?action=RELOAD&core=eprocesso"
📝 Notas Finais
Testes são essenciais - Não pule etapas de validação
Monitore performance - Primeiras 24h são críticas
Documente mudanças - Facilita manutenção futura
Treine usuários - Novo layout pode causar confusão inicial
Boa sorte com o deploy! 🚀

