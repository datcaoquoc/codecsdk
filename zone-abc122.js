(function () {
  console.log("[Zone] zone-abc123.js loaded");

  const SDK_URL = "https://cdn.example.com/sdk/main-sdk.js";
  const ZONE_ID = "INV_OUT_2511050001";
  

  // Bước 1: xác định vị trí thẻ script hiện tại
  const currentScript = document.currentScript;

  // Bước 2: tạo container ngay trước script này
  const container = document.createElement("div");
  container.id = `slot-${ZONE_ID}`;
  container.style = "width:100%;display:block;";
  currentScript.parentNode.insertBefore(container, currentScript);

  // Bước 3: đảm bảo có queue
  window._arfQueue = window._arfQueue || [];

  // Bước 4: push zone vào queue
  window._arfQueue.push({
    zone: ZONE_ID,
    opts: { publisher: "demo", format: "auto" },
  });
  console.log("[Zone] pushed to queue", ZONE_ID);

  // Bước 5: nếu SDK chưa có, tự tải
  function loadScript(src, cb) {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = cb;
    document.head.appendChild(s);
  }

  if (typeof window.__arf_sdk_loaded__ === "undefined") {
    console.log("[Zone] SDK not found, loading main...");
    loadScript(SDK_URL, () => {
      console.log("[Zone] SDK main loaded.");
    });
  } else {
    console.log("[Zone] SDK already loaded.");
    // Nếu SDK đã có → xử lý queue ngay
    if (typeof window._arfProcessQueue === "function") {
      window._arfProcessQueue();
    }
  }
})();
