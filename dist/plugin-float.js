var ARFPluginFloat = (function (exports) {
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

    // ==== Plugin Float (TypeScript) ====
    // Float quảng cáo có vị trí, auto-hide, iframe, animation fade in/out
    // Hỗ trợ nhiều float cùng vị trí (tự động xếp tầng)
    exports.Position = void 0;
    (function (Position) {
        Position["BOTTOM_LEFT"] = "bottom-left";
        Position["BOTTOM_RIGHT"] = "bottom-right";
        Position["BOTTOM_CENTER"] = "bottom-center";
        Position["TOP_LEFT"] = "top-left";
        Position["TOP_RIGHT"] = "top-right";
        Position["TOP_CENTER"] = "top-center";
        Position["CENTER_LEFT"] = "center-left";
        Position["CENTER_RIGHT"] = "center-right";
    })(exports.Position || (exports.Position = {}));
    window._arfPlugins = window._arfPlugins || {};
    window._arfPlugins.float = function ({ campaignId, creativeInfo, slotId, transactionId, eventContext, unit, userId, options, }) {
        if (!options)
            return;
        const opts = options;
        const closeButton = opts.closeButton !== false;
        const position = opts.position || exports.Position.BOTTOM_RIGHT;
        const zIndex = opts.zIndex || 999999;
        const autoHide = opts.autoHide;
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
        function createFloatFrame() {
            const iframe = document.createElement("iframe");
            iframe.src = "about:blank";
            // Đếm số float theo vị trí để xếp tầng
            window._arfFloatCount = window._arfFloatCount || {};
            const floatCount = window._arfFloatCount;
            const currentCount = floatCount[position] || 0;
            floatCount[position] = currentCount + 1;
            const gap = 4; // khoảng cách giữa các float
            const offset = currentCount * (floatHeight + gap);
            // Xác định vị trí
            let posStyle = "";
            switch (position) {
                case exports.Position.BOTTOM_LEFT:
                    posStyle = `bottom:${offset}px; left:0;`;
                    break;
                case exports.Position.BOTTOM_RIGHT:
                    posStyle = `bottom:${offset}px; right:0;`;
                    break;
                case exports.Position.BOTTOM_CENTER:
                    posStyle = `bottom:${offset}px; left:50%; transform: translateX(-50%);`;
                    break;
                case exports.Position.TOP_LEFT:
                    posStyle = `top:${offset}px; left:0;`;
                    break;
                case exports.Position.TOP_RIGHT:
                    posStyle = `top:${offset}px; right:0;`;
                    break;
                case exports.Position.TOP_CENTER:
                    posStyle = `top:${offset}px; left:50%; transform: translateX(-50%);`;
                    break;
                case exports.Position.CENTER_LEFT:
                    posStyle = `top:calc(50% + ${offset / 2}px); left:0; transform: translateY(-50%);`;
                    break;
                case exports.Position.CENTER_RIGHT:
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
            var _a;
            const floatFrame = createFloatFrame();
            const doc = floatFrame.contentDocument || ((_a = floatFrame.contentWindow) === null || _a === void 0 ? void 0 : _a.document);
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
        <script src="https://cdn.jsdelivr.net/gh/datcaoquoc/codecsdk@v1.0.5/dist/plugin-codeclogo.min.js"></script>
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
                const btn = doc.querySelector(".close-btn");
                const floatEl = doc.querySelector(".float");
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
                    window._arfFloatCount[position] = Math.max(0, (window._arfFloatCount[position] || 1) - 1);
                };
                if (btn)
                    btn.addEventListener("click", closeFloat);
                if (autoHide && floatEl)
                    setTimeout(closeFloat, autoHide * 1000);
            };
        }
        renderFloat();
    };

    return exports;

})({});
