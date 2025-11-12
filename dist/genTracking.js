var ARFGenTracking = (function (exports) {
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

    exports.AdTracking = AdTracking;

    return exports;

})({});
