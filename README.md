# Glendell S. Dia - Portfolio Website

A single-page portfolio for data analytics and cloud / site reliability engineering work.
Built with plain **HTML, CSS, and JavaScript**: no build step, no framework.

Live: https://pl0e.github.io/portfolio-site/

## Sections

| Section | What it shows |
| --- | --- |
| Hero | Name, rotating role, quote, CV download, social links |
| Tech marquee | Tools and technologies (auto-scrolling, pauses on hover) |
| About | Intro, key stats, skill areas, education |
| Experience | Work timeline, newest first |
| Projects | Featured Power BI case study + project cards |
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
└── assets/
    ├── resume_diaglendell_.pdf   # The CV linked from the site
    └── img/                      # Web-optimized images (profile, og-image, pets)
```

## Common edits

- **Colors / fonts:** change the variables in `:root` at the top of `styles.css` (accent is `--accent`).
- **Rotating hero roles:** edit the `data-roles` attribute on `.hero__role-text` in `index.html`.
- **Resume:** replace `assets/resume_diaglendell_.pdf` (keep the same filename, or update the links).
- **Add a project:** copy an `<li class="project">` block in the Projects section. Cover colors come from
  `.project__cover--a` … `--e` in `styles.css`.
- **Add a job:** copy an `<li class="timeline__item">` block. Add `timeline__item--current` to highlight the current role.
- **Profile photo:** replace `assets/img/profile.jpg` and `profile.webp` (4:5 ratio, ~640×800).

## Contact form

GitHub Pages can't run a server, so the form builds a `mailto:` link to open the visitor's email app with the
message pre-filled. To receive messages without that step, point the form at a service such as Formspree.

## Accessibility & performance

- Semantic landmarks, skip link, visible focus styles, ARIA on the mobile menu
- Respects `prefers-reduced-motion` (disables typewriter, marquee, and reveal animations)
- Content stays visible if JavaScript is disabled
- WebP images with JPEG fallback, explicit image dimensions, lazy-loaded below-the-fold images
- Open Graph tags and JSON-LD `Person` data for search and link previews
