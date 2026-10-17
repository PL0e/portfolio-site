/**
 * Kitchen Line paddle finder: highlights the paddle that matches a play style.
 * Loaded after ../shared/demo-kit.js, which provides window.DemoKit.track.
 */
;(() => {
  "use strict"

  const picks = {
    control: { reason: "A thick 16 mm core soaks up pace, so dinks and resets land softly." },
    power: { reason: "A thinner 13 mm core and fiberglass face add pop on drives and put-aways." },
    allcourt: { reason: "Two forgiving paddles and balls to learn with, at a beginner-friendly price." },
  }

  const options = document.querySelectorAll("[data-style-pick]")
  const result = document.querySelector("[data-finder-result]")

  options.forEach((opt) => {
    opt.addEventListener("click", () => {
      const style = opt.dataset.stylePick
      const card = document.querySelector(`.card[data-style="${style}"]`)
      if (!card) return

      options.forEach((o) => o.setAttribute("aria-pressed", String(o === opt)))
      document.querySelectorAll(".card.is-recommended").forEach((c) => c.classList.remove("is-recommended"))
      card.classList.add("is-recommended")

      const name = card.querySelector("h3").textContent
      const price = card.querySelector(".price").textContent
      result.innerHTML = `
        <p class="finder__label">We recommend</p>
        <p class="finder__name">${name}</p>
        <p class="finder__price">${price}</p>
        <p class="finder__why">${picks[style].reason}</p>
        <a class="btn btn--lime" href="#shop" data-jump>See it in the shop</a>`

      result.querySelector("[data-jump]").addEventListener("click", (e) => {
        e.preventDefault()
        // Make sure the recommended card isn't hidden by an active filter.
        document.querySelector('[data-filter="all"]')?.click()
        card.scrollIntoView({ behavior: "smooth", block: "center" })
      })

      window.DemoKit?.track("select_content", { content_type: "paddle_finder", content_id: style, item_name: name })
    })
  })
})()
