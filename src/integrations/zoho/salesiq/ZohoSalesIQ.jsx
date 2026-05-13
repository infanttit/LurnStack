import { useEffect } from "react";

const ZOHO_WIDGET_ID = "zsiqscript";
const ZOHO_WIDGET_SRC =
  "https://salesiq.zohopublic.in/widget?wc=siqe923bf08b083df4ddc71138e82619b5e2935e288679670e823a585b6adae4114";

function ensureZohoGlobal() {
  if (typeof window === "undefined") return;
  window.$zoho = window.$zoho || {};
  window.$zoho.salesiq =
    window.$zoho.salesiq ||
    ({
      ready: function ready() {},
    });
}

function loadZohoScript() {
  if (typeof document === "undefined") return;
  if (document.getElementById(ZOHO_WIDGET_ID)) return;

  const script = document.createElement("script");
  script.id = ZOHO_WIDGET_ID;
  script.src = ZOHO_WIDGET_SRC;
  script.defer = true;
  document.body.appendChild(script);
}

export default function ZohoSalesIQ() {
  useEffect(() => {
    ensureZohoGlobal();
    loadZohoScript();
  }, []);

  return null;
}

