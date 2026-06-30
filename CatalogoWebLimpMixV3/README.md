# Catalogo Web LimpMix V3

Site estatico do catalogo LimpMix Pitanga, pronto para hospedar em GitHub Pages.

## Como testar localmente

Na pasta do projeto:

```powershell
python -m http.server 5177 --bind 127.0.0.1
```

Acesse:

```text
http://127.0.0.1:5177/
```

## Fonte de dados

O catalogo usa a planilha Google Sheets publicada abaixo e converte o endereco para CSV no carregamento:

```text
https://docs.google.com/spreadsheets/d/e/2PACX-1vRLYiPL1o-OkYjroAoab-CJ_V6hzlb-WQCXDNJpSHoQlRefI-MeUJZkckTkZFaS-AaaDCR03hawt6yW/pubhtml?gid=1870458129&single=true
```

Campos esperados: CODIGO, FOTO, DESCRICAO, CATEGORIAS, CODIGO DE BARRAS, LINK FOTO, VALOR e ESTOQUE ou SALDO.

## Acessos

```text
VENDEDOR / 0022
MASTER / MASTER
```

Sem login, os produtos aparecem com valor restrito. VENDEDOR e MASTER visualizam precos. MASTER tambem ve estatisticas e pode configurar SKUs em Destaques.

## Funcionalidades

- Carregamento da planilha com cache local.
- Busca inteligente por codigo, descricao, categoria e codigo de barras.
- Categorias dinamicas.
- Categoria virtual Destaques salva em localStorage pelo MASTER.
- Tres modos de visualizacao: lista, medio e grande.
- Carrinho de orcamento persistente em localStorage.
- Envio do orcamento para WhatsApp.
- Layout responsivo e leve, sem framework.

## Publicacao no GitHub Pages

1. Suba todos os arquivos desta pasta para o repositorio.
2. No GitHub, acesse Settings > Pages.
3. Selecione a branch principal e a pasta raiz.
4. Aguarde a publicacao.
5. Teste sem login, com VENDEDOR e com MASTER.

## Observacao de seguranca

O login e local em JavaScript, adequado para organizacao visual. Ele nao protege dados sensiveis de forma forte em uma pagina estatica publica.
