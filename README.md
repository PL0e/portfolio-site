# Glendell S. Dia - Portfolio Website

A single-page portfolio for front-end web development, with a focus on SEO and accessibility.
Built with plain **HTML, CSS, and JavaScript**: no build step, no framework.

Live: https://pl0e.github.io/portfolio-site/

## Sections

| Section | What it shows |
| --- | --- |
| Hero | Name, rotating role, quote, CV download, social links |
| Tech marquee | Tools and technologies (auto-scrolling, pauses on hover) |
| About | Intro, key stats, skill areas, education |
| Experience | Work timeline, newest first |
| Projects | Concept storefront gallery (4 demos), concept sites (5 demos), client work, and project cards |
| Certificates | Awards and certifications |
| Off the clock | Pets |
| Contact | Contact details + a form that opens the visitor's email app |

## Running locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## File structure

```
portfolio-site/
├── index.html            # All page content
├── styles.css            # Design tokens (top of file), layout, responsive rules
├── script.js             # Nav, scroll-spy, reveal animations, typewriter, marquee, contact form
├── projects/
│   ├── shared/           # demo-kit.js/.css: cart, filters, GA4 events, SEO & Analytics panel
│   ├── hinabi/           # Filipino handwoven goods store
│   ├── kitchen-line/     # Pickleball shop (paddle finder, FAQ rich results)
│   ├── glowform/         # Lamp shop (light switch, color-temperature slider)
│   └── bean-and-brass/   # Coffee shop: beans, machines, café menu, brew calculator
└── assets/
    ├── resume_diaglendell_.pdf   # The CV linked from the site
    └── img/                      # Web-optimized images (profile, og-image, pets)
```

## Common edits

- **Colors / fonts:** change the variables in `:root` at the top of `styles.css` (accent is `--accent`).
- **Landing gate:** on a first visit (no `#hash` in the URL) the page shows only the word-search hero; everything
  below it stays rendered for search engines but is `inert` and scroll-locked until "View portfolio" or any in-page
  link is clicked (`is-gated` is set in `<head>`, handled at the top of `script.js`, remembered for the session).
- **Portrait:** `assets/img/profile-cutout.webp/.png` is a background-removed cut-out (U²-Net human segmentation, run
  locally) shown on a faded panel with three animated pixel octopi.
- **Word-search hero:** the letters and hidden words live in `index.html` (`data-words="WORD,row,col,dRow,dCol;..."`
  on `.wordsearch`); `script.js` draws a ring around each word from the live letter positions. Change a word in both
  the grid letters and `data-words`. Theme: white with `--accent` #c63d24 for text (5.1:1 on white) and
  `--accent-bright` #e2502f for rings and large shapes; font is Jost.
- **Rotating hero roles:** edit the `data-roles` attribute on `.hero__role-text` in `index.html`.
- **Resume:** replace `assets/resume_diaglendell_.pdf` (keep the same filename, or update the links).
- **Add a project:** copy an `<li class="project">` block in the Projects section. Cover colors come from
  `.project__cover--a` … `--g` in `styles.css`. Add `project--wide` to make a card span two columns on desktop.
- **Add a job:** copy an `<li class="timeline__item">` block. Add `timeline__item--current` to highlight the current role.
- **Profile photo:** replace `assets/img/profile.jpg` and `profile.webp` (4:5 ratio, ~640×800).
- **Pixel octopus logo:** `assets/img/octopus.svg` (16×16 pixel grid). The same shapes are inlined in `index.html`
  as `<symbol id="octo">` (used by the header, footer, and background) and in the favicon data URI, so update all three
  together. The drifting background octopi and bubbles are the `.bg-play` elements right after `<body>`.

## Concept storefronts

`projects/` holds four self-contained demos for **fictional** brands: Hinabi (handwoven goods), Kitchen Line
(pickleball), Glowform (lamps), and Bean & Brass (coffee). Each has its own design, Open Graph tags, canonical URL,
and JSON-LD (store type, products with offers, plus FAQPage / BreadcrumbList / Menu where relevant). Because the
brands and prices are made up, every demo uses `noindex` so none appears in search results as a real store.

**Concept sites & web apps:** five more fictional brands, inspired by real sites but with original names, copy, and
teams: `rallyo/` (pickleball scoring app landing page with a working side-out scorer), `tala-shs/` (senior high
school site with ARIA strand tabs), `lucky-lagoon/` (game lobby UI; demo only, no accounts or real-money play, with
18+ and responsible-gaming notices), `tally/` (working scoreboard web app: presets, sets, caps, serve rotation, undo,
keyboard shortcuts), and `vcal/` (collegiate league hub with a sport filter, standings, and schedule). They use the
same shared demo kit, sample search data, noindex, and Openverse photos with footer credits. The sample search
generator caps every demo below 50 clicks per 28 days.

