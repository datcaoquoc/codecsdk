import { CreativeInfo } from "../type";
/**
 * SDK Tracking đơn giản — theo dõi view, click, ping, exit
 * Có thể dùng riêng hoặc tích hợp vào SDK chính.
 */
export declare class AdTracking {
    private endpoint;
    constructor();
    /**
     * Gửi event tracking cơ bản (impression, click, view...)
     */
    /**
     * Tự động gửi ping mỗi 30s để đo thời gian ở lại trang
     */
    /**
     * Theo dõi sự kiện rời trang (beforeunload)
     */
    /**
     * Gửi tracking impression (hiển thị quảng cáo)
     */
    _trackImpression(params: {
        creativeInfo: CreativeInfo;
        transactionId: string;
        context: string;
        userId: string;
        unit: string;
        campaignId: string;
        inventId: string;
    }): void;
    /**
     * Gửi tracking click
     */
    _trackClickUrl(params: {
        creativeInfo: CreativeInfo;
        transactionId: string;
        context: string;
        userId: string;
        unit: string;
        campaignId: string;
        inventId: string;
        url: string;
    }): String;
    /**
     * Sinh UUID tạm
     */
    private uuid;
    /**
     * Encode object thành query string
     */
    private _encode;
}
export {};
