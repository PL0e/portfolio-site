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

  // ---------- Footer year ----------
  const year = document.getElementById("year")
  if (year) year.textContent = new Date().getFullYear()
})()