**Hinabi woven art:** Hinabi uses a dark luxe editorial theme. `projects/hinabi/img/art/` holds flat SVG art used as CSS backgrounds: basket-weave page
textures (`weave-tile-dark.svg`, plus the light `weave-tile.svg`), an over/under plain-weave medallion (`medallion.svg`), an inabel-style divider band
(`inabel-band.svg`), and a banig diamond tile (`banig-tile.svg`). Keeping them as CSS backgrounds keeps the HTML lean.

**Photos:** each store's `img/` folder holds web-optimized photos (WebP + JPEG fallback) found through
[Openverse](https://openverse.org) and limited to **CC0** or **CC BY** licenses. `img/credits.json` records each
photo's title, author, source, and license, and every store lists those credits in its footer as CC BY requires.
Photos with third-party logos/branded products or prominent identifiable faces were deliberately avoided.

All four load `projects/shared/demo-kit.js`, which provides:

- **Store behavior:** category filters, demo cart, newsletter form (nothing is stored).
- **GA4 events:** `page_view`, `view_item_list`, `select_content`, `add_to_cart`, `view_cart`, `generate_lead`,
  and `scroll`, pushed to `window.dataLayer`. To send them to Google Analytics, put a measurement ID in the page's
  `<meta name="ga-measurement-id" content="G-XXXXXXXXXX">` tag. It is empty by default, so there is no tracking.
- **SEO & Analytics panel:** the floating button opens four tabs, all computed from the live page:
  - **Site audit** (Semrush-style): Site Health score from 27 checks weighted by severity (errors ×3, warnings ×2,
    notices ×1), error/warning/notice counts, and thematic scores for Crawlability, On-page, Markup, Links, and
    Performance.
  - **Keywords:** each target keyword from `<html data-target-keywords="kw one|kw two">`, with its placement in the
    title, meta description, H1, H2s, and first 100 words, plus count, density, and the page's most frequent terms.
  - **Search:** a Google Search Console-style performance report (clicks, impressions, CTR, average position,
    a 28-day chart, top queries, devices). **This tab is generated sample data**, clearly labeled in the UI: it is
    seeded per page so it stays stable and internally consistent (clicks = impressions × CTR, totals = sum of days),
    with queries built from the page's target keywords. The generator is `projects/shared/search-sample.js`; the
    portfolio's storefront cards load the same file to show a mini dashboard (totals + daily-clicks sparkline), so the
    card and the store always show identical numbers. Each card's `data-title`, `data-brand`, and `data-keywords` must
    match that store's `<title>`, `og:site_name`, and `data-target-keywords`.
  - **Vitals:** LCP, CLS, FCP, and TTFB measured in the browser, plus requests and transfer size.
  - **Events:** every GA4 event as it fires.

  Apart from the labeled sample Search tab, no search volume, rankings, traffic, or backlinks are shown: real figures
  need real search data, which a noindexed concept site doesn't have.

## Blog

`blog/` holds the Writing section: `blog/index.html` (the list) and one folder per article, e.g.
`blog/seo-and-geo-in-web-development/` with its own `og-image.jpg`. Article pages reuse `../styles.css` for the
header, footer, and theme, plus `blog/blog.css` (reading layout) and `blog/blog.js` (mobile menu, table-of-contents
highlight). Each article carries BlogPosting, BreadcrumbList, and (where the Q&A is visible on the page) FAQPage
JSON-LD. `sitemap.xml` lists the homepage and blog pages; the noindexed concept stores are deliberately excluded.
Submit it in Google Search Console after deploying.

## Contact form

GitHub Pages can't run a server, so the form builds a `mailto:` link to open the visitor's email app with the
message pre-filled. To receive messages without that step, point the form at a service such as Formspree.

## Accessibility & performance

- Semantic landmarks, skip link, visible focus styles, ARIA on the mobile menu
- Respects `prefers-reduced-motion` (disables typewriter, marquee, and reveal animations)
- Content stays visible if JavaScript is disabled
- WebP images with JPEG fallback, explicit image dimensions, lazy-loaded below-the-fold images
- Open Graph tags and JSON-LD `Person` data for search and link previews
