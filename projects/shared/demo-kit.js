/**
 * Demo kit shared by the concept storefronts.
 *
 * - Store behavior: product filters, demo cart, newsletter form, toast.
 * - Analytics: GA4-style events pushed to window.dataLayer. If the page sets
 *   <meta name="ga-measurement-id" content="G-XXXX">, gtag.js is loaded and the
 *   same events are sent to Google Analytics 4. Empty by default (no tracking).
 * - SEO & Analytics panel: a live, in-page audit of the page's own SEO markup,
 *   measured Core Web Vitals, and a log of every analytics event fired.
 *
 * Markup contract (all optional):
 *   [data-add][data-price][data-category]   add-to-cart buttons
 *   [data-cart], [data-cart-count]          cart button + counter
 *   [data-filter] chips, [data-grid] [data-cat] cards, [data-live] status
 *   form[data-news] + [data-news-msg]       newsletter
 */
;(() => {
  "use strict"

  const doc = document
  const $ = (sel, root = doc) => root.querySelector(sel)
  const $$ = (sel, root = doc) => [...root.querySelectorAll(sel)]
  const currency = doc.documentElement.dataset.currency || "PHP"

  // ---------------------------------------------------------------------------
  // Analytics
  // ---------------------------------------------------------------------------
  window.dataLayer = window.dataLayer || []
  const events = []
  const gaId = ($('meta[name="ga-measurement-id"]') || {}).content || ""

  if (/^G-[A-Z0-9]+$/i.test(gaId)) {
    const s = doc.createElement("script")
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`
    doc.head.appendChild(s)
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag("js", new Date())
    window.gtag("config", gaId)
  }

  /** Record an event. gtag already sends page_view itself, so that one stays local. */
  function track(name, params = {}) {
    window.dataLayer.push({ event: name, ...params })
    if (typeof window.gtag === "function" && name !== "page_view") window.gtag("event", name, params)
    events.push({ name, params, time: new Date() })
    panel.renderEvents()
  }

  const itemFromButton = (btn) => ({
    item_name: btn.dataset.add,
    item_category: btn.dataset.category || btn.closest("[data-cat]")?.dataset.cat || "general",
    price: Number(btn.dataset.price) || 0,
    quantity: 1,
  })

  // ---------------------------------------------------------------------------
  // Toast
  // ---------------------------------------------------------------------------
  let toast = $("[data-toast]")
  if (!toast) {
    toast = doc.createElement("div")
    toast.className = "dk-toast"
    toast.setAttribute("role", "status")
    toast.setAttribute("aria-live", "polite")
    doc.body.appendChild(toast)
  }
  let toastTimer
  function showToast(text) {
    toast.textContent = text
    toast.classList.add("is-show")
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toast.classList.remove("is-show"), 2400)
  }

  // ---------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------
  const chips = $$("[data-filter]")
  const cards = $$("[data-grid] [data-cat]")
  const live = $("[data-live]")
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter
      chips.forEach((c) => {
        const on = c === chip
        c.classList.toggle("is-active", on)
        c.setAttribute("aria-pressed", String(on))
      })
      let shown = 0
      cards.forEach((card) => {
        const match = filter === "all" || card.dataset.cat.split(" ").includes(filter)
        card.hidden = !match
        if (match) shown++
      })
      if (live) live.textContent = `Showing ${shown} product${shown === 1 ? "" : "s"}`
      track("select_content", { content_type: "product_filter", content_id: filter })
    })
  })

  // ---------------------------------------------------------------------------
  // Demo cart
  // ---------------------------------------------------------------------------
  const cartBtn = $("[data-cart]")
  const cartCount = $("[data-cart-count]")
  const cart = []
  const fmt = (n) => new Intl.NumberFormat("en-PH", { style: "currency", currency, maximumFractionDigits: 0 }).format(n)

  $$("[data-add]").forEach((btn) => {
    const label = btn.textContent
    btn.addEventListener("click", () => {
      const item = itemFromButton(btn)
      cart.push(item)
      if (cartCount) cartCount.textContent = cart.length
      if (cartBtn) {
        cartBtn.setAttribute("aria-label", `Cart, ${cart.length} item${cart.length === 1 ? "" : "s"}`)
        cartBtn.classList.remove("is-bump")
        void cartBtn.offsetWidth // restart the bump animation
        cartBtn.classList.add("is-bump")
      }
      btn.textContent = "Added ✓"
      btn.classList.add("is-added")
      setTimeout(() => {
        btn.textContent = label
        btn.classList.remove("is-added")
      }, 1400)
      showToast(`${item.item_name} added to cart`)
      track("add_to_cart", { currency, value: item.price, items: [item] })
    })
  })

  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      const total = cart.reduce((sum, i) => sum + i.price, 0)
      showToast(cart.length ? `Demo cart: ${cart.length} item${cart.length === 1 ? "" : "s"}, ${fmt(total)}. Checkout is disabled in this concept.` : "Your cart is empty.")
      track("view_cart", { currency, value: total, items: cart.slice() })
    })
  }

  // ---------------------------------------------------------------------------
  // Newsletter (demo only, nothing is stored)
  // ---------------------------------------------------------------------------
  $$("form[data-news]").forEach((form) => {
    const msg = $("[data-news-msg]", form)
    const input = $("input[type=email]", form)
    input.addEventListener("input", () => input.removeAttribute("aria-invalid"))
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      if (!input.value.trim() || !input.checkValidity()) {
        input.setAttribute("aria-invalid", "true")
        msg.textContent = "Please enter a valid email address."
        input.focus()
        return
      }
      msg.textContent = "Thanks! (Demo only, so no email was stored.)"
      form.reset()
      track("generate_lead", { lead_source: "newsletter" })
    })
  })

  // ---------------------------------------------------------------------------
  // Core Web Vitals (measured in this browser)
  // ---------------------------------------------------------------------------
  const vitals = { lcp: null, cls: 0, fcp: null, ttfb: null }
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      vitals.lcp = entries[entries.length - 1].startTime
      panel.renderVitals()
    }).observe({ type: "largest-contentful-paint", buffered: true })
    new PerformanceObserver((list) => {
      list.getEntries().forEach((e) => {
        if (!e.hadRecentInput) vitals.cls += e.value
      })
      panel.renderVitals()
    }).observe({ type: "layout-shift", buffered: true })
    new PerformanceObserver((list) => {
      const fcp = list.getEntries().find((e) => e.name === "first-contentful-paint")
      if (fcp) vitals.fcp = fcp.startTime
      panel.renderVitals()
    }).observe({ type: "paint", buffered: true })
  } catch {
    /* Older browsers: vitals stay "n/a". */
  }

  function pageWeight() {
    const nav = performance.getEntriesByType("navigation")[0]
    const res = performance.getEntriesByType("resource")
    const size = (e) => e.transferSize || e.encodedBodySize || 0
    if (nav) vitals.ttfb = nav.responseStart
    return {
      requests: res.length + 1,
      kb: Math.round(((nav ? size(nav) : 0) + res.reduce((t, e) => t + size(e), 0)) / 1024),
    }
  }

  // ---------------------------------------------------------------------------
  // Site audit (Semrush-style): issues by severity, Site Health, thematic scores.
  // Everything is computed from this page's own markup and this browser's
  // measurements. No search volume, ranking, traffic, or backlink data exists
  // for a noindexed concept site, so none is shown.
  // ---------------------------------------------------------------------------
  const SEVERITY_WEIGHT = { error: 3, warning: 2, notice: 1 }
  const isPanel = (el) => !!el.closest(".dk, .dk-toast")

  function visibleText() {
    return $$("body > *")
      .filter((el) => !isPanel(el) && el.tagName !== "SCRIPT")
      .map((el) => el.innerText || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
  }

  function audit() {
    const issues = []
    const add = (label, severity, category, ok, value) => issues.push({ label, severity, category, ok: !!ok, value: String(value) })
    const meta = (sel) => ($(sel) || {}).content || ""
    const name = (el) => (el.getAttribute("aria-label") || el.textContent || el.title || "").trim()

    // Crawlability & indexing
    const robots = meta('meta[name="robots"]')
    add("Language declared", "error", "Crawlability", doc.documentElement.lang, doc.documentElement.lang || "missing")
    add("Mobile viewport", "error", "Crawlability", $('meta[name="viewport"]'), $('meta[name="viewport"]') ? "set" : "missing")
    const canonical = ($('link[rel="canonical"]') || {}).href || ""
    add("Canonical URL", "warning", "Crawlability", /^https?:\/\//.test(canonical), canonical ? new URL(canonical).pathname : "missing")
    const ids = $$("[id]").filter((el) => !isPanel(el)).map((el) => el.id)
    const dupIds = ids.filter((v, i) => ids.indexOf(v) !== i)
    add("No duplicate IDs", "error", "Crawlability", dupIds.length === 0, dupIds.length ? [...new Set(dupIds)].join(", ") : "0 duplicates")
    issues.push({ label: "Indexing", severity: "info", category: "Crawlability", ok: true, value: robots.includes("noindex") ? "noindex (intentional: fictional brand)" : "indexable" })

    // On-page content
    const title = doc.title.trim()
    add("Title tag present", "error", "On-page", title, title ? "set" : "missing")
    add("Title length 30–65", "warning", "On-page", title.length >= 30 && title.length <= 65, `${title.length} chars`)
    const desc = meta('meta[name="description"]')
    add("Meta description present", "error", "On-page", desc, desc ? "set" : "missing")
    add("Meta description 70–160", "warning", "On-page", desc.length >= 70 && desc.length <= 160, `${desc.length} chars`)
    const h1s = $$("h1")
    add("H1 present", "error", "On-page", h1s.length > 0, `${h1s.length} found`)
    add("Single H1", "notice", "On-page", h1s.length === 1, `${h1s.length} found`)
    add("H1 differs from title", "notice", "On-page", h1s[0] && h1s[0].textContent.trim() !== title, h1s[0] ? "unique" : "n/a")
    const levels = $$("h1, h2, h3, h4, h5, h6").filter((h) => !isPanel(h)).map((h) => Number(h.tagName[1]))
    add("Heading order", "warning", "On-page", !levels.some((l, i) => i > 0 && l > levels[i - 1] + 1), `${levels.length} headings`)
    const text = visibleText()
    const words = text.split(" ").filter(Boolean).length
    add("Word count ≥ 200", "warning", "On-page", words >= 200, `${words} words`)
    const panelHtml = $$(".dk, .dk-toast").reduce((t, el) => t + el.outerHTML.length, 0)
    const htmlLen = doc.documentElement.outerHTML.length - panelHtml
    const ratio = (text.length / htmlLen) * 100
    add("Text-to-HTML ratio ≥ 10%", "notice", "On-page", ratio >= 10, `${ratio.toFixed(1)}%`)

    // Markup
    const types = []
    let ldValid = true
    $$('script[type="application/ld+json"]').forEach((s) => {
      try {
        const walk = (n) => {
          if (Array.isArray(n)) return n.forEach(walk)
          if (n && typeof n === "object") {
            if (n["@type"]) types.push(n["@type"])
            Object.values(n).forEach(walk)
          }
        }
        walk(JSON.parse(s.textContent))
      } catch {
        ldValid = false
      }
    })
    const schemaTypes = [...new Set(types.flat())]
    add("Structured data valid", "error", "Markup", ldValid && schemaTypes.length > 0, ldValid ? `${schemaTypes.length} types` : "invalid JSON")
    const og = ["og:title", "og:description", "og:image", "og:url"].filter((p) => meta(`meta[property="${p}"]`))
    add("Open Graph tags", "warning", "Markup", og.length === 4, `${og.length}/4`)
    add("Twitter card", "notice", "Markup", meta('meta[name="twitter:card"]'), meta('meta[name="twitter:card"]') || "missing")
    add("Favicon", "notice", "Markup", $('link[rel~="icon"]'), $('link[rel~="icon"]') ? "set" : "missing")

    // Links & accessibility
    const anchors = $$("a[href]").filter((a) => !isPanel(a))
    const brokenHash = anchors.filter((a) => {
      const h = a.getAttribute("href")
      return h.length > 1 && h.startsWith("#") && !doc.getElementById(decodeURIComponent(h.slice(1)))
    })
    add("No broken internal anchors", "error", "Links", brokenHash.length === 0, `${anchors.length - brokenHash.length}/${anchors.length} OK`)
    const unnamed = anchors.filter((a) => !name(a) && !$("img[alt]:not([alt=''])", a))
    add("Links have text", "warning", "Links", unnamed.length === 0, `${anchors.length - unnamed.length}/${anchors.length}`)
    const unsafeBlank = anchors.filter((a) => a.target === "_blank" && !/noopener|noreferrer/.test(a.rel))
    add("External links use rel=noopener", "notice", "Links", unsafeBlank.length === 0, `${unsafeBlank.length} unsafe`)
    const buttons = $$("button").filter((b) => !isPanel(b))
    add("Buttons have names", "warning", "Links", buttons.every(name), `${buttons.filter(name).length}/${buttons.length}`)
    const imgs = $$("img").filter((i) => !isPanel(i))
    add("Images have alt text", "warning", "Links", imgs.every((i) => i.hasAttribute("alt")), `${imgs.filter((i) => i.hasAttribute("alt")).length}/${imgs.length}`)
    const fields = $$("input:not([type=hidden]), select, textarea").filter((f) => !isPanel(f))
    const labeled = fields.filter((f) => (f.id && $(`label[for="${f.id}"]`)) || f.getAttribute("aria-label"))
    add("Form fields labeled", "warning", "Links", labeled.length === fields.length, `${labeled.length}/${fields.length}`)

    // Performance & Core Web Vitals (only scored once measured)
    const w = pageWeight()
    add("Page weight < 2 MB", "warning", "Performance", w.kb < 2048, `${w.kb} KB`)
    if (vitals.lcp != null) add("LCP ≤ 2.5 s", "warning", "Performance", vitals.lcp <= 2500, `${Math.round(vitals.lcp)} ms`)
    add("CLS ≤ 0.1", "warning", "Performance", vitals.cls <= 0.1, vitals.cls.toFixed(3))

    // Scores
    const scored = issues.filter((i) => i.severity !== "info")
    const weight = (list) => list.reduce((t, i) => t + SEVERITY_WEIGHT[i.severity], 0)
    const health = Math.round((weight(scored.filter((i) => i.ok)) / weight(scored)) * 100)
    const counts = { error: 0, warning: 0, notice: 0 }
    scored.filter((i) => !i.ok).forEach((i) => counts[i.severity]++)
    const categories = [...new Set(scored.map((i) => i.category))].map((c) => {
      const list = scored.filter((i) => i.category === c)
      return { name: c, score: Math.round((weight(list.filter((i) => i.ok)) / weight(list)) * 100) }
    })
    return {
      issues,
      health,
      counts,
      categories,
      passed: scored.filter((i) => i.ok).length,
      total: scored.length,
      schemaTypes,
      words,
    }
  }

  // ---------------------------------------------------------------------------
  // On-page keyword analysis for the page's declared target keywords
  // (<html data-target-keywords="kw one|kw two">). Placement, count, density,
  // plus the most frequent terms on the page. No search-volume data.
  // ---------------------------------------------------------------------------
  const STOPWORDS = new Set("a an and are as at be by for from has have i in is it its of on or our so that the their them they this to was we what when where which will with you your can all any into more not one out over than then there these those up us very just each every how get got made make per also only".split(" "))
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")

  function keywords() {
    const targets = (doc.documentElement.dataset.targetKeywords || "").split("|").map((k) => k.trim()).filter(Boolean)
    const text = norm(visibleText())
    const words = text.match(/[a-z0-9]+(?:[-'][a-z0-9]+)*/g) || []
    const first100 = words.slice(0, 100).join(" ")
    const count = (hay, kw) => (hay.match(new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g")) || []).length
    const inText = (sel) => $$(sel).filter((el) => !isPanel(el)).map((el) => norm(el.textContent)).join(" ")

    const places = {
      Title: norm(doc.title),
      Description: norm(($('meta[name="description"]') || {}).content || ""),
      H1: inText("h1"),
      H2: inText("h2"),
      "First 100 words": first100,
    }
    const report = targets.map((kw) => {
      const k = norm(kw)
      const hits = count(text, k)
      const found = Object.fromEntries(Object.entries(places).map(([p, hay]) => [p, count(hay, k) > 0]))
      const score = Object.values(found).filter(Boolean).length
      return { keyword: kw, hits, density: words.length ? ((hits * k.split(" ").length) / words.length) * 100 : 0, found, score, max: Object.keys(places).length }
    })

    const freq = {}
    words.filter((w) => w.length > 2 && !STOPWORDS.has(w) && !/^\d+$/.test(w)).forEach((w) => (freq[w] = (freq[w] || 0) + 1))
    const top = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
    return { report, top, totalWords: words.length }
  }

  // ---------------------------------------------------------------------------
  // Panel UI
  // ---------------------------------------------------------------------------
  const panel = (() => {
    const root = doc.createElement("div")
    root.className = "dk"
    root.innerHTML = `
      <button class="dk-fab" type="button" aria-expanded="false" aria-controls="dk-panel" aria-label="SEO and analytics inspector">
        <span class="dk-fab__dot" aria-hidden="true"></span>
        <svg class="dk-fab__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <span class="dk-fab__text">SEO &amp; Analytics</span>
      </button>
      <section class="dk-panel" id="dk-panel" aria-label="SEO and analytics inspector" hidden>
        <header class="dk-head">
          <strong>SEO &amp; Analytics</strong>
          <button class="dk-close" type="button" aria-label="Close panel">×</button>
        </header>
        <div class="dk-tabs" role="group" aria-label="Panel views">
          <button type="button" class="dk-tab is-active" data-tab="audit" aria-pressed="true">Site audit</button>
          <button type="button" class="dk-tab" data-tab="keywords" aria-pressed="false">Keywords</button>
          <button type="button" class="dk-tab" data-tab="vitals" aria-pressed="false">Vitals</button>
          <button type="button" class="dk-tab" data-tab="events" aria-pressed="false">Events <span class="dk-count">0</span></button>
        </div>
        <div class="dk-body" data-view="audit"></div>
        <div class="dk-body" data-view="keywords" hidden></div>
        <div class="dk-body" data-view="vitals" hidden></div>
        <div class="dk-body" data-view="events" hidden></div>
        <p class="dk-foot">${gaId ? `Sending to GA4 property <code>${gaId.replace(/</g, "")}</code>` : "GA4 ID not set: events stay in <code>dataLayer</code> (demo mode)."}</p>
      </section>`

    const fab = $(".dk-fab", root)
    const box = $(".dk-panel", root)
    const views = Object.fromEntries($$(".dk-body", root).map((v) => [v.dataset.view, v]))
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])
    const ICON = { pass: "✓", error: "×", warning: "!", notice: "i", info: "i", fail: "!" }

    const open = (state) => {
      box.hidden = !state
      fab.setAttribute("aria-expanded", String(state))
      if (state) {
        renderAudit()
        renderKeywords()
        renderVitals()
        renderEvents()
      }
    }
    fab.addEventListener("click", () => open(box.hidden))
    $(".dk-close", root).addEventListener("click", () => {
      open(false)
      fab.focus()
    })
    doc.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !box.hidden) {
        open(false)
        fab.focus()
      }
    })
    $$(".dk-tab", root).forEach((tab) =>
      tab.addEventListener("click", () => {
        $$(".dk-tab", root).forEach((t) => {
          const on = t === tab
          t.classList.toggle("is-active", on)
          t.setAttribute("aria-pressed", String(on))
        })
        Object.entries(views).forEach(([k, v]) => (v.hidden = k !== tab.dataset.tab))
      }),
    )

    const row = (status, label, value) =>
      `<li class="dk-${status}"><span class="dk-ico" aria-hidden="true">${ICON[status]}</span><span>${esc(label)}</span><em>${esc(value)}</em></li>`

    function renderAudit() {
      if (box.hidden) return
      const r = audit()
      const failing = r.issues.filter((i) => !i.ok)
      const passed = r.issues.filter((i) => i.ok && i.severity !== "info")
      const info = r.issues.filter((i) => i.severity === "info")
      const tone = r.health >= 90 ? "pass" : r.health >= 70 ? "warning" : "error"
      views.audit.innerHTML = `
        <div class="dk-health">
          <div class="dk-gauge dk-gauge--${tone}" style="--v:${r.health}" role="img" aria-label="Site Health ${r.health}%"><span>${r.health}%</span></div>
          <div>
            <p class="dk-health__label">Site Health</p>
            <ul class="dk-counts">
              <li class="dk-counts--error"><strong>${r.counts.error}</strong> Errors</li>
              <li class="dk-counts--warning"><strong>${r.counts.warning}</strong> Warnings</li>
              <li class="dk-counts--notice"><strong>${r.counts.notice}</strong> Notices</li>
            </ul>
          </div>
        </div>
        <h3 class="dk-h">Thematic reports</h3>
        <ul class="dk-bars">${r.categories
          .map((c) => `<li><span>${esc(c.name)}</span><span class="dk-bar"><span style="width:${c.score}%"></span></span><em>${c.score}%</em></li>`)
          .join("")}</ul>
        <h3 class="dk-h">Issues</h3>
        ${failing.length ? `<ul class="dk-list">${failing.map((i) => row(i.severity, i.label, i.value)).join("")}</ul>` : `<p class="dk-note dk-note--ok">No errors, warnings, or notices.</p>`}
        <ul class="dk-list">${info.map((i) => row("info", i.label, i.value)).join("")}</ul>
        <details class="dk-more"><summary>Passed checks (${passed.length})</summary>
          <ul class="dk-list">${passed.map((i) => row("pass", i.label, i.value)).join("")}</ul>
        </details>
        <p class="dk-note">Semrush-style audit computed from this page in your browser (${r.total} checks, weighted by severity). Search volume, rankings, traffic, and backlinks need real search data, which a noindexed concept site doesn't have.</p>`
    }

    function renderKeywords() {
      if (box.hidden) return
      const k = keywords()
      views.keywords.innerHTML = `
        <h3 class="dk-h">Target keywords · on-page placement</h3>
        ${
          k.report.length
            ? `<ul class="dk-kws">${k.report
                .map(
                  (r) => `<li>
                    <div class="dk-kw__top"><strong>${esc(r.keyword)}</strong><em>${r.score}/${r.max}</em></div>
                    <div class="dk-kw__meta">${r.hits}× on page · ${r.density.toFixed(2)}% density</div>
                    <ul class="dk-chips">${Object.entries(r.found)
                      .map(([p, ok]) => `<li class="${ok ? "is-ok" : "is-miss"}">${ok ? "✓" : "–"} ${esc(p)}</li>`)
                      .join("")}</ul>
                  </li>`,
                )
                .join("")}</ul>`
            : `<p class="dk-note">No target keywords declared on this page.</p>`
        }
        <h3 class="dk-h">Top terms on this page</h3>
        <ol class="dk-terms">${k.top.map(([w, n]) => `<li><span>${esc(w)}</span><em>${n}</em></li>`).join("")}</ol>
        <p class="dk-note">${k.totalWords} words analyzed. Placement and density are measured from the live page; no search-volume data.</p>`
    }

    function renderVitals() {
      if (box.hidden) return
      const w = pageWeight()
      const ms = (v) => (v == null ? "n/a" : `${Math.round(v)} ms`)
      const grade = (v, good, poor) => (v == null ? "info" : v <= good ? "pass" : v <= poor ? "warning" : "error")
      const rows = [
        ["LCP · Largest Contentful Paint", ms(vitals.lcp), grade(vitals.lcp, 2500, 4000)],
        ["CLS · Cumulative Layout Shift", vitals.cls.toFixed(3), grade(vitals.cls, 0.1, 0.25)],
        ["FCP · First Contentful Paint", ms(vitals.fcp), grade(vitals.fcp, 1800, 3000)],
        ["TTFB · Time to First Byte", ms(vitals.ttfb), grade(vitals.ttfb, 800, 1800)],
        ["Requests", String(w.requests), "info"],
        ["Transferred", `${w.kb} KB`, "info"],
      ]
      views.vitals.innerHTML = `
        <ul class="dk-list">${rows.map(([l, v, s]) => row(s, l, v)).join("")}</ul>
        <p class="dk-note">Measured live in this browser. Thresholds follow Google's "good" ranges.</p>`
    }

    function renderEvents() {
      $(".dk-count", root).textContent = events.length
      if (box.hidden) return
      views.events.innerHTML = events.length
        ? `<ol class="dk-events">${events
            .slice()
            .reverse()
            .map((e) => `<li><div><strong>${esc(e.name)}</strong><time>${e.time.toLocaleTimeString()}</time></div><code>${esc(JSON.stringify(e.params))}</code></li>`)
            .join("")}</ol>`
        : `<p class="dk-note">No events yet.</p>`
    }

    doc.body.appendChild(root)
    return { renderAudit, renderKeywords, renderVitals, renderEvents }
  })()

  // ---------------------------------------------------------------------------
  // Page-level events
  // ---------------------------------------------------------------------------
  track("page_view", { page_title: doc.title, page_location: location.pathname })
  const listButtons = $$("[data-add]")
  if (listButtons.length) {
    track("view_item_list", {
      item_list_name: ($("[data-grid]") || {}).dataset?.listName || "Products",
      items: listButtons.map(itemFromButton),
    })
  }
  let scrolled = false
  window.addEventListener(
    "scroll",
    () => {
      if (scrolled) return
      const max = doc.documentElement.scrollHeight - innerHeight
      if (max > 0 && scrollY / max >= 0.9) {
        scrolled = true
        track("scroll", { percent_scrolled: 90 })
      }
    },
    { passive: true },
  )

  // Exposed for testing and for the portfolio's audit script.
  window.DemoKit = { audit, keywords, vitals, events, pageWeight, track }
})()
