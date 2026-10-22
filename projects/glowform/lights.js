/**
 * Glowform light controls: an on/off switch and a color-temperature slider
 * that re-tint every lamp glow on the page through the --glow custom property.
 * Loaded after ../shared/demo-kit.js, which provides window.DemoKit.track.
 */
;(() => {
  "use strict"

  const root = document.documentElement
  const toggle = document.querySelector("[data-light-switch]")
  const label = toggle.querySelector(".switch__label")
  const slider = document.querySelector("[data-kelvin]")
  const out = document.querySelector("[data-kelvin-out]")

  // Approximate color of light at a given color temperature (2200K–4000K).
  const stops = [
    [2200, [255, 160, 70]],
    [2700, [255, 190, 110]],
    [3000, [255, 210, 150]],
    [4000, [255, 236, 210]],
  ]
  function kelvinToRgb(k) {
    for (let i = 1; i < stops.length; i++) {
      const [k1, c1] = stops[i - 1]
      const [k2, c2] = stops[i]
      if (k <= k2) {
        const t = (k - k1) / (k2 - k1)
        return c1.map((v, j) => Math.round(v + (c2[j] - v) * t))
      }
    }
    return stops[stops.length - 1][1]
  }

  function applyWarmth() {
    const k = Number(slider.value)
    root.style.setProperty("--glow", `rgb(${kelvinToRgb(k).join(" ")})`)
    out.textContent = `${k}K`
  }

  slider.addEventListener("input", applyWarmth)
  slider.addEventListener("change", () => {
    window.DemoKit?.track("select_content", { content_type: "color_temperature", content_id: `${slider.value}K` })
  })

  toggle.addEventListener("click", () => {
    const on = toggle.getAttribute("aria-pressed") !== "true"
    toggle.setAttribute("aria-pressed", String(on))
    label.textContent = on ? "Lights on" : "Lights off"
    root.classList.toggle("lights-off", !on)
    window.DemoKit?.track("select_content", { content_type: "light_switch", content_id: on ? "on" : "off" })
  })

  applyWarmth()

  // Hero clock: scroll progress runs the room from 4:00 PM to 10:00 PM
  // (../shared/scroll-hero.js dispatches "scrollhero:progress").
  const hero = document.querySelector("[data-scrolly]")
  const clock = document.querySelector("[data-clock]")
  const phase = document.querySelector("[data-phase]")
  if (hero && clock) {
    const START = 16 * 60 // minutes after midnight
    const SPAN = 6 * 60
    const phases = [
      [0.2, "Afternoon"],
      [0.33, "Golden hour"],
      [0.5, "Dusk"],
      [1.01, "Night"],
    ]
    hero.addEventListener("scrollhero:progress", (e) => {
      const p = e.detail.p
      const mins = Math.round((START + p * SPAN) / 5) * 5
      const h = Math.floor(mins / 60)
      const m = mins % 60
      clock.textContent = `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`
      phase.textContent = phases.find(([until]) => p < until)[1]
    })
  }
})()
