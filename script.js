/**
 * Portfolio - Vanilla JavaScript
 * Handles tab navigation and project card expansion
 */

// Tab Navigation
const navTabs = document.querySelectorAll(".nav__tab")
const tabPanels = document.querySelectorAll(".tab-panel")

navTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetTabName = tab.getAttribute("data-tab")

    // Remove active state from all tabs and panels
    navTabs.forEach((t) => {
      t.classList.remove("nav__tab--active")
      t.setAttribute("aria-selected", "false")
    })

    tabPanels.forEach((panel) => {
      panel.classList.remove("tab-panel--active")
      panel.setAttribute("hidden", "")
    })

    // Add active state to clicked tab and corresponding panel
    tab.classList.add("nav__tab--active")
    tab.setAttribute("aria-selected", "true")

    const activePanel = document.getElementById(`${targetTabName}-panel`)
    if (activePanel) {
      activePanel.classList.add("tab-panel--active")
      activePanel.removeAttribute("hidden")
    }
  })

  // Keyboard navigation support
  tab.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      tab.click()
    }
  })
})

// Project Card Expansion
const projectCards = document.querySelectorAll(".project-card")

projectCards.forEach((card) => {
  const expandButton = card.querySelector(".project-card__expand")
  const details = card.querySelector(".project-card__details")

  expandButton.addEventListener("click", (e) => {
    e.stopPropagation()

    const isExpanded = expandButton.getAttribute("aria-expanded") === "true"

    if (isExpanded) {
      expandButton.setAttribute("aria-expanded", "false")
      details.setAttribute("hidden", "")
    } else {
      expandButton.setAttribute("aria-expanded", "true")
      details.removeAttribute("hidden")
    }
  })

  // Allow card click to expand (except on buttons/links)
  card.addEventListener("click", (e) => {
    if (e.target.tagName !== "A" && e.target.tagName !== "BUTTON") {
      expandButton.click()
    }
  })
})

// Resume handlers
const resumeUrl = "assets/resume_diaglendell_.pdf"

const viewResumeBtn = document.querySelector('[data-action="view-resume"]')
if (viewResumeBtn) {
  viewResumeBtn.addEventListener("click", (event) => {
    event.preventDefault()
    window.open(resumeUrl, "_blank", "noopener,noreferrer")
  })
}

const downloadBtn = document.querySelector('[data-action="download-resume"]')
if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a")
    link.href = resumeUrl
    link.download = "resume_diaglendell_.pdf"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href")
    if (href !== "#" && href !== "#!") {
      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({ behavior: "smooth" })
      }
    }
  })
})

console.log("[v0] Portfolio initialized successfully")
