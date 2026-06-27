import '@scalar/api-reference/style.css'
import { createApiReference } from '@scalar/api-reference'
import { Marked } from 'marked'
import config from '/scalar.config.json'

// Extract markdown page routes from scalar config
const pageRoutes = {}
if (config?.navigation?.routes) {
    for (const [path, route] of Object.entries(config.navigation.routes)) {
        if (route?.type === 'page' && route?.filepath) {
            pageRoutes[path] = route
        }
    }
}

// ── Build site navigation bar ──────────────────────────────────────────
const currentPath = window.location.pathname
const nav = document.getElementById('site-nav')

// Brand link (always goes to API reference)
const brand = document.createElement('a')
brand.className = 'nav-brand'
brand.href = '/'
brand.textContent = config?.info?.title || 'API Docs'
nav.appendChild(brand)

// API Reference link
const apiLink = document.createElement('a')
apiLink.href = '/'
apiLink.textContent = 'API Reference'
if (currentPath === '/' || currentPath === '') apiLink.classList.add('active')
nav.appendChild(apiLink)

// Markdown page links from config
for (const [path, route] of Object.entries(pageRoutes)) {
    const link = document.createElement('a')
    link.href = path
    link.textContent = route.title || path
    if (currentPath === path) link.classList.add('active')
    nav.appendChild(link)
}

// ── Render the current page ───────────────────────────────────────────
const matchedRoute = pageRoutes[currentPath]

if (matchedRoute) {
    // Render markdown page
    document.getElementById('api-reference').style.display = 'none'
    const mdContainer = document.getElementById('markdown-page')
    mdContainer.style.display = 'block'

    if (matchedRoute.title) {
        document.title = matchedRoute.title
    }

    fetch(`/${matchedRoute.filepath}`)
        .then(res => res.text())
        .then(md => {
            const marked = new Marked()
            mdContainer.innerHTML = marked.parse(md)
        })
        .catch(err => {
            mdContainer.innerHTML = `<p>Error loading page: ${err.message}</p>`
        })
} else {
    // Render API reference
    createApiReference('#api-reference', {
        url: 'https://cawv6iwjgxpk5fj2fchs6vc5vq0bycwp.lambda-url.us-east-2.on.aws/api-docs/openapi.json',
    })
}
