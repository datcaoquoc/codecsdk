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
export declare class EnvCollector {
    /**
   * Lấy hoặc tạo mới user ID để dùng cho frequency cap
   * Tạo UUIDv4 nếu chưa tồn tại và lưu trong cookie an toàn
   */
    static _getUserId(cookieName?: string): string;
    static _generateUUIDv4(): string;
    /** Lấy hệ điều hành */
    static _getOS(): string;
    /** Xác định loại thiết bị */
    static _getDeviceType(): "desktop" | "mobile" | "tablet";
    /** Lấy thông tin thiết bị */
    static _getDeviceInfo(): DeviceInfo;
    /** Lấy thông tin trang */
    static _getPageInfo(): PageInfo;
    /** Tạo payload hoàn chỉnh */
    static _getPayload(slot: SlotInfo): Payload;
}
