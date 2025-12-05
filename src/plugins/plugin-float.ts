// ==== Plugin Float (TypeScript) ====
// Float quảng cáo có vị trí, auto-hide, iframe, animation fade in/out
// Hỗ trợ nhiều float cùng vị trí (tự động xếp tầng)

import { AdTracking } from "../monitor/genTracking";
import { PluginParams } from "../type";

export enum Position {
  BOTTOM_LEFT = "bottom-left",
  BOTTOM_RIGHT = "bottom-right",
  BOTTOM_CENTER = "bottom-center",
  TOP_LEFT = "top-left",
  TOP_RIGHT = "top-right",
  TOP_CENTER = "top-center",
  CENTER_LEFT = "center-left",
  CENTER_RIGHT = "center-right",
}

(window as any)._arfPlugins = (window as any)._arfPlugins || {};

(window as any)._arfPlugins.float = function ({
  campaignId,
  creativeInfo,
  slotId,
  transactionId,
  eventContext,
  unit,
  userId,
  options,
}: PluginParams): void {
  if (!options) return;

  const opts = options;
  const closeButton: boolean = opts.closeButton !== false;
  const position: Position = opts.position || Position.BOTTOM_RIGHT;
  const zIndex: number = opts.zIndex || 999999;
  const autoHide: number | undefined = opts.autoHide;

  let floatWidth = creativeInfo.width || 300;
  let floatHeight = creativeInfo.height || 200;

  if (opts.size && typeof opts.size === "string") {
    const [w, h] = opts.size.split("x").map(Number);
    if (w && h) {
      floatWidth = w;
      floatHeight = h;
    }
  }

  /** === Tạo iframe chứa float === */
  function createFloatFrame(): HTMLIFrameElement {
    const iframe = document.createElement("iframe");
    iframe.src = "about:blank";

    // Đếm số float theo vị trí để xếp tầng
    (window as any)._arfFloatCount = (window as any)._arfFloatCount || {};
    const floatCount = (window as any)._arfFloatCount;
    const currentCount = floatCount[position] || 0;
    floatCount[position] = currentCount + 1;

    const gap = 4; // khoảng cách giữa các float
    const offset = currentCount * (floatHeight + gap);

    // Xác định vị trí
    let posStyle = "";
    switch (position) {
      case Position.BOTTOM_LEFT:
        posStyle = `bottom:${offset}px; left:0;`;
        break;
      case Position.BOTTOM_RIGHT:
        posStyle = `bottom:${offset}px; right:0;`;
        break;
      case Position.BOTTOM_CENTER:
        posStyle = `bottom:${offset}px; left:50%; transform: translateX(-50%);`;
        break;
      case Position.TOP_LEFT:
        posStyle = `top:${offset}px; left:0;`;
        break;
      case Position.TOP_RIGHT:
        posStyle = `top:${offset}px; right:0;`;
        break;
      case Position.TOP_CENTER:
        posStyle = `top:${offset}px; left:50%; transform: translateX(-50%);`;
        break;
      case Position.CENTER_LEFT:
        posStyle = `top:calc(50% + ${offset / 2}px); left:0; transform: translateY(-50%);`;
        break;
      case Position.CENTER_RIGHT:
        posStyle = `top:calc(50% + ${offset / 2}px); right:0; transform: translateY(-50%);`;
        break;
    }

    iframe.style.cssText = `
      position: fixed;
      ${posStyle}
      width: ${floatWidth}px;
      height: ${floatHeight}px;
      border: none;
      z-index: ${zIndex};
      background: transparent;
      transition: opacity 0.3s ease;
    `;

    document.body.appendChild(iframe);
    return iframe;
  }

  /** === Render float bên trong iframe === */
  function renderFloat() {
    const floatFrame = createFloatFrame();
    const doc = floatFrame.contentDocument || floatFrame.contentWindow?.document;
    if (!doc) return;

    const clickUrl = new AdTracking()._trackClickUrl({
      campaignId,
      context: eventContext,
      creativeInfo,
      inventId: slotId,
      transactionId,
      unit,
      userId,
      url: creativeInfo.ldp,
    });

    const html = `
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background: transparent;
              font-family: sans-serif;
            }

            .float {
              width: ${floatWidth}px;
              height: ${floatHeight}px;
              background: #fff;
              overflow: hidden;
              box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
              position: relative;
              opacity: 0;
              animation: fadeIn 0.4s ease forwards;
            }

            .float.closing {
              animation: fadeOut 0.4s ease forwards;
            }

            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            @keyframes fadeOut {
              from { opacity: 1; }
              to { opacity: 0; }
            }

            .close-btn {
              position: absolute;
              top: 4px;
              right: 4px;
              width: 26px;
              height: 26px;
              display: flex;
              justify-content: center;
              align-items: center;
              font-size: 22px;
              color: #fff;
              background: #000;
              border-radius: 6px;
              cursor: pointer;
              z-index: 10;
              transition: opacity 0.2s ease;
            }

            .close-btn:hover {
              opacity: 0.8;
            }

            a.banner {
              display: block;
              width: 100%;
              height: 100%;
              background: url('${creativeInfo.content_url}') center/cover no-repeat;
            }
          </style>
        </head>
        <body>
          <div class="float">
            ${closeButton ? `<div class="close-btn">&times;</div>` : ""}
            <a class="banner" href="${clickUrl}" target="_blank"></a>
          </div>
        </body>
        <script src="https://cdn.jsdelivr.net/gh/datcaoquoc/codecsdk@v1.0.9/dist/plugin-codeclogo.min.js"></script>
      </html>
    `;

    doc.open();
    doc.write(html);
    doc.close();

    new AdTracking()._trackImpression({
      campaignId,
      context: eventContext,
      creativeInfo,
      inventId: slotId,
      transactionId,
      unit,
      userId,
    });

    floatFrame.onload = () => {
      const btn = doc.querySelector(".close-btn") as HTMLElement | null;
      const floatEl = doc.querySelector(".float") as HTMLElement | null;

      const closeFloat = () => {
        if (!floatEl) {
          cleanup();
          return;
        }
        floatEl.classList.add("closing");
        setTimeout(() => {
          cleanup();
        }, 400);
      };

      const cleanup = () => {
        document.body.removeChild(floatFrame);
        (window as any)._arfFloatCount[position] = Math.max(
          0,
          ((window as any)._arfFloatCount[position] || 1) - 1
        );
      };

      if (btn) btn.addEventListener("click", closeFloat);
      if (autoHide && floatEl) setTimeout(closeFloat, autoHide * 1000);
    };
  }

  renderFloat();
};

export {};
