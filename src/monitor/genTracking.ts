import { CreativeInfo, TrackingEventType } from "../type";

/**
 * SDK Tracking đơn giản — theo dõi view, click, ping, exit
 * Có thể dùng riêng hoặc tích hợp vào SDK chính.
 */
export class AdTracking {
  private endpoint =
    "http://113.161.103.134:8096/api/v1/tracking/events/codec.gif";
  // private pageLoadId: string;
  // private pingInterval?: number;
  // private pingTimer?: ReturnType<typeof setInterval>;

  constructor() {
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
  public _trackImpression(params: {
    creativeInfo: CreativeInfo;
    transactionId: string;
    context: string;
    userId: string;
    unit: string;
    campaignId: string,
    inventId: string
  }): void {
    const { campaignId, context, creativeInfo,inventId,transactionId,unit, userId } = params
    const data = {
      cr: creativeInfo?.creativeId,
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
   public _trackClickUrl(params: {
    creativeInfo: CreativeInfo;
    transactionId: string;
    context: string;
    userId: string;
    unit: string;
    campaignId: string,
    inventId: string,
    url: string
  }): String {
    const { campaignId, context, creativeInfo,inventId,transactionId,unit, userId, url } = params
    const data = {
      cr: creativeInfo?.creativeId,
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

    return beaconUrl
  }

  /**
   * Sinh UUID tạm
   */
  private uuid(): string {
    return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Encode object thành query string
   */
  private _encode(obj: Record<string, any>): string {
    return Object.entries(obj)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
  }
}

// Export global
(window as any).AdTracking = new AdTracking();
export {};
