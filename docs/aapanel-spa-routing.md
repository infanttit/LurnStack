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

## Nginx

If the aapanel site uses Nginx, add this inside the `server` block for
`lurnstack.com`:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Keep backend/API proxy rules separate on `api.lurnstack.com`. Do not proxy
frontend routes like `/courses` to the backend.
