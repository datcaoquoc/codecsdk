export interface PageInfo {
  url: string;
  ref: string | null;
}

export interface SlotInfo {
  id: string;
}

export interface DeviceInfo {
  type: "desktop" | "mobile" | "tablet";
  os: string;
  ua: string;
  language: string;
  screen: {
    width: number;
    height: number;
  };
  viewport: {
    width: number;
    height: number;
    dpr: number;
  };
}

export interface Payload {
  page: PageInfo;
  slot: SlotInfo;
  device: DeviceInfo;
  userId: string;
}

export class EnvCollector {
    /**
   * Lấy hoặc tạo mới user ID để dùng cho frequency cap
   * Tạo UUIDv4 nếu chưa tồn tại và lưu trong cookie an toàn
   */
  static _getUserId(cookieName = "codec_user_id") {
    // Hàm lấy cookie
    const _getCookie = (name: string) => {
      const match = document.cookie.match(
        new RegExp("(^| )" + name + "=([^;]+)")
      );
      return match ? decodeURIComponent(match[2]) : null;
    };

    // Hàm set cookie
    const _setCookie = (name: string, value: string, days = 365) => {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(
        value
      )}; expires=${expires}; path=/; Secure; SameSite=Lax`;
    };

    // Lấy userId hiện có
    let userId = _getCookie(cookieName);

    // Nếu chưa có thì tạo mới
    if (!userId) {
      userId = this._generateUUIDv4();
      _setCookie(cookieName, userId);
      console.log("[MyAdSDK] New user_id created:", userId);
    } else {
      console.log("[MyAdSDK] Existing user_id:", userId);
    }

    return userId;
  }

    static _generateUUIDv4(): string {
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
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
      12,
      16
    )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  /** Lấy hệ điều hành */
  static _getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes("Win")) return "Windows";
    if (ua.includes("Mac")) return "MacOS";
    if (ua.includes("Linux")) return "Linux";
    if (/Android/i.test(ua)) return "Android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
    return "Unknown";
  }

  /** Xác định loại thiết bị */
  static _getDeviceType(): "desktop" | "mobile" | "tablet" {
    const ua = navigator.userAgent;
    if (/Mobi|Android/i.test(ua)) return "mobile";
    if (/Tablet|iPad/i.test(ua)) return "tablet";
    return "desktop";
  }

  /** Lấy thông tin thiết bị */
  static _getDeviceInfo(): DeviceInfo {
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
  static _getPageInfo(): PageInfo {
    return {
      url: window.location.href,
      ref: document.referrer || null,
    };
  }

  /** Tạo payload hoàn chỉnh */
  static _getPayload(slot: SlotInfo): Payload {
    return {
      page: this._getPageInfo(),
      slot,
      device: this._getDeviceInfo(),
      userId: this._getUserId(),
    };
  }
}
