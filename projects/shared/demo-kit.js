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
  // SEO audit (reads this page's own markup)
  // ---------------------------------------------------------------------------
  function audit() {
    const checks = []
    const add = (label, ok, value, info = false) => checks.push({ label, status: info ? "info" : ok ? "pass" : "warn", value })
    const meta = (sel) => ($(sel) || {}).content || ""

    const title = doc.title.trim()
    add("Title length (30–65)", title.length >= 30 && title.length <= 65, `${title.length} chars`)
    const desc = meta('meta[name="description"]')
    add("Meta description (70–160)", desc.length >= 70 && desc.length <= 160, `${desc.length} chars`)
    const canonical = ($('link[rel="canonical"]') || {}).href || ""
    add("Canonical URL", /^https?:\/\//.test(canonical), canonical ? new URL(canonical).pathname : "missing")
    add("Language attribute", !!doc.documentElement.lang, doc.documentElement.lang || "missing")
    add("Mobile viewport", !!$('meta[name="viewport"]'), $('meta[name="viewport"]') ? "set" : "missing")

    const robots = meta('meta[name="robots"]')
    add("Robots", true, robots.includes("noindex") ? "noindex (intentional: fictional brand)" : robots || "index", robots.includes("noindex"))

    const h1s = $$("h1")
    add("Exactly one H1", h1s.length === 1, `${h1s.length} found`)
    const levels = $$("h1, h2, h3, h4, h5, h6").map((h) => Number(h.tagName[1]))
    const skipped = levels.some((l, i) => i > 0 && l > levels[i - 1] + 1)
    add("Heading order (no skipped levels)", !skipped, `${levels.length} headings`)

    const imgs = $$("img")
    const missingAlt = imgs.filter((i) => !i.hasAttribute("alt")).length
    add("Images have alt text", missingAlt === 0, `${imgs.length - missingAlt}/${imgs.length}`)

    const og = ["og:title", "og:description", "og:image", "og:url"].filter((p) => meta(`meta[property="${p}"]`))
    add("Open Graph tags", og.length === 4, `${og.length}/4`)
    add("Twitter card", !!meta('meta[name="twitter:card"]'), meta('meta[name="twitter:card"]') || "missing")

    const types = []
    let ldValid = true
    $$('script[type="application/ld+json"]').forEach((s) => {
      try {
        const data = JSON.parse(s.textContent)
        const walk = (n) => {
          if (Array.isArray(n)) return n.forEach(walk)
          if (n && typeof n === "object") {
            if (n["@type"]) types.push(n["@type"])
            Object.values(n).forEach(walk)
          }
        }
        walk(data)
      } catch {
        ldValid = false
      }
    })
    const uniqueTypes = [...new Set(types.flat())]
    add("Structured data (JSON-LD)", ldValid && uniqueTypes.length > 0, ldValid ? uniqueTypes.join(", ") || "none" : "invalid JSON")

    const name = (el) => (el.getAttribute("aria-label") || el.textContent || el.title || "").trim()
    const badLinks = $$("a[href]").filter((a) => !name(a) && !$("img[alt]:not([alt=''])", a)).length
    add("Links have accessible names", badLinks === 0, `${$$("a[href]").length - badLinks}/${$$("a[href]").length}`)
    const badButtons = $$("button").filter((b) => !name(b)).length
    add("Buttons have accessible names", badButtons === 0, `${$$("button").length - badButtons}/${$$("button").length}`)
    const fields = $$("input:not([type=hidden]), select, textarea")
    const unlabeled = fields.filter((f) => !(f.id && $(`label[for="${f.id}"]`)) && !f.getAttribute("aria-label")).length
    add("Form fields have labels", unlabeled === 0, `${fields.length - unlabeled}/${fields.length}`)
    add("Favicon", !!$('link[rel~="icon"]'), $('link[rel~="icon"]') ? "set" : "missing")

    const scored = checks.filter((c) => c.status !== "info")
    return { checks, passed: scored.filter((c) => c.status === "pass").length, total: scored.length, schemaTypes: uniqueTypes }
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
          <button type="button" class="dk-tab is-active" data-tab="seo" aria-pressed="true">SEO audit</button>
          <button type="button" class="dk-tab" data-tab="vitals" aria-pressed="false">Web vitals</button>
          <button type="button" class="dk-tab" data-tab="events" aria-pressed="false">Events <span class="dk-count">0</span></button>
        </div>
        <div class="dk-body" data-view="seo"></div>
        <div class="dk-body" data-view="vitals" hidden></div>
        <div class="dk-body" data-view="events" hidden></div>
        <p class="dk-foot">${gaId ? `Sending to GA4 property <code>${gaId.replace(/</g, "")}</code>` : "GA4 ID not set: events stay in <code>dataLayer</code> (demo mode)."}</p>
      </section>`

    const fab = $(".dk-fab", root)
    const box = $(".dk-panel", root)
    const views = Object.fromEntries($$(".dk-body", root).map((v) => [v.dataset.view, v]))
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])

    const open = (state) => {
      box.hidden = !state
      fab.setAttribute("aria-expanded", String(state))
      if (state) {
        renderSeo()
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

    function renderSeo() {
      if (box.hidden) return
      const r = audit()
      views.seo.innerHTML = `
        <div class="dk-score"><span>${r.passed}/${r.total}</span> checks passed</div>
        <ul class="dk-list">${r.checks
          .map((c) => `<li class="dk-${c.status}"><span class="dk-ico" aria-hidden="true">${c.status === "pass" ? "✓" : c.status === "warn" ? "!" : "i"}</span><span>${esc(c.label)}</span><em>${esc(c.value)}</em></li>`)
          .join("")}</ul>`
    }

    function renderVitals() {
      if (box.hidden) return
      const w = pageWeight()
      const ms = (v) => (v == null ? "n/a" : `${Math.round(v)} ms`)
      const grade = (v, good, poor) => (v == null ? "info" : v <= good ? "pass" : v <= poor ? "warn" : "fail")
      const rows = [
        ["LCP · Largest Contentful Paint", ms(vitals.lcp), grade(vitals.lcp, 2500, 4000)],
        ["CLS · Cumulative Layout Shift", vitals.cls.toFixed(3), grade(vitals.cls, 0.1, 0.25)],
        ["FCP · First Contentful Paint", ms(vitals.fcp), grade(vitals.fcp, 1800, 3000)],
        ["TTFB · Time to First Byte", ms(vitals.ttfb), grade(vitals.ttfb, 800, 1800)],
        ["Requests", String(w.requests), "info"],
        ["Transferred", `${w.kb} KB`, "info"],
      ]
      views.vitals.innerHTML = `
        <ul class="dk-list">${rows.map(([l, v, s]) => `<li class="dk-${s}"><span class="dk-ico" aria-hidden="true">${s === "pass" ? "✓" : s === "info" ? "i" : "!"}</span><span>${l}</span><em>${v}</em></li>`).join("")}</ul>
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
    return { renderSeo, renderVitals, renderEvents }
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
  window.DemoKit = { audit, vitals, events, pageWeight, track }
})()
