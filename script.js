/**
 * Portfolio - Vanilla JavaScript
 * Header state, mobile nav, scroll-spy, reveal animations,
 * role typewriter, tech marquee, mailto contact form, and featured-card hero previews.
 */
;(() => {
  "use strict"

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // ---------- Landing gate ----------
  // <head> adds .is-gated on a first visit with no #hash. Until the visitor proceeds,
  // everything below the hero is inert (unfocusable) and scrolling is locked by CSS.
  const root = document.documentElement
  const behind = [...document.querySelectorAll("main > :not(.hero), .footer")]
  const setInert = (on) => behind.forEach((el) => (on ? el.setAttribute("inert", "") : el.removeAttribute("inert")))

  function enterPortfolio(targetId) {
    root.classList.remove("is-gated")
    setInert(false)
    try {
      sessionStorage.setItem("gd-entered", "1")
    } catch {
      /* storage blocked: the gate simply shows again next visit */
    }
    const target = document.getElementById(targetId) || document.getElementById("intro")
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" })
      const heading = target.querySelector("h1, h2") || target
      if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1")
      heading.focus({ preventScroll: true })
    })
    history.replaceState(null, "", `#${target.id}`)
  }

  if (root.classList.contains("is-gated")) {
    setInert(true)
    // Any in-page link (View portfolio, nav, skip link) opens the portfolio first.
    document.addEventListener(
      "click",
      (e) => {
        const link = e.target.closest('a[href^="#"]')
        if (!link || !root.classList.contains("is-gated")) return
        const id = link.getAttribute("href").slice(1)
        if (!id || id === "top") return
        e.preventDefault()
        enterPortfolio(id === "main" ? "intro" : id)
      },
      true,
    )
  }

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

  // ---------- Hero word search: draw a ring around each hidden word ----------
  const ws = document.querySelector("[data-wordsearch]")
  if (ws) {
    const svg = ws.querySelector(".ws__rings")
    const words = ws.dataset.words.split(";").map((w) => {
      const [word, r, c, dr, dc] = w.split(",")
      return { word, r: +r, c: +c, dr: +dr, dc: +dc }
    })
    const cellAt = (r, c) => ws.querySelector(`.ws__cell[data-r="${r}"][data-c="${c}"]`)
    const NS = "http://www.w3.org/2000/svg"
    const rings = words.map(() => {
      const rect = document.createElementNS(NS, "rect")
      rect.setAttribute("class", "ws__ring")
      rect.setAttribute("pathLength", "1")
      svg.appendChild(rect)
      return rect
    })

    // Position every ring from the live letter positions (no re-creation, so animations survive).
    const drawRings = () => {
      const box = ws.getBoundingClientRect()
      if (!box.width) return
      svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`)
      const center = (el) => {
        const r = el.getBoundingClientRect()
        return [r.left - box.left + r.width / 2, r.top - box.top + r.height / 2, r.width]
      }
      words.forEach(({ word, r, c, dr, dc }, i) => {
        const [x1, y1, size] = center(cellAt(r, c))
        const n = word.length - 1
        const [x2, y2] = center(cellAt(r + dr * n, c + dc * n))
        const h = size * 0.84
        const len = Math.hypot(x2 - x1, y2 - y1) + h
        const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
        const cx = (x1 + x2) / 2
        const cy = (y1 + y2) / 2
        const set = { x: cx - len / 2, y: cy - h / 2, width: len, height: h, rx: h / 2, transform: `rotate(${angle} ${cx} ${cy})` }
        Object.entries(set).forEach(([k, v]) => rings[i].setAttribute(k, v))
      })
      ws.classList.add("is-ready")
    }

    drawRings()
    if (reduceMotion) rings.forEach((r) => r.classList.add("is-drawn"))
    else rings.forEach((r, i) => setTimeout(() => r.classList.add("is-drawn"), 400 + i * 350))
    // Reposition when the grid resizes or the web font swaps in.
    if ("ResizeObserver" in window) new ResizeObserver(drawRings).observe(ws)
    document.fonts?.ready.then(drawRings)
  }

  // ---------- Featured cards: hovering a preview plays its scroll hero ----------
  // Each preview is a screenshot of the demo's first hero frame, placed the way
  // the hero places it. Portrait frames sit in a full-height column, so the canvas
  // replays them there and the headline beside it stays put. Landscape frames
  // cover the whole preview, with the hero's side shading (data-hero-shade).
  // Frames load on first hover; touch screens play once the card scrolls into view.
  const heroShots = document.querySelectorAll("[data-hero-frames]")
  const canHover = window.matchMedia("(hover: hover)").matches

  heroShots.forEach((shot) => {
    if (reduceMotion) return
    const FRAME_COUNT = Number(shot.dataset.heroCount) || 50
    const shade = "heroShade" in shot.dataset
    const frameShare = Number(shot.dataset.heroWidth) || 0
    const card = shot.closest(".store")
    const canvas = document.createElement("canvas")
    canvas.className = "store__anim"
    canvas.setAttribute("aria-hidden", "true")
    shot.append(canvas)
    const ctx = canvas.getContext("2d")
    const frames = []
    let loaded = false
    let pos = 0 // current frame, fractional
    let target = 0
    let last = 0
    let raf = 0

    function tone(img) {
      try {
        const c = document.createElement("canvas")
        c.width = 36
        c.height = 64
        const g = c.getContext("2d", { willReadFrequently: true })
        g.drawImage(img, 0, 0, 36, 64)
        const px = [[0, 0], [35, 0], [0, 63], [35, 63]].map(([x, y]) => g.getImageData(x, y, 1, 1).data)
        return [0, 1, 2].map((i) => Math.round(px.reduce((s, d) => s + d[i], 0) / px.length))
      } catch {
        return null // file:// taints the canvas; skip the side blend
      }
    }

    function load() {
      if (loaded) return
      loaded = true
      for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image()
        img.decoding = "async"
        img.onload = () => {
          img.tone = tone(img)
          frames[i] = img
        }
        img.src = shot.dataset.heroFrames.replace("{n}", String(i + 1).padStart(2, "0"))
      }
    }

    function draw(i) {
      let img
      for (let d = 0; d < FRAME_COUNT && !img; d++) img = frames[i - d] || frames[i + d]
      if (!img) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = (canvas.width = Math.round(shot.clientWidth * dpr))
      const h = (canvas.height = Math.round(shot.clientHeight * dpr))
      const ir = img.naturalWidth / img.naturalHeight
      // Heroes with data-max-width show the frame as a centered window over its
      // backdrop; data-hero-width is that window's share of the preview's width.
      if (frameShare && img.tone) {
        const [r, g, b] = img.tone
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillRect(0, 0, w, h)
        const dw = w * frameShare
        const dh = dw / ir
        const dx = (w - dw) / 2
        const dy = (h - dh) / 2
        ctx.drawImage(img, dx, dy, dw, dh)
        const fx = dw * 0.14
        const fy = dh * 0.16
        for (const [x0, y0, x1, y1] of [[dx, 0, dx + fx, 0], [dx + dw, 0, dx + dw - fx, 0], [0, dy, 0, dy + fy], [0, dy + dh, 0, dy + dh - fy]]) {
          const grad = ctx.createLinearGradient(x0, y0, x1, y1)
          grad.addColorStop(0, `rgba(${r},${g},${b},1)`)
          grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
          ctx.fillStyle = grad
          if (x0 !== x1) ctx.fillRect(Math.min(x0, x1), 0, fx, h)
          else ctx.fillRect(0, Math.min(y0, y1), w, fy)
        }
        return
      }
      // Same rule as the hero: cover unless the box is much wider than the frame
      if (w / h < ir * 1.35) {
        const cw = Math.max(w, h * ir)
        const ch = cw / ir
        ctx.drawImage(img, (w - cw) / 2, (h - ch) / 2, cw, ch)
        if (shade) {
          const grad = ctx.createLinearGradient(0, 0, w, 0)
          grad.addColorStop(0, "rgba(20,20,20,.78)")
          grad.addColorStop(0.4, "rgba(20,20,20,0)")
          grad.addColorStop(0.6, "rgba(20,20,20,0)")
          grad.addColorStop(1, "rgba(20,20,20,.78)")
          ctx.fillStyle = grad
          ctx.fillRect(0, 0, w, h)
        }
        return
      }
      const dw = h * ir
      const dx = (w - dw) / 2
      ctx.drawImage(img, dx, 0, dw, h)
      // Blend the column's sides into the frame's background, as the hero does
      if (img.tone) {
        const [r, g, b] = img.tone
        const f = dw * 0.14
        const pad = dw * 0.06
        for (const [x0, x1] of [[dx - pad, dx + f], [dx + dw + pad, dx + dw - f]]) {
          const grad = ctx.createLinearGradient(x0, 0, x1, 0)
          grad.addColorStop(0, `rgba(${r},${g},${b},0)`)
          grad.addColorStop(pad / (pad + f), `rgba(${r},${g},${b},1)`)
          grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
          ctx.fillStyle = grad
          ctx.fillRect(Math.min(x0, x1), 0, pad + f, h)
        }
      }
    }

    function tick(now) {
      const dt = Math.min(64, now - (last || now))
      last = now
      // ~2 s forward; rewinds twice as fast
      const step = (dt / 1000) * (target > pos ? 24 : 48)
      pos = target > pos ? Math.min(target, pos + step) : Math.max(target, pos - step)
      draw(Math.round(pos))
      if (pos !== target) {
        raf = requestAnimationFrame(tick)
      } else {
        raf = 0
        if (target === 0) card.classList.remove("is-playing")
      }
    }

    function play(forward) {
      if (forward) load()
      target = forward ? FRAME_COUNT - 1 : 0
      if (forward) card.classList.add("is-playing")
      if (!raf) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    }

    if (canHover) {
      card.addEventListener("pointerenter", () => play(true))
      card.addEventListener("pointerleave", () => play(false))
    } else if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => entries.forEach((e) => play(e.isIntersecting)), { threshold: 0.6 }).observe(shot)
    }
    card.addEventListener("focusin", () => play(true))
    card.addEventListener("focusout", (e) => {
      if (!card.contains(e.relatedTarget)) play(false)
    })
  })

  // ---------- Footer year ----------
  const year = document.getElementById("year")
  if (year) year.textContent = new Date().getFullYear()
})()
