/**
 * Rallyo live scorer: pickleball doubles side-out scoring.
 * Score call = serving team score - receiving team score - server number.
 * A game starts at 0-0-2 (the first serving team gets one server), goes to 11, win by 2.
 */
;(() => {
  "use strict"

  const names = ["Dinks & Drives", "Kitchen Crew"]
  const fresh = () => ({ score: [0, 0], serving: 0, server: 2, winner: null })
  let state = fresh()
  const history = []

  const $ = (s) => document.querySelector(s)
  const call = $("[data-call]")
  const serverLine = $("[data-server]")
  const ball = $("[data-ball]")
  const teams = document.querySelectorAll(".team")
  const rallyBtns = document.querySelectorAll("[data-rally]")

  function render() {
    const s = state.serving
    call.textContent = `${state.score[s]}-${state.score[1 - s]}-${state.server}`
    serverLine.textContent = state.winner === null
      ? `${names[s]} serving · server ${state.server}`
      : `${names[state.winner]} win ${Math.max(...state.score)}-${Math.min(...state.score)}`
    teams.forEach((t, i) => t.classList.toggle("is-serving", i === s && state.winner === null))
    teams.forEach((t, i) => t.classList.toggle("is-winner", i === state.winner))
    rallyBtns.forEach((b) => (b.disabled = state.winner !== null))
    ball.style.left = s === 0 ? "22%" : "72%"
  }

  function rally(team) {
    if (state.winner !== null) return
    history.push(JSON.parse(JSON.stringify(state)))
    if (team === state.serving) {
      state.score[team]++
      const [a, b] = [state.score[team], state.score[1 - team]]
      if (a >= 11 && a - b >= 2) {
        state.winner = team
        window.DemoKit?.track("select_content", { content_type: "live_scorer", content_id: "game_complete" })
      }
    } else if (state.server === 1) {
      state.server = 2
    } else {
      state.serving = 1 - state.serving // side-out
      state.server = 1
    }
    render()
  }

  rallyBtns.forEach((b) => b.addEventListener("click", () => rally(Number(b.dataset.rally))))
  $("[data-undo]").addEventListener("click", () => {
    if (history.length) state = history.pop()
    render()
  })
  $("[data-new-game]").addEventListener("click", () => {
    state = fresh()
    history.length = 0
    render()
  })

  // Concept store buttons
  document.querySelectorAll("[data-store]").forEach((b) =>
    b.addEventListener("click", () => {
      window.DemoKit?.track("generate_lead", { lead_source: b.dataset.store })
      b.textContent = "Concept app: nothing to download"
    }),
  )

  render()
})()
