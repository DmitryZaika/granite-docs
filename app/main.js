import config from '/scalar.config.json'

// ── Resolve $ref pointers in an OpenAPI spec ────────────────────────────
function resolveRef(spec, ref) {
    if (typeof ref !== 'string') return ref
    const parts = ref.replace('#/', '').split('/')
    return parts.reduce((obj, key) => obj?.[key], spec)
}

// ── Render a schema as Required / Optional tables ───────────────────────
function renderSchemaTable(schema, requiredList) {
    const required = new Set(requiredList || [])
    const props = schema.properties || {}

    let html = ''

    const reqFields = Object.entries(props).filter(([name]) => required.has(name))
    if (reqFields.length) {
        html += '<h3>Required</h3>'
        html += '<table><thead><tr><th>Field</th><th>Type</th></tr></thead><tbody>'
        for (const [name, prop] of reqFields) {
            html += `<tr><td><code>${name}</code></td><td><code>${prop.type || 'string'}</code></td></tr>`
        }
        html += '</tbody></table>'
    }

    const optFields = Object.entries(props).filter(([name]) => !required.has(name))
    if (optFields.length) {
        html += '<h3>Optional</h3>'
        html += '<table><thead><tr><th>Field</th><th>Type</th></tr></thead><tbody>'
        for (const [name, prop] of optFields) {
            const type = Array.isArray(prop.type)
                ? prop.type.filter(t => t !== 'null').join(' | ')
                : (prop.type || 'string')
            html += `<tr><td><code>${name}</code></td><td><code>${type}</code></td></tr>`
        }
        html += '</tbody></table>'
    }

    return html
}

// ── Populate all schema-fields placeholders on the page ─────────────────
const OPENAPI_URL =
    'https://cawv6iwjgxpk5fj2fchs6vc5vq0bycwp.lambda-url.us-east-2.on.aws/api-docs/openapi.json'

async function populateSchemaTables(container) {
    const placeholders = container.querySelectorAll('.schema-fields')
    if (!placeholders.length) return

    try {
        const spec = await fetch(OPENAPI_URL).then(r => r.json())
        for (const el of placeholders) {
            const path = el.dataset.schemaPath
            const method = el.dataset.schemaMethod || 'post'
            const schemaRef =
                spec.paths?.[path]?.[method]?.requestBody?.content?.['application/json']?.schema
            if (schemaRef) {
                const schema = resolveRef(spec, schemaRef.$ref || schemaRef)
                el.innerHTML = renderSchemaTable(schema, schema.required || [])
            } else {
                el.innerHTML = '<p>Schema not found.</p>'
            }
        }
    } catch (err) {
        for (const el of placeholders) {
            el.innerHTML = `<p>Error loading schema: ${err.message}</p>`
        }
    }
}

// ── Build site navigation bar ──────────────────────────────────────────
const currentPath = window.location.pathname

// Extract page routes from scalar config
const pageRoutes = {}
if (config?.navigation?.routes) {
    for (const [path, route] of Object.entries(config.navigation.routes)) {
        if (route?.type === 'page' && route?.filepath) {
            pageRoutes[path] = route
        }
    }
}

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

// Page links from config
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
    // Render HTML page
    document.getElementById('api-reference').style.display = 'none'
    const mdContainer = document.getElementById('markdown-page')
    mdContainer.style.display = 'block'

    if (matchedRoute.title) {
        document.title = matchedRoute.title
    }

    fetch(`/${matchedRoute.filepath}`)
        .then(res => res.text())
        .then(async html => {
            mdContainer.innerHTML = html
            await populateSchemaTables(mdContainer)
        })
        .catch(err => {
            mdContainer.innerHTML = `<p>Error loading page: ${err.message}</p>`
        })
} else {
    // Render API reference — lazy-load Scalar (3+ MB) only when needed
    Promise.all([
        import('@scalar/api-reference/style.css'),
        import('@scalar/api-reference'),
    ]).then(([_, { createApiReference }]) => {
        createApiReference('#api-reference', {
            url: OPENAPI_URL,
        })
    })
}
