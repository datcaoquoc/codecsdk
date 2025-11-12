export interface AdSeverResponse {
    slotId: string;
    formatType: SlotType;
    transactionId: string;
    eventContext: string;
    unit: string;
    userId: string;
    data: Datum[];
    ext: BidExt;
}
export declare enum SlotType {
    BANNER = "banner",
    NATIVE = "native",
    VIDEO = "video",
    POPUP = "popup",
    FLOAT = "float"
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
export interface BidExt {
    options?: BannerOptions;
}
export interface BannerOptions {
    type: SlotType;
    refreshInterval?: number;
    maxRefresh?: number;
    scrollPercent?: number;
    trigger: TriggerType;
    triggerTime: number;
    frequencyCap: number;
    closeButton: boolean;
    size: string;
    overlay: boolean;
    position: Position;
    zIndex: number;
    autoHide: number;
    draggable?: boolean;
}
export declare enum TriggerType {
    ON_LOAD = "on_load",// Hiển thị ngay khi trang vừa load.
    ON_DELAY = "delay",// Sau khi người dùng ở trên trang một khoảng thời gian.
    ON_SCROLL = "scroll",// Khi người dùng scroll đến một % nhất định của trang.
    ON_CLICK = "click",// Khi người dùng click vào một phần tử cụ thể (ví dụ: nút, link, hình).
    ON_INACTIVITY = "inactivity"
}
export declare enum Position {
    BOTTOM_LEFT = "bottom-left",// Góc dưới bên trái
    BOTTOM_RIGHT = "bottom-right",// bóc dưới bên phải
    BOTTOM_CENTER = "bottom-center",// góc dưới ở giữa
    TOP_LEFT = "top-left",// góc trên bên trái
    TOP_RIGHT = "top-right",// góc trên bên phải
    TOP_CENTER = "top-center",// góc trên ở giữa
    CENTER_LEFT = "center-left",// ở giữa bên trái
    CENTER_RIGHT = "center-right"
}
export interface PluginParams {
    creativeInfo: CreativeInfo;
    slotId: string;
    campaignId: string;
    transactionId: string;
    eventContext: string;
    unit: string;
    userId: string;
    options: BannerOptions;
}
export declare enum TrackingEventType {
    IMPRESSION = "impression",
    CLICK = "click",
    ERROR = "error"
}
export {};
