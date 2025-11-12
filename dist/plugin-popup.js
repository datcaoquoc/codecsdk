(function () {
    'use strict';

    var SlotType;
    (function (SlotType) {
        SlotType["BANNER"] = "banner";
        SlotType["NATIVE"] = "native";
        SlotType["VIDEO"] = "video";
        SlotType["POPUP"] = "popup";
        SlotType["FLOAT"] = "float";
    })(SlotType || (SlotType = {}));
    var TriggerType;
    (function (TriggerType) {
        TriggerType["ON_LOAD"] = "on_load";
        TriggerType["ON_DELAY"] = "delay";
        TriggerType["ON_SCROLL"] = "scroll";
        TriggerType["ON_CLICK"] = "click";
        TriggerType["ON_INACTIVITY"] = "inactivity";
    })(TriggerType || (TriggerType = {}));
    var Position;
    (function (Position) {
        Position["BOTTOM_LEFT"] = "bottom-left";
        Position["BOTTOM_RIGHT"] = "bottom-right";
        Position["BOTTOM_CENTER"] = "bottom-center";
        Position["TOP_LEFT"] = "top-left";
        Position["TOP_RIGHT"] = "top-right";
        Position["TOP_CENTER"] = "top-center";
        Position["CENTER_LEFT"] = "center-left";
        Position["CENTER_RIGHT"] = "center-right";
    })(Position || (Position = {}));
    var TrackingEventType;
    (function (TrackingEventType) {
        // Common
        TrackingEventType["IMPRESSION"] = "impression";
        TrackingEventType["CLICK"] = "click";
        TrackingEventType["ERROR"] = "error";
    })(TrackingEventType || (TrackingEventType = {}));

    /**
     * SDK Tracking đơn giản — theo dõi view, click, ping, exit
     * Có thể dùng riêng hoặc tích hợp vào SDK chính.
     */
    class AdTracking {
        // private pageLoadId: string;
        // private pingInterval?: number;
        // private pingTimer?: ReturnType<typeof setInterval>;
        constructor() {
            this.endpoint = "http://113.161.103.134:8096/api/v1/tracking/events/codec.gif";
            // this.pageLoadId = this.uuid();
            // this.startPing();
            // this.setupExitTracking();
        }
        /**
         * Gửi event tracking cơ bản (impression, click, view...)
         */
        /**
         * Tự động gửi ping mỗi 30s để đo thời gian ở lại trang
         */
        // private startPing(intervalMs: number = 30000): void {
        //   this.pingInterval = intervalMs;
        //   this.pingTimer = setInterval(() => {
        //     this.track({ event: "ping" });
        //   }, intervalMs);
        // }
        /**
         * Theo dõi sự kiện rời trang (beforeunload)
         */
        // private setupExitTracking(): void {
        //   window.addEventListener("beforeunload", () => {
        //     this.track({ event: "exit",  });
        //   });
        // }
        /**
         * Gửi tracking impression (hiển thị quảng cáo)
         */
        _trackImpression(params) {
            const { campaignId, context, creativeInfo, inventId, transactionId, unit, userId } = params;
            const data = {
                cr: creativeInfo === null || creativeInfo === void 0 ? void 0 : creativeInfo.creativeId,
                ad_type: "OUTSTREAM",
                event: TrackingEventType.IMPRESSION,
                transaction_id: transactionId,
                ev_context: context,
                user_id: userId,
                unit: unit,
                cp: campaignId,
                iv: inventId
            };
            const query = this._encode(data);
            const beaconUrl = `${this.endpoint}?${query}`;
            // Gửi bằng image pixel
            const img = new Image();
            img.src = beaconUrl;
        }
        /**
         * Gửi tracking click
         */
        _trackClickUrl(params) {
            const { campaignId, context, creativeInfo, inventId, transactionId, unit, userId, url } = params;
            const data = {
                cr: creativeInfo === null || creativeInfo === void 0 ? void 0 : creativeInfo.creativeId,
                ad_type: "OUTSTREAM",
                event: TrackingEventType.CLICK,
                transaction_id: transactionId,
                ev_context: context,
                user_id: userId,
                unit: unit,
                cp: campaignId,
                iv: inventId,
                url: url
            };
            const query = this._encode(data);
            const beaconUrl = `${this.endpoint}?${query}`;
            return beaconUrl;
        }
        /**
         * Sinh UUID tạm
         */
        uuid() {
            return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                const v = c === "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
        }
        /**
         * Encode object thành query string
         */
        _encode(obj) {
            return Object.entries(obj)
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
                .join("&");
        }
    }
    // Export global
    window.AdTracking = new AdTracking();

    // ==== Plugin Popup (TypeScript) ====
    // Phiên bản: popup trong iframe + animation đóng mượt + nút đóng trắng nền đen
    window._arfPlugins = window._arfPlugins || {};
    window._arfPlugins.popup = function ({ campaignId, creativeInfo, slotId, transactionId, eventContext, unit, userId, options, }) {
        if (!options)
            return;
        const opts = options;
        const trigger = opts.trigger;
        const triggerTime = opts.triggerTime || 5;
        const closeButton = opts.closeButton !== false;
        const overlayEnabled = opts.overlay !== false;
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
        function createPopupFrame() {
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
            var _a;
            const popupFrame = createPopupFrame();
            const doc = popupFrame.contentDocument || ((_a = popupFrame.contentWindow) === null || _a === void 0 ? void 0 : _a.document);
            if (!doc)
                return;
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
              background: url('${creativeInfo.content_url}') center/cover no-repeat;
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
                const btn = doc.querySelector(".close-btn");
                const popupEl = doc.querySelector(".popup");
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
                if (btn)
                    btn.addEventListener("click", closePopup);
                if (overlayEnabled) {
                    doc.body.addEventListener("click", (e) => {
                        if (e.target === doc.body)
                            closePopup();
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
                const onScroll = (ev) => {
                    const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
                    if (scrollPercent >= 0.5) {
                        renderPopup();
                        window.removeEventListener("scroll", onScroll);
                    }
                };
                window.addEventListener("scroll", onScroll);
                break;
            case TriggerType.ON_CLICK:
                if (opts.selector) {
                    const el = document.querySelector(opts.selector);
                    if (el) {
                        el.addEventListener("click", renderPopup);
                    }
                    else {
                        console.warn(`[Plugin:Popup] Không tìm thấy selector ${opts.selector}`);
                    }
                }
                break;
            case TriggerType.ON_INACTIVITY:
                let timer;
                const resetTimer = () => {
                    clearTimeout(timer);
                    timer = setTimeout(renderPopup, triggerTime * 1000);
                };
                ["mousemove", "keydown", "scroll", "click"].forEach((evt) => window.addEventListener(evt, resetTimer));
                resetTimer();
                break;
            default:
                console.warn(`[Plugin:Popup] Không có trigger hợp lệ cho popup ${slotId}`);
                break;
        }
        console.log(`[Plugin:Popup] Popup ${slotId} đăng ký trigger "${trigger}".`);
    };

})();
