/**
 * SAMPLE search performance data (Google Search Console-style).
 *
 * These numbers are generated, not real: the concept stores are noindexed and
 * have no search traffic. Every place that shows them labels them "Sample data".
 *
 * Shared by the demo kit (store pages) and the portfolio cards so both always
 * show identical numbers for the same store. Generation is seeded by the page
 * title, so values are stable across reloads and internally consistent:
 * clicks = impressions × CTR per query, and totals = sum of the daily values.
 *
 * Usage: SearchSample.generate({ title, brand, keywords: ["kw one", "kw two"] })
 */
;(() => {
  "use strict"

  function seededRandom(text) {
    let h = 1779033703 ^ text.length
    for (let i = 0; i < text.length; i++) {
      h = Math.imul(h ^ text.charCodeAt(i), 3432918353)
      h = (h << 13) | (h >>> 19)
    }
    let a = h >>> 0
    return () => {
      a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  const cache = new Map()

  function generate({ title, brand, keywords }) {
    const key = JSON.stringify([title, brand, keywords])
    if (cache.has(key)) return cache.get(key)

    const rand = seededRandom(title)
    const between = (lo, hi) => lo + rand() * (hi - lo)
    // Approximate organic CTR by position (~28% at #1, ~8% at #5, ~2% at #10).
    const ctrAt = (pos) => Math.max(0.004, 0.28 * Math.exp(-0.3 * (pos - 1)) * between(0.8, 1.2))

    const targets = keywords.map((k) => k.trim().toLowerCase()).filter(Boolean)
    // Volumes sized for a small, new store: roughly 25–45 clicks per 28 days.
    const rows = [{ query: brand.trim().toLowerCase(), impressions: Math.round(between(45, 90)), position: between(1, 1.6) }]
    targets.forEach((kw, i) => {
      rows.push({ query: kw, impressions: Math.round(between(130, 460) / (i + 1)), position: between(7, 18) })
      rows.push({ query: `${kw} cebu`, impressions: Math.round(between(20, 75)), position: between(2.5, 8) })
      if (i < 2) rows.push({ query: `best ${kw}`, impressions: Math.round(between(30, 100)), position: between(9, 24) })
    })
    rows.forEach((r) => {
      r.ctrRate = ctrAt(r.position)
      r.clicks = Math.round(r.impressions * r.ctrRate)
    })
    // Keep every demo a small, new site: under 50 clicks per 28 days.
    const MAX_CLICKS = 45
    const raw = rows.reduce((t, r) => t + r.clicks, 0)
    if (raw > MAX_CLICKS) {
      const k = MAX_CLICKS / raw
      rows.forEach((r) => {
        r.impressions = Math.max(1, Math.round(r.impressions * k))
        r.clicks = Math.round(r.impressions * r.ctrRate)
      })
    }
    rows.forEach((r) => {
      delete r.ctrRate
      r.ctr = r.impressions ? r.clicks / r.impressions : 0
    })
    rows.sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)

    const clicks = rows.reduce((t, r) => t + r.clicks, 0)
    const impressions = rows.reduce((t, r) => t + r.impressions, 0)
    const position = rows.reduce((t, r) => t + r.position * r.impressions, 0) / impressions

    // Spread totals over 28 days: gentle upward trend, softer weekends, noise.
    const DAYS = 28
    const end = new Date()
    end.setHours(0, 0, 0, 0)
    const dates = Array.from({ length: DAYS }, (_, i) => new Date(end.getTime() - (DAYS - 1 - i) * 86400000))
    const weights = dates.map((d, i) => (1 + 0.35 * (i / (DAYS - 1))) * ([0, 6].includes(d.getDay()) ? 0.82 : 1.06) * between(0.85, 1.15))

    // Largest-remainder rounding: integer days that sum exactly to the total,
    // without piling the rounding leftovers onto a single day.
    const spread = (total) => {
      const sum = weights.reduce((t, w) => t + w, 0)
      const exact = weights.map((w) => (total * w) / sum)
      const out = exact.map(Math.floor)
      let left = total - out.reduce((t, v) => t + v, 0)
      exact
        .map((v, i) => [v - Math.floor(v), i])
        .sort((a, b) => b[0] - a[0])
        .forEach(([, i]) => {
          if (left > 0) {
            out[i]++
            left--
          }
        })
      return out
    }
    const dailyImpressions = spread(impressions)
    // Clicks are few per day, so even spreading would give an unnatural run of
    // 1s and 2s. Instead, drop each click on a random day weighted by that
    // day's impressions: realistic 0–4 click days that still sum exactly.
    const dailyClicks = new Array(DAYS).fill(0)
    for (let c = 0; c < clicks; c++) {
      let r = rand() * impressions
      let d = 0
      while (d < DAYS - 1 && r >= dailyImpressions[d]) r -= dailyImpressions[d++]
      dailyClicks[d] = Math.min(dailyClicks[d] + 1, dailyImpressions[d])
    }
    // Re-add anything the clamp removed, one click at a time, to days with room.
    let missing = clicks - dailyClicks.reduce((t, v) => t + v, 0)
    for (let i = 0; missing > 0 && i < DAYS * 4; i++) {
      const d = i % DAYS
      if (dailyClicks[d] < dailyImpressions[d]) {
        dailyClicks[d]++
        missing--
      }
    }

    const mobile = between(0.66, 0.76)
    const tablet = between(0.03, 0.06)
    const result = {
      dates,
      daily: { clicks: dailyClicks, impressions: dailyImpressions },
      totals: { clicks, impressions, ctr: clicks / impressions, position },
      rows,
      devices: [
        ["Mobile", mobile],
        ["Desktop", 1 - mobile - tablet],
        ["Tablet", tablet],
      ],
    }
    cache.set(key, result)
    return result
  }

  window.SearchSample = { generate }
})()
