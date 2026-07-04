import '@scalar/api-reference/style.css'
import { createApiReference } from '@scalar/api-reference'
import { Marked } from 'marked'
import config from '/scalar.config.json'

function flattenRoutes(routes) {
    const pages = {}
    for (const [path, route] of Object.entries(routes)) {
        if (route?.type === 'page' && route?.filepath) {
            pages[path] = route
        } else if (route?.type === 'group' && route?.children) {
            Object.assign(pages, flattenRoutes(route.children))
        }
    }
    return pages
}

const pageRoutes = config?.navigation?.routes
    ? flattenRoutes(config.navigation.routes)
    : {}

const currentPath = window.location.pathname

function getTheme() {
    const stored = localStorage.getItem('granite-theme')
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme) {
    const cls = theme === 'dark' ? 'dark-mode' : 'light-mode'
    document.documentElement.className = cls
    localStorage.setItem('granite-theme', theme)
}

applyTheme(getTheme())

const nav = document.getElementById('site-nav')

const brand = document.createElement('a')
brand.className = 'nav-brand'
brand.href = '/'
brand.textContent = config?.info?.title || 'API Docs'
nav.appendChild(brand)

const apiLink = document.createElement('a')
apiLink.href = '/'
apiLink.textContent = 'API Reference'
if (currentPath === '/' || currentPath === '') apiLink.classList.add('active')
nav.appendChild(apiLink)

function isChildActive(children) {
    return Object.keys(children).some(childPath => currentPath === childPath)
}

function buildNavItems(routes, parentElement) {
    for (const [path, route] of Object.entries(routes)) {
        if (route?.type === 'group' && route?.children) {
            const groupWrapper = document.createElement('div')
            groupWrapper.className = 'nav-group'

            const groupBtn = document.createElement('button')
            groupBtn.className = 'nav-group-toggle'

            const btnLabel = document.createElement('span')
            btnLabel.textContent = route.title || path
            groupBtn.appendChild(btnLabel)

            const chevron = document.createElement('span')
            chevron.className = 'nav-group-chevron'
            chevron.innerHTML = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"><path d="M2 3.5L5 6.5L8 3.5"/></svg>'
            groupBtn.appendChild(chevron)

            if (isChildActive(route.children)) {
                groupBtn.classList.add('active')
            }

            groupBtn.addEventListener('click', (e) => {
                e.preventDefault()
                groupWrapper.classList.toggle('open')
            })

            const dropdown = document.createElement('div')
            dropdown.className = 'nav-dropdown'

            for (const [childPath, childRoute] of Object.entries(route.children)) {
                const link = document.createElement('a')
                link.href = childPath
                link.textContent = childRoute.title || childPath
                if (currentPath === childPath) {
                    link.classList.add('active')
                }
                link.addEventListener('click', () => {
                    groupWrapper.classList.remove('open')
                })
                dropdown.appendChild(link)
            }

            groupWrapper.appendChild(groupBtn)
            groupWrapper.appendChild(dropdown)
            parentElement.appendChild(groupWrapper)
        } else if (route?.type === 'page' && route?.filepath) {
            const link = document.createElement('a')
            link.href = path
            link.textContent = route.title || path
            if (currentPath === path) link.classList.add('active')
            parentElement.appendChild(link)
        }
    }
}

buildNavItems(config?.navigation?.routes || {}, nav)

const themeBtn = document.createElement('button')
themeBtn.className = 'nav-theme-toggle'
themeBtn.setAttribute('aria-label', 'Toggle theme')
themeBtn.innerHTML = '<svg class="icon-sun" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="3"/><path d="M8 1v1M8 14v1M2.3 3.7l.7.7M13 13l.7.7M1 8h1M14 8h1M2.3 12.3l.7-.7M13 3l.7-.7"/></svg><svg class="icon-moon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M13 10.5A5.5 5.5 0 1 1 5.5 3a6 6 0 0 0 7.5 7.5z"/></svg>'
themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark-mode')
    applyTheme(isDark ? 'light' : 'dark')
})
nav.appendChild(themeBtn)

document.addEventListener('click', (e) => {
    for (const group of document.querySelectorAll('.nav-group.open')) {
        if (!group.contains(e.target)) {
            group.classList.remove('open')
        }
    }
})

const matchedRoute = pageRoutes[currentPath]

if (matchedRoute) {
    document.getElementById('api-reference').style.display = 'none'
    const mdContainer = document.getElementById('markdown-page')
    mdContainer.style.display = 'block'

    if (matchedRoute.title) {
        document.title = matchedRoute.title
    }

    function setupCopyButtons(container) {
        for (const pre of container.querySelectorAll('pre')) {
            const code = pre.querySelector('code')
            if (!code || pre.querySelector('.copy-btn')) continue

            const wrapper = document.createElement('div')
            wrapper.style.position = 'relative'

            const btn = document.createElement('button')
            btn.className = 'copy-btn'
            btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="10" height="10" rx="1"/><path d="M6 1H13a2 2 0 0 1 2 2v7"/></svg>'
            btn.title = 'Copy to clipboard'

            btn.addEventListener('click', async () => {
                const text = code.textContent
                try {
                    await navigator.clipboard.writeText(text)
                    btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4L6 11L3 8"/></svg>'
                    btn.title = 'Copied!'
                    setTimeout(() => {
                        btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="10" height="10" rx="1"/><path d="M6 1H13a2 2 0 0 1 2 2v7"/></svg>'
                        btn.title = 'Copy to clipboard'
                    }, 2000)
                } catch {
                    btn.title = 'Failed to copy'
                }
            })

            pre.parentNode.insertBefore(wrapper, pre)
            wrapper.appendChild(pre)
            wrapper.appendChild(btn)
        }
    }

    fetch(`/${matchedRoute.filepath}`)
        .then(res => res.text())
        .then(md => {
            const marked = new Marked()
            mdContainer.innerHTML = marked.parse(md)
            setupCopyButtons(mdContainer)
        })
        .catch(err => {
            mdContainer.innerHTML = `<p>Error loading page: ${err.message}</p>`
        })
} else {
    createApiReference('#api-reference', {
        url: 'https://cawv6iwjgxpk5fj2fchs6vc5vq0bycwp.lambda-url.us-east-2.on.aws/api-docs/openapi.json',
    })
}
