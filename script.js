/**
 * Portfolio - Vanilla JavaScript
 * Header state, mobile nav, scroll-spy, reveal animations,
 * role typewriter, tech marquee, and mailto contact form.
 */
;(() => {
  "use strict"

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // ---------- Header background on scroll ----------
  const header = document.querySelector(".site-header")
  const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 10)
  updateHeader()
  window.addEventListener("scroll", updateHeader, { passive: true })

  // ---------- Mobile navigation ----------
  const toggle = document.querySelector(".nav__toggle")
  const menu = document.getElementById("nav-menu")

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open))
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu")
    menu.classList.toggle("is-open", open)
  }

  toggle.addEventListener("click", () => {
    setMenu(toggle.getAttribute("aria-expanded") !== "true")
  })

  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false)
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      setMenu(false)
      toggle.focus()
    }
  })

  document.addEventListener("click", (e) => {
    if (menu.classList.contains("is-open") && !e.target.closest(".nav")) setMenu(false)
  })

  // ---------- Scroll-spy: highlight the current section ----------
  const navLinks = [...document.querySelectorAll(".nav__link")]
  const linkFor = new Map(navLinks.map((link) => [link.getAttribute("href").slice(1), link]))
  const spySections = [...linkFor.keys()].map((id) => document.getElementById(id)).filter(Boolean)

  const updateActiveLink = () => {
    const probe = window.innerHeight * 0.35
    let current = null
    for (const section of spySections) {
      if (section.getBoundingClientRect().top <= probe) current = section.id
    }
    // At the very bottom of the page, the last section is current.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = spySections[spySections.length - 1].id
    }
    navLinks.forEach((link) => {
      const active = link === linkFor.get(current)
      link.classList.toggle("is-active", active)
      if (active) link.setAttribute("aria-current", "true")
      else link.removeAttribute("aria-current")
    })
  }

  let spyQueued = false
  window.addEventListener(
    "scroll",
    () => {
      if (spyQueued) return
      spyQueued = true
      requestAnimationFrame(() => {
        updateActiveLink()
        spyQueued = false
      })
    },
    { passive: true },
  )
  window.addEventListener("resize", updateActiveLink)
  updateActiveLink()

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll(".reveal")
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"))
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add("is-visible")
          revealObserver.unobserve(entry.target)
        })
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    )
    revealEls.forEach((el) => revealObserver.observe(el))
  }

  // ---------- Role typewriter ----------
  const roleEl = document.querySelector(".hero__role-text")
  if (roleEl && !reduceMotion) {
    let roles = []
    try {
      roles = JSON.parse(roleEl.dataset.roles || "[]")
    } catch {
      roles = []
    }

    if (roles.length > 1) {
      let roleIndex = 0
      let charIndex = roles[0].length
      let deleting = true
      roleEl.textContent = roles[0]

      const tick = () => {
        const word = roles[roleIndex]
        if (deleting) {
          charIndex--
          roleEl.textContent = word.slice(0, charIndex)
          if (charIndex === 0) {
            deleting = false
            roleIndex = (roleIndex + 1) % roles.length
            return setTimeout(tick, 350)
          }
          return setTimeout(tick, 40)
        }
        const next = roles[roleIndex]
        charIndex++
        roleEl.textContent = next.slice(0, charIndex)
        if (charIndex === next.length) {
          deleting = true
          return setTimeout(tick, 2200)
        }
        return setTimeout(tick, 75)
      }

      setTimeout(tick, 2200)
    }
  }

  // ---------- Tech marquee (duplicate items for a seamless loop) ----------
  const marquee = document.querySelector(".marquee")
  if (marquee && !reduceMotion) {
    const track = marquee.querySelector(".marquee__track")
    ;[...track.children].forEach((item) => {
      const clone = item.cloneNode(true)
      clone.setAttribute("aria-hidden", "true")
      track.appendChild(clone)
    })
    marquee.classList.add("is-animated")
  }

  // ---------- Contact form -> opens the visitor's email app ----------
  const form = document.getElementById("contact-form")
  const status = document.getElementById("form-status")
  const EMAIL_TO = "glendellsara@gmail.com"
  const defaultNote = status.textContent

  const setStatus = (text, type) => {
    status.textContent = text
    status.classList.remove("is-error", "is-success")
    if (type) status.classList.add(`is-${type}`)
  }

  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => {
      field.removeAttribute("aria-invalid")
      if (status.classList.contains("is-error")) setStatus(defaultNote)
    })
  })

  form.addEventListener("submit", (e) => {
    e.preventDefault()

    const fields = [...form.querySelectorAll("input, textarea")]
    const invalid = fields.filter((field) => !field.value.trim() || !field.checkValidity())
    fields.forEach((field) => {
      if (invalid.includes(field)) field.setAttribute("aria-invalid", "true")
      else field.removeAttribute("aria-invalid")
    })

    if (invalid.length) {
      setStatus("Please fill in every field with a valid email address.", "error")
      invalid[0].focus()
      return
    }

    const name = form.elements.name.value.trim()
    const email = form.elements.email.value.trim()
    const message = form.elements.message.value.trim()

    const subject = `Portfolio inquiry from ${name}`
    const body = `${message}\n\n—\n${name}\n${email}`
    window.location.href = `mailto:${EMAIL_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    setStatus(`Opening your email app… If nothing happens, email me directly at ${EMAIL_TO}.`, "success")
  })

  // ---------- Store cards: sample search performance mini dashboards ----------
  // Same generator as the demo pages (projects/shared/search-sample.js), so the
  // numbers match each store's own "Search" tab. Clearly labeled sample data.
  const perfEls = document.querySelectorAll("[data-search-sample]")
  if (perfEls.length && window.SearchSample) {
    const nf = new Intl.NumberFormat("en-US")
    const day = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })

    perfEls.forEach((el) => {
      const s = window.SearchSample.generate({
        title: el.dataset.title,
        brand: el.dataset.brand,
        keywords: el.dataset.keywords.split("|"),
      })
      const values = s.daily.clicks
      const W = 300, H = 56, P = 4
      const max = Math.max(...values) || 1
      const min = Math.min(...values)
      const x = (i) => P + (i * (W - 2 * P)) / (values.length - 1)
      const y = (v) => P + (1 - v / max) * (H - 2 * P)
      const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`)
      const first = day(s.dates[0])
      const last = day(s.dates[s.dates.length - 1])

      el.innerHTML = `
        <div class="perf__head">
          <span>Search performance · last 28 days</span>
          <span class="perf__badge">Sample data</span>
        </div>
        <dl class="perf__stats">
          <div><dt>Clicks</dt><dd>${nf.format(s.totals.clicks)}</dd></div>
          <div><dt>Impressions</dt><dd>${nf.format(s.totals.impressions)}</dd></div>
          <div><dt>Avg. CTR</dt><dd>${(s.totals.ctr * 100).toFixed(1)}%</dd></div>
          <div><dt>Avg. position</dt><dd>${s.totals.position.toFixed(1)}</dd></div>
        </dl>
        <div class="perf__spark" tabindex="0" role="img"
             aria-label="Daily clicks, sample data, ${first} to ${last}, between ${min} and ${max} per day. Use left and right arrow keys to read each day.">
          <svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
            <path class="perf__area" d="M${pts.join("L")}L${x(values.length - 1)},${H - P}L${x(0)},${H - P}Z"/>
            <path class="perf__line" d="M${pts.join("L")}"/>
            <line class="perf__cross" y1="${P}" y2="${H - P}" visibility="hidden"/>
            <circle class="perf__dot" r="3.5" visibility="hidden"/>
          </svg>
          <div class="perf__tip" hidden></div>
        </div>
        <div class="perf__axis" aria-hidden="true"><span>${first}</span><span>Daily clicks</span><span>${last}</span></div>
        <p class="sr-only" aria-live="polite"></p>`

      const spark = el.querySelector(".perf__spark")
      const cross = el.querySelector(".perf__cross")
      const dot = el.querySelector(".perf__dot")
      const tip = el.querySelector(".perf__tip")
      const live = el.querySelector(".sr-only")
      let current = -1

      const show = (i, announce) => {
        current = Math.max(0, Math.min(values.length - 1, i))
        const cx = x(current)
        cross.setAttribute("x1", cx)
        cross.setAttribute("x2", cx)
        cross.setAttribute("visibility", "visible")
        dot.setAttribute("cx", cx)
        dot.setAttribute("cy", y(values[current]))
        dot.setAttribute("visibility", "visible")
        const text = `${day(s.dates[current])} · ${values[current]} click${values[current] === 1 ? "" : "s"}`
        tip.textContent = text
        tip.hidden = false
        const pct = cx / W
        tip.style.left = `${pct * 100}%`
        tip.style.transform = `translateX(${pct > 0.7 ? "-100%" : pct < 0.3 ? "0" : "-50%"})`
        if (announce) live.textContent = text
      }
      const hide = () => {
        cross.setAttribute("visibility", "hidden")
        dot.setAttribute("visibility", "hidden")
        tip.hidden = true
      }

      spark.addEventListener("pointermove", (e) => {
        const r = spark.getBoundingClientRect()
        const px = ((e.clientX - r.left) / r.width) * W
        show(Math.round(((px - P) / (W - 2 * P)) * (values.length - 1)), false)
      })
      spark.addEventListener("pointerleave", hide)
      spark.addEventListener("blur", hide)
      spark.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault()
          show(current < 0 ? values.length - 1 : current + (e.key === "ArrowRight" ? 1 : -1), true)
        }
      })
    })
  }

  // ---------- Footer year ----------
  const year = document.getElementById("year")
  if (year) year.textContent = new Date().getFullYear()
})()
