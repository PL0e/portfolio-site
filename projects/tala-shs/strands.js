/**
 * Tala Science High strand tabs (WAI-ARIA tabs pattern: click + arrow keys).
 */
;(() => {
  "use strict"

  const tabs = [...document.querySelectorAll('[role="tab"]')]

  function select(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab
      t.setAttribute("aria-selected", String(on))
      t.tabIndex = on ? 0 : -1
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on
    })
    if (focus) tab.focus()
    window.DemoKit?.track("select_content", { content_type: "strand_tab", content_id: tab.dataset.strand })
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab, false))
    tab.addEventListener("keydown", (e) => {
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key]
      if (next === undefined) return
      e.preventDefault()
      select(tabs[(next + tabs.length) % tabs.length], true)
    })
  })
})()
