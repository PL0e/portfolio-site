# Glendell S. Dia - Portfolio Website

A modern, single-page portfolio showcasing data analytics expertise and software engineering background.

## Overview

This portfolio is built with **vanilla HTML, CSS, and JavaScript** for maximum performance and compatibility. It features:

- Responsive design optimized for mobile and desktop
- Interactive project cards with expandable details
- Smooth tab navigation between Projects, About, and Contact sections
- Accessible components with ARIA attributes
- CSS variables for easy customization
- BEM naming convention for CSS classes

## Setup Instructions

### Option 1: Direct File Usage
1. Download all files from the project
2. Ensure the folder structure is:
   \`\`\`
   portfolio/
   ├── index.html
   ├── styles.css
   ├── script.js
   ├── assets/
   │   ├── resume.pdf
   │   └── [your-images]
   └── README.md
   \`\`\`
3. Open `index.html` in your browser

### Option 2: Local Server
\`\`\`bash
# Using Python 3
python -m http.server 8000

# Or using Node.js with http-server
npx http-server

# Then navigate to http://localhost:8000
\`\`\`

## Customization Guide

### Replace Personal Content
- **Email:** Line 245 in `index.html` - `mailto:glendell@example.com`
- **LinkedIn:** Line 250 - Update to your LinkedIn profile URL
- **GitHub:** Line 255 - Update to your GitHub profile URL
- **Resume:** Store your PDF in `assets/resume.pdf`

### Update Avatar Image
- Line 43 in `index.html`: Replace placeholder URL with your image
- Recommended size: 200x200px, square format
- Supported formats: JPG, PNG, WebP

### Add/Remove Skills
- Lines 76-84 in `index.html`: Edit `<span class="skill-pill">` elements
- Add or remove skills as needed

### Modify Projects
- Each project is in `<div class="project-card">`
- Update title, objective, and tools
- Add your GitHub and dataset links in the details section
- Replace placeholder images with actual visualizations

### Update Colors
In `styles.css`, modify CSS variables (lines 1-20):
\`\`\`css
--color-accent: #00d9ff;        /* Main accent color */
--color-bg-primary: #000000;    /* Background */
--color-text-primary: #ffffff;  /* Main text */
\`\`\`

### Change Fonts
In `styles.css`, update font families (lines 17-18):
\`\`\`css
--font-family-heading: 'Your Font', sans-serif;
--font-family-body: 'Your Font', sans-serif;
\`\`\`

## Code Style & Conventions

### CSS Naming (BEM)
\`\`\`css
.component__element--modifier {
  /* Styles */
}
\`\`\`

### JavaScript Variables
\`\`\`javascript
const camelCaseVariableName = value;
const projectCardElement = document.querySelector('.project-card');
\`\`\`

### CSS Classes
\`\`\`css
.nav__tab--active
.project-card__expand
.skill-pill
\`\`\`

## Development Tools (Optional)

### Linting & Formatting
\`\`\`bash
# Install Prettier
npm install --save-dev prettier

# Format all files
npx prettier --write .

# Install ESLint
npm install --save-dev eslint

# Run ESLint
npx eslint script.js
\`\`\`

## Roadmap: 1-Month (Intense) Plan

### Week 1: Foundation & Content
- [ ] **Mon-Tue:** Finalize personal content and project descriptions
- [ ] **Wed-Thu:** Create or gather professional images/avatars
- [ ] **Fri:** Set up version control (GitHub repo)
- **Milestone:** Content ready, repo initialized

### Week 2: Customization & Enhancement
- [ ] **Mon-Wed:** Customize colors and fonts to match personal branding
- [ ] **Thu-Fri:** Add real project links, GitHub repos, and dataset URLs
- **Milestone:** Fully personalized design

### Week 3: Advanced Features & Polish
- [ ] **Mon:** Add analytics (Google Analytics or similar)
- [ ] **Tue-Wed:** Optimize images and performance
- [ ] **Thu-Fri:** Cross-browser and mobile testing
- **Milestone:** Optimized and tested

### Week 4: Deployment & Promotion
- [ ] **Mon:** Deploy to hosting (Vercel, Netlify, or GitHub Pages)
- [ ] **Tue-Wed:** Set up custom domain (if desired)
- [ ] **Thu-Fri:** Share on LinkedIn, GitHub, and professional networks
- **Milestone:** Live portfolio with promotion

## Roadmap: 2-Month (Balanced) Plan

### Week 1: Planning & Content Creation
- [ ] **Mon-Tue:** Define portfolio goals and target audience
- [ ] **Wed-Fri:** Write detailed project descriptions and case studies
- **Milestone:** Content finalized

### Week 2: Design & Customization
- [ ] **Mon-Tue:** Customize colors and typography
- [ ] **Wed-Thu:** Create or refine avatar and project images
- [ ] **Fri:** Review design across devices
- **Milestone:** Design approved

### Week 3: Content Integration
- [ ] **Mon-Tue:** Add all personal links (LinkedIn, GitHub, email)
- [ ] **Wed-Thu:** Integrate real project data and visualizations
- [ ] **Fri:** Write About section and case study
- **Milestone:** All content integrated

### Week 4: Enhancement & Optimization
- [ ] **Mon:** Add animations and micro-interactions
- [ ] **Tue-Wed:** Optimize performance and SEO
- [ ] **Thu-Fri:** Accessibility audit and fixes
- **Milestone:** Performance optimized

### Week 5: Testing & Refinement
- [ ] **Mon-Tue:** Cross-browser testing
- [ ] **Wed-Thu:** Mobile responsiveness testing
- [ ] **Fri:** Gather feedback and refinements
- **Milestone:** Quality assured

### Week 6: Advanced Features
- [ ] **Mon-Tue:** Add dark/light mode toggle (optional)
- [ ] **Wed-Thu:** Integrate contact form with backend (optional)
- [ ] **Fri:** Final polish and review
- **Milestone:** Advanced features complete

### Week 7-8: Deployment & Promotion
- [ ] **Week 7:** Deploy to hosting platform
- [ ] **Week 7-8:** Set up analytics and monitoring
- [ ] **Week 8:** Share across networks and gather feedback
- **Milestone:** Live and promoted

## Deployment Options

### Vercel (Recommended)
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### GitHub Pages
1. Push code to GitHub repo
2. Go to Settings → Pages
3. Select "Deploy from branch" → main
4. Your site will be available at `username.github.io/portfolio`

### Netlify
1. Drag and drop your project folder
2. Configure domain settings
3. Automatic HTTPS enabled

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

- Keep images under 200KB
- Use WebP format for faster loading
- Minify CSS and JavaScript in production
- Enable gzip compression on server
- Use a CDN for assets

## Accessibility

This portfolio includes:
- Semantic HTML (`<nav>`, `<main>`, `<section>`)
- ARIA attributes for screen readers
- Keyboard navigation support
- Sufficient color contrast ratios
- Focus indicators for interactive elements

## License

This portfolio template is free to use and modify for personal projects.

## Support & Questions

For issues or customization help:
1. Check the Customization Guide section above
2. Review existing code comments
3. Test in different browsers
4. Ensure all files are in correct locations

---

**Last Updated:** November 2024
**Version:** 1.0
