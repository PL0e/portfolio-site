/**
 * Hinabi concept store - product filters, demo cart, newsletter form.
 */
;(() => {
  "use strict"

  // ---------- Product filters ----------
  const chips = document.querySelectorAll("[data-filter]")
  const cards = document.querySelectorAll("[data-grid] .card")
  const live = document.querySelector("[data-live]")

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter
      chips.forEach((c) => {
        const active = c === chip
        c.classList.toggle("is-active", active)
        c.setAttribute("aria-pressed", String(active))
      })
      let shown = 0
      cards.forEach((card) => {
        const match = filter === "all" || card.dataset.cat === filter
        card.hidden = !match
        if (match) shown++
      })
      live.textContent = `Showing ${shown} product${shown === 1 ? "" : "s"}`
    })
  })

  // ---------- Demo cart ----------
  const cartBtn = document.querySelector("[data-cart]")
  const cartCount = document.querySelector("[data-cart-count]")
  const toast = document.querySelector("[data-toast]")
  let count = 0
  let toastTimer

  const showToast = (text) => {
    toast.textContent = text
    toast.classList.add("is-show")
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toast.classList.remove("is-show"), 2200)
  }

  document.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => {
      count++
      cartCount.textContent = count
      cartBtn.setAttribute("aria-label", `Cart, ${count} item${count === 1 ? "" : "s"}`)
      cartBtn.classList.remove("is-bump")
      void cartBtn.offsetWidth // restart the bump animation
      cartBtn.classList.add("is-bump")

      button.textContent = "Added ✓"
      button.classList.add("is-added")
      setTimeout(() => {
        button.textContent = "Add to cart"
        button.classList.remove("is-added")
      }, 1400)

      showToast(`${button.dataset.add} added to cart`)
    })
  })

  cartBtn.addEventListener("click", () => {
    showToast(count ? `Demo cart: ${count} item${count === 1 ? "" : "s"}. Checkout is disabled in this concept.` : "Your cart is empty.")
  })

  // ---------- Newsletter (demo only) ----------
  const form = document.querySelector("[data-news]")
  const msg = document.querySelector("[data-news-msg]")
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    const input = form.querySelector("input")
    if (!input.value.trim() || !input.checkValidity()) {
      input.setAttribute("aria-invalid", "true")
      msg.textContent = "Please enter a valid email address."
      input.focus()
      return
    }
    input.removeAttribute("aria-invalid")
    msg.textContent = "Thanks! (Demo only, so no email was stored.)"
    form.reset()
  })
})()
