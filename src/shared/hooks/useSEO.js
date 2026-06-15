import { useEffect } from "react";

const SITE_NAME = "LurnStack";
const BASE_URL = "https://lurnstack.com";

/**
 * useSEO — lightweight SEO hook, no extra packages required.
 *
 * @param {object} options
 * @param {string} options.title        
 * @param {string} options.description  
 * @param {string} [options.keywords]   
 * @param {string} [options.canonical] 
 * @param {string} [options.ogType]    
 */
export function useSEO({ title, description, keywords = "", canonical = "", ogType = "website" }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

    // ── Document title ──────────────────────────────────────────────────
    document.title = fullTitle;

    // ── Helper: upsert a <meta> tag ─────────────────────────────────────
    function setMeta(selector, attr, content) {
      if (!content) return;
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr.split("=")[0], attr.split("=")[1]);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    }

    // ── Helper: upsert a <link> tag ─────────────────────────────────────
    function setLink(rel, href) {
      let el = document.head.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    }

    // ── Standard meta ───────────────────────────────────────────────────
    setMeta('meta[name="description"]',   'name=description',   description);
    setMeta('meta[name="keywords"]',      'name=keywords',      keywords);
    setMeta('meta[name="robots"]',        'name=robots',        'index, follow');

    // ── Open Graph ──────────────────────────────────────────────────────
    setMeta('meta[property="og:title"]',       'property=og:title',       fullTitle);
    setMeta('meta[property="og:description"]', 'property=og:description', description);
    setMeta('meta[property="og:type"]',        'property=og:type',        ogType);
    setMeta('meta[property="og:url"]',         'property=og:url',         canonicalUrl);
    setMeta('meta[property="og:site_name"]',   'property=og:site_name',   SITE_NAME);

    // ── Twitter Card ────────────────────────────────────────────────────
    setMeta('meta[name="twitter:card"]',        'name=twitter:card',        'summary_large_image');
    setMeta('meta[name="twitter:title"]',       'name=twitter:title',       fullTitle);
    setMeta('meta[name="twitter:description"]', 'name=twitter:description', description);

    // ── Canonical link ──────────────────────────────────────────────────
    setLink("canonical", canonicalUrl);
  }, [title, description, keywords, canonical, ogType]);
}
