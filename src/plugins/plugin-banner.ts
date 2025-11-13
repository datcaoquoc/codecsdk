// ==== Plugin Banner (TypeScript) ====

import { AdTracking } from "../monitor/genTracking";
import { CreativeInfo, PluginParams } from "../type";

// Biến toàn cục để theo dõi refresh từng zone
const refreshState: Record<
  string,
  { count: number; timer?: ReturnType<typeof setTimeout> }
> = {};

(window as any)._arfPlugins = (window as any)._arfPlugins || {};

(window as any)._arfPlugins.banner = function ({
  campaignId, creativeInfo, slotId, transactionId, eventContext, unit, userId, options
}: PluginParams): void {

  // lấy vị trí quảng cáo cần render
  let container = document.getElementById(`slot-${slotId}`);

  // nếu k tìm thấy vị trí quảng cáo thì bỏ qua
  if(!container) return
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

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
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
})
  doc.write(`
    <html>
      <head><style>body{margin:0;padding:0;overflow:hidden}</style></head>
      <body>
        <a href="${urlClick || "#"}" target="_blank"
           style="display:block;width:100%;height:100%;
           background:url('${creativeInfo?.content_url}') center/cover no-repeat;"></a>
        <script src="https://cdn.jsdelivr.net/gh/datcaoquoc/codecsdk@v1.0.5/dist/plugin-codeclogo.min.js"></script>
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
  const refreshInterval = (opts.refreshInterval as number) || 30;
  // const refreshInterval = 5;
  const maxRefresh = (opts.maxRefresh as number) || 0;

  // Clear timer cũ nếu có
  if (refreshState[slotId]?.timer) {
    clearTimeout(refreshState[slotId].timer);
  }

  // Lần render đầu tiên
  if (!refreshState[slotId]) {
    refreshState[slotId] = { count: 0 };
  }

  // Nếu chưa vượt quá số lần refresh
  if (refreshState[slotId].count < maxRefresh) {
    console.log(
      `[Plugin:Banner] Zone ${slotId} sẽ refresh sau ${refreshInterval}s (Lần ${
        refreshState[slotId].count + 1
      }/${maxRefresh})`
    );

    const timer = setTimeout(() => {
      refreshState[slotId].count += 1;
      console.log(`[Plugin:Banner] Refreshing zone ${slotId}...`);

      if ((window as any)._arfQueue && (window as any)._arfProcessQueue) {
        (window as any)._arfQueue.push({ zone: slotId });
        (window as any)._arfProcessQueue();
      } else {
        console.warn(
          "[Plugin:Banner] Không tìm thấy _arfQueue hoặc _arfProcessQueue"
        );
      }
    }, refreshInterval * 1000);

    refreshState[slotId].timer = timer;
  } else {
    console.log(`[Plugin:Banner] Zone ${slotId} đã đạt giới hạn refresh.`);
  }
  
};

// theo dõi và tracking sự kiện impression khi quảng cáo hiển thị > 50% trên viewport
function trackWhenVisible(params: {container: HTMLElement, creative: CreativeInfo, slotId: string, campaignId: string, context: string, transactionId: string, unit: string, userId: string}) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
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
    },
    { threshold: [0.5] } // tối thiểu 50% banner xuất hiện
  );

  observer.observe(params.container);
}


export {};
