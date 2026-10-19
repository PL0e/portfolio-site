/**
 * Blog pages: mobile navigation, table-of-contents highlighting, footer year.
 * (The homepage's script.js expects homepage-only elements, so the blog uses this instead.)
 */
;(() => {
  "use strict"

  // ---------- Mobile navigation ----------
  const toggle = document.querySelector(".nav__toggle")
  const menu = document.getElementById("nav-menu")
  if (toggle && menu) {
    const setMenu = (open) => {
      toggle.setAttribute("aria-expanded", String(open))
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu")
      menu.classList.toggle("is-open", open)
    }
    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"))
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
  }

  // ---------- Table of contents: highlight the section being read ----------
  const tocLinks = [...document.querySelectorAll(".post__toc a")]
  const sections = tocLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean)
  if (sections.length) {
    const update = () => {
      const probe = window.innerHeight * 0.3
      let current = sections[0]
      for (const s of sections) if (s.getBoundingClientRect().top <= probe) current = s
      tocLinks.forEach((a) => {
        const on = a.getAttribute("href") === `#${current.id}`
        a.classList.toggle("is-active", on)
        if (on) a.setAttribute("aria-current", "true")
        else a.removeAttribute("aria-current")
      })
    }
    let queued = false
    window.addEventListener(
      "scroll",
      () => {
        if (queued) return
        queued = true
        requestAnimationFrame(() => {
          update()
          queued = false
        })
      },
      { passive: true },
    )
    update()
  }

  // ---------- Footer year ----------
  const year = document.getElementById("year")
  if (year) year.textContent = new Date().getFullYear()
})()
