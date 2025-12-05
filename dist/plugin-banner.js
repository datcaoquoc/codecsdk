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

    // ==== Plugin Banner (TypeScript) ====
    // Biến toàn cục để theo dõi refresh từng zone
    const refreshState = {};
    window._arfPlugins = window._arfPlugins || {};
    window._arfPlugins.banner = function ({ campaignId, creativeInfo, slotId, transactionId, eventContext, unit, userId, options }) {
        var _a, _b;
        // lấy vị trí quảng cáo cần render
        let container = document.getElementById(`slot-${slotId}`);
        // nếu k tìm thấy vị trí quảng cáo thì bỏ qua
        if (!container)
            return;
        // if (!container) {
        //   const currentScript = document.currentScript as HTMLScriptElement | null;
        //   container = document.createElement("div");
        //   container.id = `slot-${slotId}`;
        //   container.style.cssText = `
        //     width:${creativeInfo.width}px;
        //     height:${creativeInfo.height}px;
        //     margin:20px auto;
        //     text-align:center;
        //     border:1px solid #ccc;
        //   `;
        //   if (currentScript?.parentNode) {
        //     currentScript.parentNode.insertBefore(container, currentScript);
        //   } else {
        //     document.body.appendChild(container);
        //   }
        // }
        // Xóa nội dung cũ
        container.innerHTML = "";
        // khởi tạo iframe
        const iframe = document.createElement("iframe");
        iframe.width = creativeInfo.width.toString();
        iframe.height = creativeInfo.height.toString();
        iframe.frameBorder = "0";
        iframe.style.border = "none";
        container.appendChild(iframe);
        const doc = iframe.contentDocument || ((_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.document);
        if (!doc) {
            console.warn("[Plugin:Banner] Cannot access iframe document.");
            return;
        }
        // thêm qc vào iframe
        doc.open();
        const urlClick = new AdTracking()._trackClickUrl({
            campaignId: campaignId,
            context: eventContext,
            creativeInfo: creativeInfo,
            inventId: slotId,
            transactionId: transactionId,
            unit: unit,
            userId: userId,
            url: creativeInfo.ldp
        });
        doc.write(`
    <html>
      <head><style>body{margin:0;padding:0;overflow:hidden}</style></head>
      <body>
        <a href="${urlClick || "#"}" target="_blank"
           style="display:block;width:100%;height:100%;
           background:url('${creativeInfo === null || creativeInfo === void 0 ? void 0 : creativeInfo.content_url}') center/cover no-repeat;"></a>
        <script src="https://cdn.jsdelivr.net/gh/datcaoquoc/codecsdk@v1.0.8/dist/plugin-codeclogo.min.js"></script>
      </body>
    </html>
  `);
        doc.close();
        // theo dõi creative khi nào đc hiển thị
        trackWhenVisible({
            campaignId: campaignId,
            container: container,
            context: eventContext,
            creative: creativeInfo,
            slotId: slotId,
            transactionId: transactionId,
            unit: unit,
            userId: userId
        });
        console.log(`[Plugin:Banner] Rendered zone ${slotId}`);
        // === Refresh logic ===
        const opts = options || {};
        const refreshInterval = opts.refreshInterval || 30;
        // const refreshInterval = 5;
        const maxRefresh = opts.maxRefresh || 0;
        // Clear timer cũ nếu có
        if ((_b = refreshState[slotId]) === null || _b === void 0 ? void 0 : _b.timer) {
            clearTimeout(refreshState[slotId].timer);
        }
        // Lần render đầu tiên
        if (!refreshState[slotId]) {
            refreshState[slotId] = { count: 0 };
        }
        // Nếu chưa vượt quá số lần refresh
        if (refreshState[slotId].count < maxRefresh) {
            console.log(`[Plugin:Banner] Zone ${slotId} sẽ refresh sau ${refreshInterval}s (Lần ${refreshState[slotId].count + 1}/${maxRefresh})`);
            const timer = setTimeout(() => {
                refreshState[slotId].count += 1;
                console.log(`[Plugin:Banner] Refreshing zone ${slotId}...`);
                if (window._arfQueue && window._arfProcessQueue) {
                    window._arfQueue.push({ zone: slotId });
                    window._arfProcessQueue();
                }
                else {
                    console.warn("[Plugin:Banner] Không tìm thấy _arfQueue hoặc _arfProcessQueue");
                }
            }, refreshInterval * 1000);
            refreshState[slotId].timer = timer;
        }
        else {
            console.log(`[Plugin:Banner] Zone ${slotId} đã đạt giới hạn refresh.`);
        }
    };
    // theo dõi và tracking sự kiện impression khi quảng cáo hiển thị > 50% trên viewport
    function trackWhenVisible(params) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    console.log(`[Tracking] Banner visible 50%+ => send impression`);
                    new AdTracking()._trackImpression({
                        campaignId: params.campaignId,
                        context: params.context,
                        creativeInfo: params.creative,
                        inventId: params.slotId,
                        transactionId: params.transactionId,
                        unit: params.unit,
                        userId: params.userId
                    });
                    obs.disconnect(); // chỉ gửi 1 lần
                }
            });
        }, { threshold: [0.5] } // tối thiểu 50% banner xuất hiện
        );
        observer.observe(params.container);
    }

})();
