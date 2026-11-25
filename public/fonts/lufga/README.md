# Fonte Lufga (Opcional)

Este diretorio esta preparado para receber os arquivos `.woff2` (pesos `300`, `400`, `500`, `600` e `700`) da familia tipografica **Lufga**, conforme especificado em `docs/DESIGN_SYSTEM.md` (Secao 3.1).

Enquanto os arquivos nao estiverem presentes, a aplicacao utiliza `local('Lufga ...')` com fallback geometrico limpo de sistema definido em `src/styles/tokens.css`:

`--mr-font-sans: 'Lufga', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`

## Como ativar os arquivos locais futuramente

1. Adicione os arquivos nesta pasta:
   - `LufgaLight.woff2` (weight `300`)
   - `LufgaRegular.woff2` (weight `400`)
   - `LufgaMedium.woff2` (weight `500`)
   - `LufgaSemiBold.woff2` (weight `600`)
   - `LufgaBold.woff2` (weight `700`)
2. Descomente as linhas `url('/fonts/lufga/...') format('woff2')` dentro das regras `@font-face` em `src/styles/tokens.css`.
