/**
 * VCAL sport filter: one bar filters scores, headlines, the featured story,
 * the standings block, and the schedule (anything with data-sport).
 */
;(() => {
  "use strict"

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
})()
