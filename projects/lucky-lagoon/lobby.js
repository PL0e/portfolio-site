/**
 * Lucky Lagoon lobby: search filter, concept-notice dialog, display jackpot.
 * Category chips are handled by ../shared/demo-kit.js (data-filter / data-cat).
 */
;(() => {
  "use strict"

  const games = [...document.querySelectorAll("[data-grid] .game")]
  const empty = document.querySelector("[data-empty]")
  const search = document.querySelector("[data-search]")

  // Search narrows whatever the active category shows.
  function applySearch() {
    const q = search.value.trim().toLowerCase()
    let shown = 0
    games.forEach((g) => {
      const inCategory = !g.dataset.hiddenByCategory
      const match = !q || g.textContent.toLowerCase().includes(q)
      g.hidden = !(match && inCategory)
      if (!g.hidden) shown++
    })
    empty.hidden = shown > 0
  }
  search.addEventListener("input", applySearch)
  search.addEventListener("change", () => window.DemoKit?.track("search", { search_term: search.value.trim() }))

  // Remember which games the category chips hid, so search does not undo them.
  document.querySelectorAll("[data-filter]").forEach((chip) =>
    chip.addEventListener("click", () => {
      games.forEach((g) => (g.dataset.hiddenByCategory = g.hidden ? "1" : ""))
      applySearch()
    }),
  )

  // Every "play" or account action explains that this is a concept.
  const modal = document.querySelector("[data-modal]")
  const text = document.querySelector("[data-modal-text]")
  document.querySelectorAll("[data-demo]").forEach((b) =>
    b.addEventListener("click", () => {
      const what = b.dataset.demo
      text.textContent = what === "account"
        ? "Lucky Lagoon has no accounts or deposits. It is a design concept, so there is nothing to sign up for."
        : `“${what}” is a design mock-up. Nothing here can be played for money.`
      window.DemoKit?.track("select_content", { content_type: what === "account" ? "account_cta" : "game_tile", content_id: what })
      if (typeof modal.showModal === "function") modal.showModal()
      else alert(text.textContent)
    }),
  )

  // Display jackpot: a slow visual counter. Labelled on the page as not a real prize.
  const jackpot = document.querySelector("[data-jackpot]")
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  let value = 1284350
  const fmt = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 })
  if (!reduce) {
    setInterval(() => {
      value += Math.floor(Math.random() * 40) + 5
      jackpot.textContent = fmt.format(value)
    }, 1200)
  }
})()
