# Vicente Romero Surf — site

Site estático em **HTML, CSS e JavaScript puro** (sem framework, sem build, sem dependências).
Hospedagem: **Vercel**. Este arquivo é o guia para pessoas e para IAs que forem editar o site.

## Estrutura

```
index.html              Home (hero, serviços, atleta, surf trip, vídeos, contato)
atleta/index.html       Biografia, palmarés, galeria
academy/index.html      Serviços da Romero Surf Academy e tarifas
surf-trip/index.html    Surf Experience Marrocos (detalhes, inclui/não inclui, reserva)
assets/css/styles.css   Todo o estilo (tokens de cor/fonte no topo, em :root)
assets/js/site.js       Cabeçalho, rodapé, traduções, WhatsApp, vídeos, galeria, formulário
assets/i18n/*.json      Traduções: en, pt, fr, de (o espanhol fica no próprio HTML)
assets/img/             Fotos e logos (vindos do site original)
assets/data/videos.json Lista de vídeos de reserva (usada se /api/videos falhar)
api/videos.js           Função da Vercel que lê o feed do YouTube (atualiza sozinho)
vercel.json             URLs limpas e cache
tools/check-i18n.js     Verifica se falta alguma tradução
```

## Rodar localmente

```bash
python3 -m http.server 4391
```

Abra http://localhost:4391. Localmente `/api/videos` não existe, então os vídeos vêm de
`assets/data/videos.json` (comportamento esperado).

## Publicar na Vercel

Importe a pasta/repositório na Vercel com **Framework Preset: Other**, sem comando de build e
sem diretório de saída. Não há variáveis de ambiente.

## Como editar

**Textos.** O texto em espanhol está no HTML. Todo elemento traduzível tem `data-i18n="chave"`.
Ao mudar um texto: edite o espanhol no HTML e a mesma chave em `assets/i18n/{en,pt,fr,de}.json`.
Depois rode:

```bash
node tools/check-i18n.js
```

**Contatos, redes e menu.** Tudo em `CONFIG`, no topo de `assets/js/site.js`
(WhatsApp, e-mail, Instagram, YouTube, Facebook, itens do menu, idiomas).
O cabeçalho e o rodapé são gerados por `renderChrome()` nesse mesmo arquivo — mude uma vez, vale para todas as páginas.

**Cores e fontes.** Variáveis em `:root` no topo de `assets/css/styles.css`
(preto, branco, cinza `#ededef` e azul `#3197d6` do site original).

**Links de WhatsApp com mensagem pronta.**
`<a data-wa="trip" data-wa-text="Mensagem em espanhol">`. A tradução fica na chave `wa.trip` dos JSON.

**Nova página.** Copie a pasta de uma página existente (ex.: `atleta/`) para `nova-pagina/index.html`,
troque o conteúdo do `<main>`, e adicione o link em `CONFIG.nav` (`site.js`). Mantenha no HTML
`<header id="site-header"></header>`, `<footer id="site-footer"></footer>` e o `<script src="/assets/js/site.js">`.
Componentes prontos no CSS: `.hero`, `.section` (`--gray`, `--dark`), `.split`, `.card`, `.checklist`,
`.gallery`, `.rate`, `.cta-band`, `.btn`. Adicione `class="reveal"` para a animação de entrada.

**Novo idioma.** Crie `assets/i18n/xx.json` com as mesmas chaves e adicione `xx` em `CONFIG.langs`.

**Fotos.** Coloque em `assets/img/` e referencie com caminho absoluto (`/assets/img/foto.jpg`).
Em uma `.gallery`, cada foto é `<button><img loading="lazy" src="..." alt="..."></button>` (abre em tela cheia).

**Próxima viagem.** Datas e preço aparecem em: faixa azul e bloco da viagem na home, `surf-trip/index.html`,
seção Surf Experience em `academy/index.html`, e nas chaves `trip.*`, `home.trip.title`, `svc.exp.price`
e `wa.trip` dos JSON. Procure por "diciembre" / "860" para achar todos os pontos.

## Vídeos do YouTube

`api/videos.js` lê o feed público do canal (ID `UCGpGHKYmtyf7PyhKYp7Qxyw`), sem chave de API, com cache
de 1 hora. Um vídeo novo no canal aparece no site sozinho. `<div class="videos" data-videos="7" data-featured>`
controla quantos mostrar e se o primeiro fica em destaque.

## Formulário de contato

Não usa servidor: monta a mensagem e abre o WhatsApp ou o programa de e-mail do visitante.
