# aaPanel Prerender.io SEO Configuration

To solve the client-side rendering (CSR) limitations of the React Single-Page Application (SPA) without modifying any React codebase files, you can use **Prerender.io**. 

Prerender.io intercepts search engine bots (like Googlebot, Bingbot, Ahrefsbot, etc.) and serves them a fully pre-rendered static HTML version of your site, while serving the standard interactive React SPA bundle to regular human users.

---

## Step 1: Create a Prerender.io Account
1. Sign up for a free account at [Prerender.io](https://prerender.io).
2. Go to your dashboard and copy your **Prerender Token**.

---

## Step 2: Configure aaPanel Nginx Rewrite Rules
To route search crawler traffic to Prerender.io, modify your Nginx server block.

1. Open your **aaPanel** control panel.
2. Go to **Website** in the left menu.
3. Click the settings icon/link for the **lurnstack.com** domain.
4. Go to **Config** (or **URL Rewrite**).
5. Locate the existing `location /` rule block and replace it with the following configuration snippet:

```nginx
# --- START PRERENDER.IO CONFIGURATION ---

# SPA routing configuration with Prerender.io middleware.
# Replace "YOUR_PRERENDER_TOKEN" below with the token from your prerender.io dashboard.

location / {
    try_files $uri @prerender;
}

location @prerender {
    set $prerender_token "YOUR_PRERENDER_TOKEN";
    
    set $prerender 0;
    if ($http_user_agent ~* "googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|pinterestbot|slackbot|vkShare|W3C_Validator|whatsapp|ahrefsbot") {
        set $prerender 1;
    }
    if ($args ~ "_escaped_fragment_") {
        set $prerender 1;
    }
    if ($http_user_agent ~* "prerender") {
        set $prerender 0;
    }
    if ($uri ~* "\.(js|css|xml|less|png|jpg|jpeg|gif|pdf|doc|txt|ico|rss|zip|mp3|rar|exe|wmv|doc|avi|ppt|mpg|mpeg|tif|wav|mov|psd|ai|xls|mp4|m4a|swf|dat|dmg|iso|flv|m4v|torrent|ttf|woff|svg|eot)") {
        set $prerender 0;
    }
    
    # Resolve using Google's public DNS servers to avoid resolution errors
    resolver 8.8.8.8 8.8.4.4;
    
    if ($prerender = 1) {
        set $prerender_url "service.prerender.io";
        rewrite .* /$scheme://$host$request_uri? break;
        proxy_pass http://$prerender_url;
        proxy_set_header X-Prerender-Token $prerender_token;
    }
    
    if ($prerender = 0) {
        rewrite .* /index.html break;
    }
}

# --- END PRERENDER.IO CONFIGURATION ---
```

6. Click **Save**.
7. Reload or restart **Nginx** via the App Store/Control Center on aaPanel to apply the changes.

---

## Step 3: Verification
Once Nginx is reloaded, you can test if the pre-rendering middleware is working:

1. Open your terminal or console.
2. Run the following curl command to emulate Googlebot crawling your page:
   ```bash
   curl -A "Googlebot" https://lurnstack.com/
   ```
3. Check the response. It should return fully-formed static HTML containing text and metadata from the React components (such as course details or pricing tables) rather than the standard empty `<div id="root"></div>` React shell.
