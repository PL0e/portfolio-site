/**
 * Bangis FC: mobile menu, search, featured-story carousel, event countdown,
 * fight card tabs, division rankings, and reveal-on-scroll.
 */
;(() => {
  "use strict"

  const $ = (sel, root = document) => root.querySelector(sel)
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // ---------- Mobile menu ----------
  const burger = $("[data-burger]")
  const nav = $("#site-nav")
  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open))
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu")
    nav.classList.toggle("is-open", open)
  }
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"))
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false)
  })

  // ---------- Search ----------
  // A demo index of the page's own content: matching items scroll into view.
  const searchBtn = $("[data-search-toggle]")
  const search = $("[data-search]")
  const input = $("input", search)
  const hint = $("[data-search-hint]")
  searchBtn.addEventListener("click", () => {
    const open = search.hidden
    search.hidden = !open
    searchBtn.setAttribute("aria-expanded", String(open))
    if (open) input.focus()
  })
  search.addEventListener("submit", (e) => {
    e.preventDefault()
    const q = input.value.trim().toLowerCase()
    if (!q) return
    const hit = $$(".fighter h3, .top__list a, .story h3, .event__title").find((el) => el.textContent.toLowerCase().includes(q))
    if (hit) {
      hint.textContent = `Found "${hit.textContent.trim()}"`
      const panel = hit.closest("[role=tabpanel][hidden]")
      if (panel) selectTab($(`#${panel.getAttribute("aria-labelledby")}`))
      hit.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" })
    } else {
      hint.textContent = `No results for "${input.value.trim()}". Try a fighter's name.`
    }
  })

  // ---------- Featured stories carousel ----------
  const carousel = $("[data-carousel]")
  const slides = $$(".slide", carousel)
  const dots = $$("[data-dot]", carousel)
  const pauseBtn = $("[data-pause]", carousel)
  const SLIDE_MS = 6000
  let index = 0
  let timer = 0
  let paused = reduceMotion
  let hovering = false

  carousel.style.setProperty("--slide-ms", `${SLIDE_MS}ms`)

  function show(i) {
    index = (i + slides.length) % slides.length
    slides.forEach((s, n) => {
      s.classList.toggle("is-active", n === index)
      s.toggleAttribute("inert", n !== index)
    })
    dots.forEach((d, n) => {
      d.classList.toggle("is-active", n === index)
      d.classList.toggle("is-done", n < index)
      if (n === index) d.setAttribute("aria-current", "true")
      else d.removeAttribute("aria-current")
      // Restart the progress fill
      const bar = d.firstElementChild
      bar.replaceWith(bar.cloneNode())
    })
    schedule()
  }

  function schedule() {
    clearTimeout(timer)
    if (!paused && !hovering) timer = setTimeout(() => show(index + 1), SLIDE_MS)
  }

  dots.forEach((d) => d.addEventListener("click", () => show(Number(d.dataset.dot))))
  pauseBtn.addEventListener("click", () => {
    paused = !paused
    pauseBtn.setAttribute("aria-pressed", String(paused))
    pauseBtn.setAttribute("aria-label", paused ? "Play stories" : "Pause stories")
    carousel.classList.toggle("is-paused", paused)
    if (!paused) show(index)
    else clearTimeout(timer)
  })
  // Hovering or focusing the carousel holds the current story
  for (const [on, off] of [["pointerenter", "pointerleave"], ["focusin", "focusout"]]) {
    carousel.addEventListener(on, () => {
      hovering = true
      carousel.classList.add("is-paused")
      clearTimeout(timer)
    })
    carousel.addEventListener(off, () => {
      hovering = false
      if (!paused) {
        carousel.classList.remove("is-paused")
        show(index)
      }
    })
  }
  if (paused) {
    carousel.classList.add("is-paused")
    pauseBtn.setAttribute("aria-pressed", "true")
  }
  show(0)

  // ---------- Event countdown ----------
  const countdown = $("[data-countdown]")
  const target = new Date(countdown.dataset.countdown).getTime()
  const cells = Object.fromEntries($$("[data-cd]", countdown).map((el) => [el.dataset.cd, el]))
  function setCell(key, value) {
    const el = cells[key]
    const text = String(value).padStart(2, "0")
    if (el.textContent === text) return
    el.textContent = text
    if (!reduceMotion) {
      el.classList.remove("tick")
      void el.offsetWidth // restart the animation
      el.classList.add("tick")
    }
  }
  function tick() {
    const left = Math.max(0, target - Date.now())
    setCell("d", Math.floor(left / 864e5))
    setCell("h", Math.floor(left / 36e5) % 24)
    setCell("m", Math.floor(left / 6e4) % 60)
    setCell("s", Math.floor(left / 1e3) % 60)
    if (left > 0) setTimeout(tick, 1000 - (Date.now() % 1000))
  }
  tick()

  // ---------- Fight card tabs ----------
  const tabs = $$("[role=tab]")
  function selectTab(tab) {
    tabs.forEach((t) => {
      const on = t === tab
      t.setAttribute("aria-selected", String(on))
      t.tabIndex = on ? 0 : -1
      $(`#${t.getAttribute("aria-controls")}`).hidden = !on
    })
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t))
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length]
      selectTab(next)
      next.focus()
    })
  })

  // ---------- Rankings ----------
  const divisions = {
    lightweight: {
      champ: ["Lightweight champion", 'Rico "Bagyo" Reyes', "18-2-0 · 4 title defenses", "img/hero-a", "Rico Reyes celebrating with the lightweight belt"],
      ladder: [["Jomar Dela Cruz", "15-3-0", 0], ["Nico Fernandez", "16-4-0", 1], ["Aldrin Cruz", "13-2-0", -1], ["Ramon Lacson", "17-6-0", 2], ["Tito Galvez", "11-3-0", 0]],
    },
    featherweight: {
      champ: ["Featherweight champion", "Paolo Santos", "12-1-0 · 1 title defense", "img/hero-b", "Paolo Santos celebrating in the cage"],
      ladder: [["Kenji Abellana", "11-4-0", 0], ["Marco Uy", "10-2-0", 2], ["Elias Torres", "12-5-0", -1], ["Benjie Sy", "9-1-0", 1], ["Rafael Lim", "14-7-0", -2]],
    },
    strawweight: {
      champ: ["Women's strawweight champion", "Ana Lim", "10-2-0 · 2 title defenses", "img/wraps", "Hands being wrapped before a title fight"],
      ladder: [["Mika Villareal", "9-0-0", 3], ["Joy Castillo", "8-2-0", 0], ["Rina Padilla", "11-4-0", -1], ["Lea Morales", "7-1-0", 0], ["Kat Dizon", "9-3-0", -2]],
    },
  }
  const champImg = $("[data-champ-img]")
  const champSource = champImg.previousElementSibling
  const ladder = $("[data-ladder]")
  const chips = $$("[data-division]")

  function showDivision(key) {
    const d = divisions[key]
    const [label, name, record, img, alt] = d.champ
    $("[data-champ-division]").textContent = label
    $("[data-champ-name]").textContent = name
    $("[data-champ-record]").textContent = record
    if (!champImg.src.includes(img)) {
      champImg.classList.add("is-swapping")
      setTimeout(() => {
        champSource.srcset = `${img}.webp`
        champImg.src = `${img}.jpg`
        champImg.alt = alt
        champImg.classList.remove("is-swapping")
      }, reduceMotion ? 0 : 250)
    }
    ladder.innerHTML = d.ladder
      .map(([n, rec, move], i) => {
        const cls = move > 0 ? "up" : move < 0 ? "down" : "same"
        const label = move > 0 ? `▲ ${move}` : move < 0 ? `▼ ${-move}` : "–"
        const sr = move > 0 ? `up ${move}` : move < 0 ? `down ${-move}` : "no change"
        return `<li style="animation-delay:${i * 60}ms"><span class="ladder__n">${i + 1}</span><span class="ladder__name">${n}</span><span class="ladder__rec">${rec}</span><span class="ladder__move ladder__move--${cls}"><span aria-hidden="true">${label}</span><span class="sr-only">${sr}</span></span></li>`
      })
      .join("")
    chips.forEach((c) => {
      const on = c.dataset.division === key
      c.classList.toggle("is-active", on)
      c.setAttribute("aria-pressed", String(on))
    })
  }
  chips.forEach((c) => c.addEventListener("click", () => showDivision(c.dataset.division)))
  showDivision("lightweight")

  // ---------- Reveal on scroll ----------
  const reveals = $$(".reveal")
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"))
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add("is-in")
          io.unobserve(e.target)
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    )
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 70}ms`
      io.observe(el)
    })
  }
})()
