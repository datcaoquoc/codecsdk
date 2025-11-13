(function () {
    'use strict';

    // hàm so sánh domain
    function _isSameDomain(urlPage, urliv) {
        // Hàm chuẩn hoá để chỉ lấy domain gốc
        const normalizeDomain = (input) => {
            if (!input)
                return null;
            try {
                // Nếu thiếu protocol thì thêm vào để URL constructor hoạt động
                if (!/^https?:\/\//i.test(input)) {
                    input = 'https://' + input;
                }
                const u = new URL(input);
                return u.hostname.replace(/^www\./, '').toLowerCase();
            }
            catch (_a) {
                return null;
            }
        };
        const d1 = normalizeDomain(urlPage);
        const d2 = normalizeDomain(urliv);
        return d1 !== null && d1 === d2;
    }

    class EnvCollector {
        /**
       * Lấy hoặc tạo mới user ID để dùng cho frequency cap
       * Tạo UUIDv4 nếu chưa tồn tại và lưu trong cookie an toàn
       */
        static _getUserId(cookieName = "codec_user_id") {
            // Hàm lấy cookie
            const _getCookie = (name) => {
                const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
                return match ? decodeURIComponent(match[2]) : null;
            };
            // Hàm set cookie
            const _setCookie = (name, value, days = 365) => {
                const expires = new Date(Date.now() + days * 864e5).toUTCString();
                document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; Secure; SameSite=Lax`;
            };
            // Lấy userId hiện có
            let userId = _getCookie(cookieName);
            // Nếu chưa có thì tạo mới
            if (!userId) {
                userId = this._generateUUIDv4();
                _setCookie(cookieName, userId);
                console.log("[MyAdSDK] New user_id created:", userId);
            }
            else {
                console.log("[MyAdSDK] Existing user_id:", userId);
            }
            return userId;
        }
        static _generateUUIDv4() {
            if (typeof crypto !== "undefined" && crypto.randomUUID) {
                // Trình duyệt hiện đại có hỗ trợ sẵn
                return crypto.randomUUID();
            }
            // Trình duyệt cũ hơn — fallback tự sinh đúng chuẩn RFC4122
            const bytes = crypto.getRandomValues(new Uint8Array(16));
            // Đảm bảo các bit version và variant đúng chuẩn
            bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
            bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xxxxxx
            const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
            return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
        }
        /** Lấy hệ điều hành */
        static _getOS() {
            const ua = navigator.userAgent;
            if (ua.includes("Win"))
                return "Windows";
            if (ua.includes("Mac"))
                return "MacOS";
            if (ua.includes("Linux"))
                return "Linux";
            if (/Android/i.test(ua))
                return "Android";
            if (/iPhone|iPad|iPod/i.test(ua))
                return "iOS";
            return "Unknown";
        }
        /** Xác định loại thiết bị */
        static _getDeviceType() {
            const ua = navigator.userAgent;
            if (/Mobi|Android/i.test(ua))
                return "mobile";
            if (/Tablet|iPad/i.test(ua))
                return "tablet";
            return "desktop";
        }
        /** Lấy thông tin thiết bị */
        static _getDeviceInfo() {
            return {
                type: this._getDeviceType(),
                os: this._getOS(),
                ua: navigator.userAgent,
                language: navigator.language,
                screen: {
                    width: window.screen.width,
                    height: window.screen.height,
                },
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    dpr: window.devicePixelRatio || 1,
                },
            };
        }
        /** Lấy thông tin trang */
        static _getPageInfo() {
            return {
                url: window.location.href,
                ref: document.referrer || null,
            };
        }
        /** Tạo payload hoàn chỉnh */
        static _getPayload(slot) {
            return {
                page: this._getPageInfo(),
                slot,
                device: this._getDeviceInfo(),
                userId: this._getUserId(),
            };
        }
    }

    (function (window, document) {
        console.log("[SDK] main-sdk.ts loaded");
        // Biến toàn cục
        window.__arf_sdk_loaded__ = true;
        window._arfQueue = window._arfQueue || [];
        window._arfPlugins = window._arfPlugins || {};
        // Helper: Load plugin nếu chưa có
        function _ensurePlugin(type, callback) {
            if (window._arfPlugins[type]) {
                callback();
                return;
            }
            const s = document.createElement("script");
            s.src = `https://cdn.jsdelivr.net/gh/datcaoquoc/codecsdk@v1.0.3/dist/plugin-${type}.min.js`; // Có thể thay bằng CDN
            s.async = true;
            s.onload = () => {
                console.log(`[SDK] Plugin '${type}' loaded`);
                callback();
            };
            s.onerror = () => console.error(`[SDK] Failed to load plugin ${type}`);
            document.head.appendChild(s);
        }
        // Xử lý Queue
        function _processQueue() {
            const queue = window._arfQueue;
            if (!queue.length)
                return;
            console.log("[SDK] Processing queue...");
            let job;
            while ((job = queue.shift())) {
                _renderZone({
                    _device: job.device,
                    _domain: job.domain,
                    _zone: job.zone
                });
            }
        }
        async function _requestAd(zone) {
            var _a;
            console.log("[SDK] → Gọi API lấy quảng cáo...");
            const payload = EnvCollector._getPayload({
                id: zone
            });
            try {
                const res = await fetch("http://113.161.103.134:8097/api/v1/ad-sever/ads/inventory/outstream/creative-v2", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "*/*",
                        "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
                    },
                    body: JSON.stringify(payload),
                });
                const json = await res.json();
                console.log("[SDK] ← Response:", json);
                if (json.success && json.code === 201 && ((_a = json.data) === null || _a === void 0 ? void 0 : _a.src)) {
                    const script = document.createElement("script");
                    script.text = json.data.src;
                    document.head.appendChild(script);
                    script.remove();
                    console.log("[SDK] ✅ Đã thực thi script callback");
                }
                else {
                    console.warn("[SDK] ⚠️ Không có data.src hợp lệ trong response");
                }
            }
            catch (err) {
                console.error("[SDK] ❌ Lỗi khi gọi adserver:", err);
            }
        }
        // Callback từ SSP
        window.sspcallback = function (payload) {
            var _a, _b;
            console.log("[SDK] sspcallback() data:", payload);
            //* hiện tại ad sever chỉ trả về 1 campaign và 1 creative để phát quảng cáo cho 1 slot nên lấy quảng cáo như này
            //* nếu sau đổi luồng => 1 slot gọi về ad sever để lấy quảng cáo => trả về nhiều campaign + nhiều creative cho sdk tự chọn thì viết hàm xử lý tại đây là đc
            const campaign = (_a = payload.data) === null || _a === void 0 ? void 0 : _a[0];
            const creative = (_b = campaign === null || campaign === void 0 ? void 0 : campaign.creatives) === null || _b === void 0 ? void 0 : _b[0];
            // nếu k phân biệt được type thì k hiển thị qc nữa
            if (!payload.formatType)
                throw new Error("lỗi k có format");
            if (!creative) {
                console.warn("[SDK] No ad creative found in payload");
                return;
            }
            // kiểm tra format và tải plugin tương ứng
            _ensurePlugin(payload.formatType, () => {
                const pluginFn = window._arfPlugins[payload.formatType];
                if (typeof pluginFn === "function") {
                    pluginFn({
                        campaignId: campaign.campaignId,
                        creativeInfo: creative,
                        slotId: payload === null || payload === void 0 ? void 0 : payload.slotId,
                        transactionId: payload === null || payload === void 0 ? void 0 : payload.transactionId,
                        eventContext: payload === null || payload === void 0 ? void 0 : payload.eventContext,
                        unit: payload.unit,
                        userId: payload.userId,
                        options: payload.ext.options
                    });
                }
                else {
                    console.warn(`[SDK] Plugin '${payload.formatType}' không khả dụng.`);
                }
            });
        };
        // Render Zone
        function _renderZone(params) {
            const _deviceType = EnvCollector._getDeviceType();
            const _pageInfo = EnvCollector._getPageInfo();
            console.log("params", params);
            // nếu khác device
            if (_deviceType.toLocaleLowerCase() !== params._device.toLocaleLowerCase())
                return;
            // so sánh domain
            if (!_isSameDomain(_pageInfo.url, params._domain))
                return;
            _requestAd(params._zone);
        }
        // Chạy queue ban đầu
        _processQueue();
        // Theo dõi thêm zone mới (nếu load sau)
        const observer = new MutationObserver(_processQueue);
        observer.observe(document.documentElement, { childList: true, subtree: true });
        // Expose global
        window._arfProcessQueue = _processQueue;
    })(window, document);

})();
