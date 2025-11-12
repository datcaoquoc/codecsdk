// ==== Plugin Popup (TypeScript) ====
// Phiên bản: popup trong iframe + animation đóng mượt + nút đóng trắng nền đen

import { AdTracking } from "../monitor/genTracking";
import { PluginParams, TriggerType } from "../type";

(window as any)._arfPlugins = (window as any)._arfPlugins || {};

(window as any)._arfPlugins.popup = function ({
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
  const trigger: TriggerType = opts.trigger;
  const triggerTime: number = opts.triggerTime || 5;
  const closeButton: boolean = opts.closeButton !== false;
  const overlayEnabled: boolean = opts.overlay !== false;

  // parse kích thước popup
  let popupWidth = creativeInfo.width || 400;
  let popupHeight = creativeInfo.height || 300;
  if (opts.size && typeof opts.size === "string") {
    const [w, h] = opts.size.split("x").map(Number);
    if (w && h) {
      popupWidth = w;
      popupHeight = h;
    }
  }

  /** === Tạo iframe chứa popup === */
  function createPopupFrame(): HTMLIFrameElement {
    const iframe = document.createElement("iframe");
    iframe.src = "about:blank";
    iframe.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      border: none;
      z-index: 999999;
      background: transparent;
      display: block;
    `;
    document.body.appendChild(iframe);
    return iframe;
  }

  /** === Render popup bên trong iframe === */
  function renderPopup() {
    const popupFrame = createPopupFrame();
    const doc =
      popupFrame.contentDocument || popupFrame.contentWindow?.document;
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
              background: ${overlayEnabled ? "rgba(0,0,0,0.5)" : "transparent"};
              display: flex;
              justify-content: center;
              align-items: center;
              animation: fadeIn 0.3s ease forwards;
              font-family: sans-serif;
            }

            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }

            @keyframes scaleIn {
              from { transform: scale(0.8); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            @keyframes scaleOut {
              from { transform: scale(1); opacity: 1; }
              to { transform: scale(0.8); opacity: 0; }
            }

            .popup {
              width: ${popupWidth}px;
              height: ${popupHeight}px;
              background: #fff;
              overflow: hidden;
              box-shadow: 0 5px 30px rgba(0,0,0,0.3);
              position: relative;
              animation: scaleIn 0.3s ease forwards;
            }

            .popup.closing {
              animation: scaleOut 0.3s ease forwards;
            }

            .close-btn {
                  position: absolute;
    top: 4px;
    right: 4px;
    width: 26px;
    height: 26px;
    line-height: 28px;
    text-align: center;
    font-size: 22px;
    color: #fff;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 10%;
    cursor: pointer;
    z-index: 10;
    transition: background 0.2s 
ease;
            }

            .close-btn:hover {
              background: rgba(0, 0, 0, 0.85);
            }

            a.banner {
              display: block;
              width: 100%;
              height: 100%;
              background: url('${
                creativeInfo.content_url
              }') center/cover no-repeat;
            }
          </style>
        </head>
        <body>
          <div class="popup">
            ${closeButton ? `<div class="close-btn">&times;</div>` : ""}
            <a class="banner" href="${clickUrl}" target="_blank"></a>
          </div>
        </body>
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

    popupFrame.onload = () => {
      const btn = doc.querySelector(".close-btn") as HTMLElement | null;
      const popupEl = doc.querySelector(".popup") as HTMLElement | null;

      // 🧭 Hàm đóng popup có animation
      const closePopup = () => {
        if (!popupEl) {
          document.body.removeChild(popupFrame);
          return;
        }

        popupEl.classList.add("closing");
        doc.body.style.animation = "fadeOut 0.3s ease forwards";

        setTimeout(() => {
          document.body.removeChild(popupFrame);
          console.log(`[Plugin:Popup] Đã đóng popup ${slotId}`);
        }, 300);
      };

      if (btn) btn.addEventListener("click", closePopup);

      if (overlayEnabled) {
        doc.body.addEventListener("click", (e) => {
          if (e.target === doc.body) closePopup();
        });
      }
    };
  }

  /** === Trigger logic === */
  switch (trigger) {
    case TriggerType.ON_LOAD:
      window.addEventListener("load", () => renderPopup());
      break;

    case TriggerType.ON_DELAY:
      setTimeout(renderPopup, triggerTime * 1000);
      break;

    case TriggerType.ON_SCROLL:
      const onScroll = (ev: Event) => {
        const scrollPercent =
          (window.scrollY + window.innerHeight) / document.body.scrollHeight;
        if (scrollPercent >= 0.5) {
          renderPopup();
          window.removeEventListener("scroll", onScroll);
        }
      };
      window.addEventListener("scroll", onScroll);
      break;

    case TriggerType.ON_CLICK:
      if ((opts as any).selector) {
        const el = document.querySelector((opts as any).selector);
        if (el) {
          el.addEventListener("click", renderPopup);
        } else {
          console.warn(
            `[Plugin:Popup] Không tìm thấy selector ${(opts as any).selector}`
          );
        }
      }
      break;

    case TriggerType.ON_INACTIVITY:
      let timer: ReturnType<typeof setTimeout>;
      const resetTimer = () => {
        clearTimeout(timer);
        timer = setTimeout(renderPopup, triggerTime * 1000);
      };
      ["mousemove", "keydown", "scroll", "click"].forEach((evt) =>
        window.addEventListener(evt, resetTimer)
      );
      resetTimer();
      break;

    default:
      console.warn(
        `[Plugin:Popup] Không có trigger hợp lệ cho popup ${slotId}`
      );
      break;
  }

  console.log(`[Plugin:Popup] Popup ${slotId} đăng ký trigger "${trigger}".`);
};

export {};
