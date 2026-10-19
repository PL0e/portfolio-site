/**
 * Tally scoreboard.
 * Rules: a set is won at the target score (win by 2 if set, or at the cap);
 * the match ends when a side wins more than half of "best of" sets.
 * Serve: "rally" = the rally winner serves; a number N = serve switches every
 * N points, and every point once both sides reach target - 1 (deuce).
 */
;(() => {
  "use strict"

  const PRESETS = {
    badminton: { bestOf: 3, points: 21, cap: 30, serve: "rally", winBy2: true },
    tabletennis: { bestOf: 5, points: 11, cap: 0, serve: "2", winBy2: true },
    pickleball: { bestOf: 3, points: 11, cap: 0, serve: "rally", winBy2: true },
    volleyball: { bestOf: 5, points: 25, cap: 0, serve: "rally", winBy2: true, finalSet: 15 },
  }

  const $ = (s, r = document) => r.querySelector(s)
  const $$ = (s, r = document) => [...r.querySelectorAll(s)]
  const form = $("[data-config]")
  const board = $("[data-board]")
  const announce = $("[data-announce]")

  let rules = { ...PRESETS.badminton }
  let preset = "badminton"
  let first = 0
  let s // match state
  const undo = []

  function newMatch() {
    const f = form.elements
    rules = {
      bestOf: Number(f.bestOf.value),
      points: Math.max(1, Number(f.points.value) || 21),
      cap: Math.max(0, Number(f.cap.value) || 0),
      serve: f.serve.value,
      winBy2: f.winBy2.checked,
      finalSet: PRESETS[preset]?.finalSet && preset === "volleyball" ? PRESETS[preset].finalSet : 0,
    }
    s = {
      names: [f.p1.value.trim() || "Side A", f.p2.value.trim() || "Side B"],
      title: f.title.value.trim() || "Match",
      pts: [0, 0],
      sets: [0, 0],
      done: [],
      setFirst: first,
      server: first,
      winner: null,
    }
    undo.length = 0
    render()
  }

  const setNo = () => s.done.length + 1
  const isFinalSet = () => setNo() === rules.bestOf
  const target = () => (isFinalSet() && rules.finalSet ? rules.finalSet : rules.points)

  function serverFromCount() {
    const n = Number(rules.serve)
    const t = s.pts[0] + s.pts[1]
    const deuceAt = 2 * (target() - 1)
    if (rules.winBy2 && s.pts[0] >= target() - 1 && s.pts[1] >= target() - 1) {
      return (s.setFirst + Math.floor(deuceAt / n) + (t - deuceAt)) % 2
    }
    return (s.setFirst + Math.floor(t / n)) % 2
  }

  function setWon(i) {
    const a = s.pts[i], b = s.pts[1 - i]
    return (a >= target() && (!rules.winBy2 || a - b >= 2)) || (rules.cap > 0 && a >= rules.cap)
  }

  function point(i) {
    if (s.winner !== null) return
    undo.push(JSON.stringify(s))
    s.pts[i]++
    s.server = rules.serve === "rally" ? i : serverFromCount()
    if (setWon(i)) {
      s.sets[i]++
      s.done.push([...s.pts])
      if (s.sets[i] > rules.bestOf / 2) {
        s.winner = i
        window.DemoKit?.track("select_content", { content_type: "scoreboard", content_id: "match_complete", sport: preset })
      } else {
        s.pts = [0, 0]
        // Rally scoring: the set winner serves first. Fixed rotation: alternate the opener.
        s.setFirst = rules.serve === "rally" ? i : 1 - s.setFirst
        s.server = s.setFirst
      }
    }
    render(`${s.names[0]} ${s.pts[0]}, ${s.names[1]} ${s.pts[1]}`)
  }

  function minus(i) {
    if (s.winner !== null || s.pts[i] === 0) return
    undo.push(JSON.stringify(s))
    s.pts[i]--
    if (rules.serve !== "rally") s.server = serverFromCount()
    render()
  }

  function status() {
    if (s.winner !== null) return `${s.names[s.winner]} win ${s.sets[s.winner]}–${s.sets[1 - s.winner]}`
    const near = [0, 1].some((i) => {
      s.pts[i]++
      const won = setWon(i) && s.sets[i] + 1 > rules.bestOf / 2
      s.pts[i]--
      return won
    })
    if (near) return "Match point"
    return `Set ${setNo()} · Best of ${rules.bestOf} · to ${target()}`
  }

  function render(say) {
    $("[data-title]").textContent = s.title
    $("[data-status]").textContent = status()
    ;[0, 1].forEach((i) => {
      $(`[data-name="${i}"]`).textContent = s.names[i]
      $(`[data-btn-name="${i}"]`).textContent = s.names[i]
      $(`[data-sets="${i}"]`).textContent = s.sets[i]
      $(`[data-pts="${i}"]`).textContent = s.pts[i]
      const row = $(`[data-row="${i}"]`)
      row.classList.toggle("is-serving", s.winner === null && s.server === i)
      row.classList.toggle("is-winner", s.winner === i)
    })
    $("[data-history]").innerHTML = s.done.map((d, k) => `<span>Set ${k + 1}: ${d[0]}–${d[1]}</span>`).join("")
    $$("[data-point]").forEach((b) => (b.disabled = s.winner !== null))
    if (say) announce.textContent = s.winner !== null ? status() : say
  }

  // ---- Events ----
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    newMatch()
  })

  $$("[data-preset]").forEach((b) =>
    b.addEventListener("click", () => {
      preset = b.dataset.preset
      const p = PRESETS[preset]
      const f = form.elements
      f.bestOf.value = String(p.bestOf)
      f.points.value = p.points
      f.cap.value = p.cap
      f.serve.value = p.serve
      f.winBy2.checked = p.winBy2
      $$("[data-preset]").forEach((x) => {
        x.classList.toggle("is-active", x === b)
        x.setAttribute("aria-pressed", String(x === b))
      })
      window.DemoKit?.track("select_content", { content_type: "sport_preset", content_id: preset })
      newMatch()
    }),
  )

  $$("[data-first]").forEach((b) =>
    b.addEventListener("click", () => {
      first = Number(b.dataset.first)
      $$("[data-first]").forEach((x) => {
        x.classList.toggle("is-active", x === b)
        x.setAttribute("aria-pressed", String(x === b))
      })
      newMatch()
    }),
  )

  $$("[data-theme]").forEach((b) => {
    if (b === board) return
    b.addEventListener("click", () => {
      board.dataset.theme = b.dataset.theme
      $$(".theme").forEach((x) => {
        x.classList.toggle("is-active", x === b)
        x.setAttribute("aria-pressed", String(x === b))
      })
    })
  })

  $$("[data-point]").forEach((b) => b.addEventListener("click", () => point(Number(b.dataset.point))))
  $$("[data-minus]").forEach((b) => b.addEventListener("click", () => minus(Number(b.dataset.minus))))
  $("[data-undo]").addEventListener("click", () => {
    if (undo.length) s = JSON.parse(undo.pop())
    render("Undone")
  })
  $("[data-swap]").addEventListener("click", () => board.parentElement.classList.toggle("is-swapped"))
  $("[data-full]").addEventListener("click", () => {
    const el = board.parentElement
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  })

  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, select, textarea") || e.metaKey || e.ctrlKey || e.altKey) return
    const k = e.key.toLowerCase()
    if (k === "a") point(0)
    else if (k === "l") point(1)
    else if (k === "z") $("[data-undo]").click()
  })

  newMatch()
  window.TallyBoard = { point, minus, state: () => JSON.parse(JSON.stringify(s)), rules: () => ({ ...rules }) }
})()
