import { EnvCollector } from "./monitor/collector";
import { AdSeverResponse, CreativeInfo, PluginParams } from "./type";

(function (window: Window & typeof globalThis, document: Document) {
  console.log("[SDK] main-sdk.ts loaded");
  interface QueueJob {
    zone: string;
    opts?: Record<string, unknown>;
  }

  type PluginFn = (params: { ad: CreativeInfo; zoneId: string }) => void;

  // ==== Biến toàn cục ====
  (window as any).__arf_sdk_loaded__ = true;
  (window as any)._arfQueue = (window as any)._arfQueue || ([] as QueueJob[]);
  (window as any)._arfPlugins = (window as any)._arfPlugins || ({} as Record<string, PluginFn>);

  // ==== Helper: Load plugin nếu chưa có ====
  function _ensurePlugin(type: string, callback: () => void): void {
    if ((window as any)._arfPlugins[type]) {
      callback();
      return;
    }

    const s = document.createElement("script");
    s.src = `https://cdn.jsdelivr.net/gh/datcaoquoc/codecsdk@v1.0.2/dist/plugin-${type}.min.js`; // Có thể thay bằng CDN
    s.async = true;

    s.onload = () => {
      console.log(`[SDK] Plugin '${type}' loaded`);
      callback();
    };

    s.onerror = () => console.error(`[SDK] Failed to load plugin ${type}`);
    document.head.appendChild(s);
  }

  // ==== Xử lý Queue ====
  function _processQueue(): void {
    const queue = (window as any)._arfQueue as QueueJob[];
    if (!queue.length) return;
    console.log("[SDK] Processing queue...");

    let job: QueueJob | undefined;
    while ((job = queue.shift())) {
      _renderZone(job.zone, job.opts);
    }
  }

async function requestAd(zone: string): Promise<void> {
  console.log("[SDK] → Gọi API lấy quảng cáo...");

  const payload = EnvCollector._getPayload({
    id: zone
  })

  // const payload = {
  //   page: {
  //     url: "http://localhost:8080/vi",
  //     ref: null,
  //   },
  //   slot: {
  //     id: zone
  //   },
  //   device: {
  //     type: "desktop",
  //     os: "Windows",
  //     ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  //     language: "en-US",
  //     screen: {
  //       width: 300,
  //       height: 600,
  //     },
  //     viewport: {
  //       width: 300,
  //       height: 600,
  //       dpr: 1.25,
  //     },
  //   },
  //   userId: "5d5ca189-d5b7-4609-b116-4288ef155219",
  // };

  try {
    const res = await fetch(
      "http://113.161.103.134:8097/api/v1/ad-sever/ads/inventory/outstream/creative-v2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
        },
        body: JSON.stringify(payload),
      }
    );

    const json = await res.json();
    console.log("[SDK] ← Response:", json);

    if (json.success && json.code === 201 && json.data?.src) {
      const script = document.createElement("script");
      script.text = json.data.src;
      document.head.appendChild(script);
      script.remove();
      console.log("[SDK] ✅ Đã thực thi script callback");
    } else {
      console.warn("[SDK] ⚠️ Không có data.src hợp lệ trong response");
    }
  } catch (err) {
    console.error("[SDK] ❌ Lỗi khi gọi adserver:", err);
  }
}

  // ==== Callback từ SSP ====
  (window as any).sspcallback = function (payload: AdSeverResponse): void {
    console.log("[SDK] sspcallback() data:", payload);
    
    //* hiện tại ad sever chỉ trả về 1 campaign và 1 creative để phát quảng cáo cho 1 slot nên lấy quảng cáo như này
    //* nếu sau đổi luồng => 1 slot gọi về ad sever để lấy quảng cáo => trả về nhiều campaign + nhiều creative cho sdk tự chọn thì viết hàm xử lý tại đây là đc
    const campaign = payload.data?.[0];
    const creative = campaign?.creatives?.[0];

    // nếu k phân biệt được type thì k hiển thị qc nữa
    if(!payload.formatType) throw new Error("lỗi k có format")

    if (!creative) {
      console.warn("[SDK] No ad creative found in payload");
      return;
    }

    // kiểm tra format và tải plugin tương ứng
    _ensurePlugin(payload.formatType, () => {
      const pluginFn = (window as any)._arfPlugins[payload.formatType];
      if (typeof pluginFn === "function") {
        pluginFn({ 
          campaignId: campaign.campaignId,
          creativeInfo: creative,
          slotId: payload?.slotId,
          transactionId: payload?.transactionId,
          eventContext: payload?.eventContext,
          unit: payload.unit,
          userId: payload.userId,
          options: payload.ext.options
         } as PluginParams);
      } else {
        console.warn(`[SDK] Plugin '${payload.formatType}' không khả dụng.`);
      }
    });
  };

  // ==== Render Zone ====
  function _renderZone(zone: string, opts?: Record<string, unknown>): void {
    requestAd(zone);
  }

  // ==== Chạy queue ban đầu ====
  _processQueue();

  // ==== Theo dõi thêm zone mới (nếu load sau) ====
  const observer = new MutationObserver(_processQueue);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // ==== Expose global ====
  (window as any)._arfProcessQueue = _processQueue;
})(window, document);
