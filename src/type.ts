export interface AdSeverResponse {
  slotId: string;
  formatType: SlotType;
  transactionId: string;
  eventContext: string;
  unit: string,
  userId: string
  data: Datum[];
  ext: BidExt;
}

export enum SlotType {
  BANNER = "banner",
  NATIVE = "native",
  VIDEO = "video",
  POPUP = "popup",
  FLOAT = "float",
}

interface Datum {
  campaignId: string;
  creatives: CreativeInfo[];
}

export interface CreativeInfo {
  creativeId: string;
  width: number;
  height: number;
  ldp: string;
  content_url: string;
}

// Bid Extension
export interface BidExt {
  options?: BannerOptions; // Tuỳ chọn banner custom
}

// Banner Options (tuỳ chọn mở rộng mà publisher/adserver định nghĩa)
export interface BannerOptions {
  type: SlotType; // loại quảng cáo
  refreshInterval?: number; // 0 => k refresh , 1 -> n => thời gian refresh (Banner)
  maxRefresh?: number; // số lần refresh tối đa (Banner)
  scrollPercent?: number; // số % scroll để kích hoạt sự kiện
  trigger: TriggerType; // loại trigger của popup, (POPUP)
  triggerTime: number; // kiểu number - đơn vị giây (POPUP)
  frequencyCap: number; // giới hạn hiển thị popup (POPUP)
  closeButton: boolean; // true: có, false : không (POPUP | FLOAT)
  size: string; // rộng x cao (ex: 1200x400) (POPUP)
  overlay: boolean; // Có hiển thị background che mờ không | true: có, false : không (POPUP)

  position: Position; // vị trí quảng cáo (FLOAT)
  zIndex: number; // độ ưu tiên hiển thị trên giao diện (1 -> N) (POPUP | FLOAT)

  autoHide: number; // thời gian tự động ẩn quảng cáo (FLOAT)
  draggable?: boolean; // cho phép kéo thả hay không (FLOAT)
}

export enum TriggerType {
  ON_LOAD = "on_load", // Hiển thị ngay khi trang vừa load.
  ON_DELAY = "delay", // Sau khi người dùng ở trên trang một khoảng thời gian.
  ON_SCROLL = "scroll", // Khi người dùng scroll đến một % nhất định của trang.
  ON_CLICK = "click", // Khi người dùng click vào một phần tử cụ thể (ví dụ: nút, link, hình).
  ON_INACTIVITY = "inactivity", // Khi người dùng không thao tác trong một khoảng thời gian.
}

export enum Position {
  BOTTOM_LEFT = "bottom-left", // Góc dưới bên trái
  BOTTOM_RIGHT = "bottom-right", // bóc dưới bên phải
  BOTTOM_CENTER = "bottom-center", // góc dưới ở giữa
  TOP_LEFT = "top-left", // góc trên bên trái
  TOP_RIGHT = "top-right", // góc trên bên phải
  TOP_CENTER = "top-center", // góc trên ở giữa
  CENTER_LEFT = "center-left", // ở giữa bên trái
  CENTER_RIGHT = "center-right", // ở giữa bên phải
}


export interface PluginParams {
  creativeInfo: CreativeInfo
  slotId: string
  campaignId: string
  transactionId: string
  eventContext: string;
  unit: string
  userId: string,
  options: BannerOptions
}

export enum TrackingEventType {
  // Common
  IMPRESSION = "impression",
  CLICK = "click",
  ERROR = "error"
}