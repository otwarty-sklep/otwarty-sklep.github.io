# Frontend — Otwarty Sklep

Astro SSG + classless CSS + scoped komponenty.

## Dlaczego classless CSS (bez klas) jest lepszy dla AI agentów

AI agenci (ChatGPT/OAI-SearchBot, GoogleBot, ClaudeBot, PerplexityBot) czytają HTML, nie CSS. To co widzą to struktura dokumentu — tagi, atrybuty, semantyka. Z tego wynika kilka rzeczy:

**1. Semantyczny HTML = lepsze zrozumienie przez LLM.**
Crawler AI parsuje `<article>`, `<h1>`, `<table>`, `<nav>` i od razu rozumie strukturę. Klasy typu `flex gap-4 rounded-xl shadow-md` to szum — LLM nie wyciąga z nich znaczenia, a mogą zaciemniać DOM.

**2. Czystszy DOM = mniej tokenów = lepszy kontekst.**
Classless HTML jest 30-50% krótszy niż utility-first (Tailwind). Gdy OAI-SearchBot crawluje stronę produktu, więcej tokenów idzie na treść (nazwa, cena, opis) a mniej na dekorację (`class="mt-4 px-6 py-3 bg-zinc-900 text-white..."`).

**3. Schema.org JSON-LD + czysty HTML = maximum discovery.**
Crawlery AI szukają `<script type="application/ld+json">` i semantycznych tagów. Im mniej szumu w HTML, tym łatwiej je znaleźć. Classless CSS nie dodaje nic do HTML — cały styl jest w jednym pliku CSS, który crawlery ignorują.

**4. SSR/SSG bez JS = dostępność dla wszystkich botów.**
OAI-SearchBot NIE wykonuje JavaScript. Astro `output: 'static'` generuje czysty HTML. Zero hydration, zero client JS, zero problemów z renderowaniem po stronie bota.

## Stack

- **Astro** (SSG, `output: 'static'`) — jedyna zależność
- **Classless CSS** — `swiss.css` (editorial 620px), `shadcn.css` (dashboard 1100px)
- **Scoped komponenty** — `src/themes/{motyw}/*.astro` ze `<style>` w środku
- **Zero JS w przeglądarce** — output to `.html` + `.css`

## Motywy i komponenty

Każdy motyw to layout + bazowy CSS + zestaw komponentów ze scoped CSS:

| Motyw | Layout | Zastosowanie | Komponenty |
|---|---|---|---|
| **swiss** | 620px, jedna kolumna | Landingi, strony produktów, artykuły | Card, Badge, StatGrid, Steps |
| **shadcn** | 1100px, dashboard | Rankingi, listingi, panele danych | Card, Badge, StatGrid, ScoreBar |

Komponenty mają scoped CSS (jak Svelte) — Astro dodaje unikalne atrybuty, style nie wyciekają.

```astro
---
import Badge from '../themes/shadcn/Badge.astro';
import ScoreBar from '../themes/shadcn/ScoreBar.astro';
---
<Badge variant="yes">Tak</Badge>
<ScoreBar score={8} />
```

## MCP Server

**MCP działa w katalogu `frontend/`.** Uruchom Claude Code z `frontend/` — toole załadują się automatycznie z `frontend/.claude/settings.json`.

LLM nie musi czytać plików żeby wiedzieć jakie komponenty są dostępne. Pyta MCP i dostaje propsy, przykłady, gotowy import.

**Toole:**

| Tool | Co zwraca |
|---|---|
| `list_themes` | Lista motywów z opisami, layoutem, bazowym CSS, listą komponentów |
| `list_components(theme)` | Propsy, sloty, przykłady użycia, gotowy `import` — wszystko co LLM potrzebuje żeby użyć komponentu bez czytania źródła |
| `get_component(theme, component)` | Pełne źródło `.astro` — gdy LLM chce zmodyfikować lub zrozumieć implementację |

**Podpięcie:** MCP jest skonfigurowany w `frontend/.claude/settings.json`. Ładuje się automatycznie gdy Claude Code jest uruchomiony z katalogu `frontend/`:

```json
{
  "mcpServers": {
    "themes": {
      "command": "node",
      "args": ["../mcp/themes-server.js"]
    }
  }
}
```

Jeśli pracujesz z poziomu root (`OTWARTY-SKLEP/`), dodaj do `.claude/settings.json` lub `.claude/settings.local.json`:

```json
{
  "mcpServers": {
    "themes": {
      "command": "node",
      "args": ["mcp/themes-server.js"]
    }
  }
}
```

## Build

```bash
cd frontend
npm install
npm run build    # → dist/
npm run dev      # → localhost:4321
```
