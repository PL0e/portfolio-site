/**
 * Sugbo League: the sport filter dims anything with data-sport that doesn't
 * match, and hovering or focusing a team (map pin, team list, or standings row)
 * highlights that team everywhere it appears (data-team).
 */
;(() => {
  "use strict"

  // ---------- Sport filter ----------
  const tabs = [...document.querySelectorAll("[data-sport-filter]")]
  const items = [...document.querySelectorAll("main [data-sport]")]

  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      const sport = tab.dataset.sportFilter
      tabs.forEach((t) => {
        const on = t === tab
        t.classList.toggle("is-active", on)
        t.setAttribute("aria-pressed", String(on))
      })
      items.forEach((el) => el.classList.toggle("is-dimmed", sport !== "all" && el.dataset.sport !== sport))
      window.DemoKit?.track("select_content", { content_type: "sport_filter", content_id: sport })
    }),
  )

  // ---------- Team highlight across the map, list, and standings ----------
  const teamEls = [...document.querySelectorAll("[data-team]")]
  const highlight = (team) => teamEls.forEach((el) => el.classList.toggle("is-hot", el.dataset.team === team))

  teamEls.forEach((el) => {
    el.addEventListener("pointerenter", () => highlight(el.dataset.team))
    el.addEventListener("pointerleave", () => highlight(null))
    el.addEventListener("focus", () => highlight(el.dataset.team))
    el.addEventListener("blur", () => highlight(null))
  })
})()
