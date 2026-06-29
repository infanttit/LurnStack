# aapanel SPA Routing

LurnStack is a React single-page app. Routes like `/courses`, `/login`, and
`/live-classes` are handled by React Router in the browser. On a VPS, the web
server must send unknown frontend routes back to `index.html`; otherwise,
refreshing a route shows a server 404.

## Apache

The frontend includes `public/.htaccess`. After running `npm run build`, it is
copied to `build/.htaccess`.

Apache/aapanel must allow `.htaccess` overrides for the site. If refresh still
shows 404, enable rewrite support and allow overrides for the frontend document
root.

## Nginx / aaPanel

If the aaPanel site uses Nginx, `.htaccess` is ignored. Add this inside the
`server` block for the frontend site `lurnstack.com`:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

The same snippet is also included in `public/nginx-spa-fallback.conf`, so after
`npm run build` it is available as `build/nginx-spa-fallback.conf` for copying
into aaPanel.

### aaPanel steps

1. Open aaPanel.
2. Go to **Website**.
3. Click the config/settings option for `lurnstack.com`.
4. Open the Nginx configuration for that site.
5. Inside the `server { ... }` block, add or replace the frontend `location /`
   rule with:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

6. Save the config.
7. Reload or restart Nginx from aaPanel.

After this, refreshing these frontend routes should load correctly:

- `https://lurnstack.com/login`
- `https://lurnstack.com/signup`
- `https://lurnstack.com/dashboard`
- `https://lurnstack.com/live-classes`
- `https://lurnstack.com/courses`
- `https://lurnstack.com/cart`
- `https://lurnstack.com/checkout`

Keep backend/API proxy rules separate on `api.lurnstack.com`. Do not proxy
frontend routes like `/courses` to the backend.

## Redirecting www to non-www (CORS & SEO)

Since the backend API CORS policy only permits requests from the canonical domain `https://lurnstack.com`, users visiting `https://www.lurnstack.com` will face CORS blocked errors and failed data loading.

To prevent this, you should set up a 301 redirect in Nginx from `www.lurnstack.com` to `lurnstack.com`.

### aaPanel redirect steps:
1. Open aaPanel.
2. Go to **Website** and click on settings/config for `lurnstack.com`.
3. Go to the **Redirect** section or edit the configuration directly.
4. If editing the Nginx configuration, you can insert this redirect check inside your `server { ... }` block:

```nginx
if ($host = 'www.lurnstack.com') {
    return 301 https://lurnstack.com$request_uri;
}
```

5. Save the configuration and reload Nginx.

## Full Nginx Example

Use the correct `root` path for your aaPanel site. It must point to the built
React app folder that contains `index.html`, `static/`, `asset-manifest.json`,
and `.htaccess`.

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name lurnstack.com www.lurnstack.com;
    root /www/wwwroot/lurnstack.com/build;
    index index.html;

    # Redirect www to non-www
    if ($host = 'www.lurnstack.com') {
        return 301 https://lurnstack.com$request_uri;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

If your aaPanel document root is already set to the generated build folder, keep
that existing root and only add the redirect and the `location /` fallback.

