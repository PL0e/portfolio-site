/**
 * The Daily Brew scroll hero.
 *
 * The hero section is 400vh tall with a sticky 100vh stage. The first 200vh of
 * scrolling scrubs through 50 JPEG frames on a canvas and fades the copy
 * "beats" in and out. Over the last 100vh the next section slides up over the
 * stage while the canvas eases back (--cover).
 *
 * Also handles the solid header, the word-by-word statement, and .reveal
 * elements. With prefers-reduced-motion the stage is not pinned and shows the
 * last frame.
 */
;(() => {
  "use strict"

  const FRAME_COUNT = 50
  const frameSrc = (i) => `frames/frame-${String(i + 1).padStart(2, "0")}.jpg`
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v))
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

  const root = document.querySelector("[data-scrolly]")
  const header = document.querySelector("[data-header]")
  const stage = root.querySelector(".scrolly__stage")
  const canvas = root.querySelector("canvas")
  const ctx = canvas.getContext("2d")
  const bar = root.querySelector("[data-progress]")
  const beats = [...root.querySelectorAll("[data-beat]")].map((el) => {
    const [start, end] = el.dataset.beat.split(",").map(Number)
    return { el, start, end }
  })

  const frames = new Array(FRAME_COUNT)
  let current = -1
  let ticking = false

  // ---------------------------------------------------------------------------
  // Frames
  // ---------------------------------------------------------------------------

  /** Average colour of the frame's four corners, used to blend it into the stage. */
  function edgeTone(img) {
    try {
      const W = 72
      const H = 128
      const c = document.createElement("canvas")
      c.width = W
      c.height = H
      const g = c.getContext("2d", { willReadFrequently: true })
      g.drawImage(img, 0, 0, W, H)
      const { data } = g.getImageData(0, 0, W, H)
      const sum = [0, 0, 0]
      let n = 0
      // Corners only: in the close-up frames the cup reaches the side edges
      for (const y of [0, 1, H - 2, H - 1]) {
        for (const x of [0, 1, W - 2, W - 1]) {
          const i = (y * W + x) * 4
          sum[0] += data[i]
          sum[1] += data[i + 1]
          sum[2] += data[i + 2]
          n++
        }
      }
      return sum.map((v) => Math.round(v / n))
    } catch {
      return [238, 238, 240] // canvas is tainted when opened from file://
    }
  }

  function load(i) {
    return new Promise((resolve) => {
      const img = new Image()
      img.decoding = "async"
      img.onload = () => {
        img.tone = edgeTone(img)
        frames[i] = img
        if (Math.abs(i - targetFrame()) < Math.abs(current - targetFrame()) || current < 0) render(true)
        resolve()
      }
      img.onerror = resolve
      img.src = frameSrc(i)
    })
  }

  /** Nearest loaded frame to i, so fast scrolling never shows a blank stage. */
  function nearest(i) {
    for (let d = 0; d < FRAME_COUNT; d++) {
      if (frames[i - d]) return i - d
      if (frames[i + d]) return i + d
    }
    return -1
  }

  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(stage.clientWidth * dpr)
    canvas.height = Math.round(stage.clientHeight * dpr)
    current = -1
  }

  function draw(i) {
    const idx = nearest(i)
    if (idx < 0 || idx === current) return
    current = idx
    const img = frames[idx]
    const [r, g, b] = img.tone
    const w = canvas.width
    const h = canvas.height
    const ir = img.naturalWidth / img.naturalHeight

    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.fillRect(0, 0, w, h)

    // Narrow (portrait) screens: cover. Wide screens: fit the height and feather the sides.
    let dw, dh
    if (w / h < ir * 1.35) {
      dw = Math.max(w, h * ir)
      dh = dw / ir
    } else {
      dh = h
      dw = h * ir
    }
    const dx = (w - dw) / 2
    const dy = (h - dh) / 2
    ctx.drawImage(img, dx, dy, dw, dh)

    if (dw < w) {
      const f = dw * 0.14
      for (const [x0, x1] of [[dx, dx + f], [dx + dw, dx + dw - f]]) {
        const grad = ctx.createLinearGradient(x0, 0, x1, 0)
        grad.addColorStop(0, `rgba(${r},${g},${b},1)`)
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = grad
        ctx.fillRect(Math.min(x0, x1), 0, f, h)
      }
    }

    stage.style.setProperty("--tone", `rgb(${r},${g},${b})`)
    stage.classList.add("is-ready")
  }

  // ---------------------------------------------------------------------------
  // Scroll progress
  // ---------------------------------------------------------------------------

  function progress() {
    const vh = window.innerHeight
    const travel = root.offsetHeight - vh // how long the stage stays pinned
    const play = travel - vh // frames finish before the next section covers the stage
    if (reduceMotion.matches || play <= 0) return { p: 1, cover: 0 }
    const scrolled = clamp(-root.getBoundingClientRect().top, 0, travel)
    return { p: clamp(scrolled / play), cover: clamp((scrolled - play) / vh) }
  }

  function targetFrame() {
    return Math.round(progress().p * (FRAME_COUNT - 1))
  }

  function setBeat({ el }, o) {
    el.style.opacity = o
    el.style.transform = `translateY(${(1 - o) * 24}px)`
    el.style.visibility = o > 0 ? "visible" : "hidden"
    el.toggleAttribute("inert", o < 0.5)
  }

  function render(force) {
    ticking = false
    const { p, cover } = progress()
    if (force) current = -1
    draw(Math.round(p * (FRAME_COUNT - 1)))

    stage.style.setProperty("--p", p.toFixed(4))
    stage.style.setProperty("--cover", cover.toFixed(4))
    if (bar) bar.style.setProperty("--p", p.toFixed(4))

    if (reduceMotion.matches) {
      beats.forEach((b, i) => setBeat(b, i === 0 ? 1 : 0))
    } else {
      const fade = 0.05
      for (const b of beats) {
        let o = 1
        if (b.start > 0) o = Math.min(o, (p - b.start) / fade)
        if (b.end < 1) o = Math.min(o, (b.end - p) / fade)
        setBeat(b, clamp(o))
      }
    }

    // The header turns solid once the statement has covered the hero
    const heroEnd = root.getBoundingClientRect().bottom - window.innerHeight
    header?.classList.toggle("is-solid", heroEnd <= 0 || reduceMotion.matches && window.scrollY > 40)

    words()
  }

  function onScroll() {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(() => render(false))
    }
  }

  // ---------------------------------------------------------------------------
  // Statement: words light up as it scrolls into view
  // ---------------------------------------------------------------------------
  const statement = document.querySelector("[data-words]")
  let wordEls = []
  if (statement) {
    const parts = statement.textContent.trim().split(/\s+/)
    statement.textContent = ""
    parts.forEach((word, i) => {
      const span = document.createElement("span")
      span.className = "w"
      span.textContent = word
      statement.append(span, i < parts.length - 1 ? " " : "")
    })
    wordEls = [...statement.querySelectorAll(".w")]
  }

  function words() {
    if (!statement) return
    const vh = window.innerHeight
    const r = statement.getBoundingClientRect()
    const prog = reduceMotion.matches ? 1 : clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3))
    const lit = Math.round(prog * wordEls.length)
    wordEls.forEach((w, i) => w.classList.toggle("is-lit", i < lit))
  }

  // ---------------------------------------------------------------------------
  // Reveal on scroll
  // ---------------------------------------------------------------------------
  const reveals = document.querySelectorAll(".reveal")
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add("is-in")
          io.unobserve(e.target)
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    )
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 80}ms`
      io.observe(el)
    })
  } else {
    reveals.forEach((el) => el.classList.add("is-in"))
  }

  // ---------------------------------------------------------------------------
  // Boot: first frame, then the last, then the rest in order
  // ---------------------------------------------------------------------------
  sizeCanvas()
  load(0)
    .then(() => load(FRAME_COUNT - 1))
    .then(() => {
      for (let i = 1; i < FRAME_COUNT - 1; i++) load(i)
    })

  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", () => {
    sizeCanvas()
    render(true)
  })
  reduceMotion.addEventListener?.("change", () => render(true))
  render(true)
})()
