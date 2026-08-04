# Associação 641 — Analogue Archive Hub

Site da Associação 641: estética de revista analógica / flipbook, notícias e páginas de conteúdo.

Built with [TanStack Start](https://tanstack.com/start) + Vite. Originally scaffolded with [Lovable](https://lovable.dev).

**Live site (GitHub Pages):** https://seisquatroum.github.io/website/

**Repo:** https://github.com/seisquatroum/website

## Development

Need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone https://github.com/seisquatroum/website.git
cd website
npm i
npm run dev
```

## Deploy (GitHub Pages)

Push to `main` triggers [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

- Build uses `GITHUB_PAGES=true` → base path `/website/`, static SPA shell in `dist/client`
- Workflow copies `index.html` → `404.html` for client-side routing fallback
- Repo Settings → Pages → Source must be **GitHub Actions**

Local static build:

```sh
# PowerShell
$env:GITHUB_PAGES='true'; npm run build:pages

# bash
GITHUB_PAGES=true npm run build:pages
```

## Known Issues / Debugging Notes

### Flipbook — assimetria na animação ao voltar página (seta esquerda)

**Sintoma:** ao voltar para trás, a página que entra faz uma pequena correcção de posição no fim da animação. A ir para a frente isto não acontece.

**Causa raiz** (confirmada no código-fonte da lib `page-flip` / `StPageFlip`):
- **Forward:** a lib anima um *clone* da página que sai. A página de destino fica estática desde o início, já na posição final — não há snap porque nunca se mexeu.
- **Back:** a lib anima a própria página de destino, usando `transform` + `clip-path` durante o turn (`draw()`). No fim da animação troca para o layout idle (`simpleDraw()`: posição absoluta, sem transform) — esse handoff produz a correcção visível.
- Em modo portrait há mesmo um caso especial explícito no código-fonte (`drawBottomPage()`): a bottom page não é desenhada quando `orientation === PORTRAIT && direction === BACK`.

**Opções em cima da mesa:**
1. Trocar para o fork [`react-pageflip-enhanced`](https://npmjs.com/package/react-pageflip-enhanced) — API praticamente idêntica (mesmo import/props), alega corrigir exactamente este caso (back-flip em portrait). Risco: fork pequeno/pouco vetted, sem histórico de manutenção conhecido.
2. Patch pontual via `patch-package` no `page-flip` original — mantém-nos no pacote mais popular, sem depender de manutenção de terceiros, mas requer manter o patch entre upgrades.

**Decisão:** _(a preencher depois de testar em branch)_

---

## TODO

- [ ] Mais features para a câmara (usar mais botões disponíveis no SVG)
- [ ] Fix para mobile
- [ ] Corrigir animação de "andar para trás" no flipbook (ver nota acima)
- [ ] Feature: reservar a sala
- [ ] Notícias: pôr um ipod com botões interativos no podcast (para as pessoas poderem reproduzir logo na página)
- [ ] Notícias: câmara com botões interativos para dar swap de fotos na própria página
- [ ] Opcional: página interativa ao pé dos contactos: acrescentar uma câmara para as pessoas tirarem fotos no browser e pode ter molduras e filtros, tipo como um guestbook/logbook.
- [ ] Substituir títulos pelas cenas do canvas (o que acham? vou fazer um branch e mostrar)
- [ ] Alterar pagina dos parceiros para aparecerem maiores e preencherem melhor a página
- [ ] Textos iniciais um pouco maiores para se ler melhor ( e potencialmente mudar a fonte?)
- [ ] Redirecionar: link para oeiras no mapa, link mb way, etc
- [ ] logo inicial meter na parte de tras ( e o desde 2025 tmb?) e meter o logo de receita ou vice versa ( meter o logo papel de receita na parte de trás) 
