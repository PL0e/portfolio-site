/**
 * The Daily Brew brew-ratio calculator.
 * Loaded after ../shared/demo-kit.js, which provides window.DemoKit.track.
 */
;(() => {
  "use strict"

  const form = document.querySelector("[data-calc]")
  const method = form.elements.method
  const cups = form.elements.cups
  const coffeeOut = form.querySelector("[data-coffee]")
  const waterOut = form.querySelector("[data-water]")
  const ML_PER_CUP = 250

  function calculate() {
    const n = Math.min(8, Math.max(1, Math.round(Number(cups.value)) || 1))
    const ratio = Number(method.value)
    const water = n * ML_PER_CUP
    coffeeOut.textContent = `${Math.round(water / ratio)} g`
    waterOut.textContent = `${water} ml`
    return n
  }

  form.addEventListener("submit", (e) => e.preventDefault())
  form.addEventListener("input", calculate)
  form.addEventListener("change", () => {
    const n = calculate()
    cups.value = n // snap out-of-range input back to 1–8
    window.DemoKit?.track("select_content", {
      content_type: "brew_calculator",
      content_id: method.options[method.selectedIndex].text,
      cups: n,
    })
  })

  calculate()
})()
