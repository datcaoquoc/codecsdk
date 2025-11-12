(function () {
  'use strict';

  (function (window, document) {
      console.log("[CodecLogoSDK] Loaded inside iframe");
      const logo = document.createElement("div");
      logo.className = "codec-logo";
      logo.innerHTML = `
    <div class="codec-logo" onclick="window.open('https://codecads.io', '_blank')">
    <span class="c-text">C</span>
    <span class="copy-text">Codec Ads Solution</span>
    </div>
  `;
      const style = document.createElement("style");
      style.textContent = `
    .codec-logo {
      position: absolute;
      bottom: 0;
      left: 0;
      z-index: 9999;
      cursor: pointer;
      background: #f5f5f5;
      padding: 4px 4px 1px 5px;
      display: inline-flex;
      align-items: center;
      border-top-right-radius: 8px;
      font-weight: 600;
      user-select: none;
      font-family: Arial, sans-serif;
    }
    .codec-logo .c-text {
      color: #fd7311;
      font-weight: 700;
      font-size: 16px;
    }
    .codec-logo .copy-text {
      white-space: nowrap;
      overflow: hidden;
      max-width: 0;
      opacity: 0;
      color: #666;
      font-weight: 300;
      transform: translateX(6px);
      transition: max-width 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
      font-size: 12px;
      margin-left: 3px;
    }
    .codec-logo:hover .copy-text {
      max-width: 300px;
      opacity: 1;
      margin-left: 5px;
      transform: translateX(0);
    }
  `;
      document.head.appendChild(style);
      document.body.appendChild(logo);
  })(window, document);

})();
