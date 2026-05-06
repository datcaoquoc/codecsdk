# Codec ARF SDK

Codec ARF SDK là một giải pháp quảng cáo Outstream mạnh mẽ, linh hoạt và dễ dàng mở rộng thông qua hệ thống plugin. SDK này hỗ trợ nhiều định dạng quảng cáo khác nhau (Banner, Float, Popup) với khả năng theo dõi (tracking) và tối ưu hóa hiệu suất.

## 🚀 Tính năng nổi bật

- **Kiến trúc Plugin**: Chỉ tải các thành phần cần thiết cho định dạng quảng cáo đang hiển thị.
- **Dynamic Versioning**: Tự động nhận diện Base URL (CDN hoặc Local) để tải các plugin cùng phiên bản.
- **Tối ưu Iframe**: Quảng cáo được render trong iframe riêng biệt để tránh xung đột CSS/JS với trang web chính.
- **Hệ thống Tracking**: Theo dõi Impression (khi hiển thị >50%) và Click một cách chính xác.
- **Hỗ trợ Refresh**: Khả năng tự động làm mới quảng cáo theo cấu hình.

## 🛠 Luồng hoạt động của SDK

1.  **Khởi tạo (Initialization)**:
    - SDK được nhúng vào trang web.
    - Tự động xác định `SDK_BASE_URL` từ thuộc tính `src` của thẻ script (hỗ trợ cả CDN và môi trường local).
    - Khởi tạo hàng đợi xử lý quảng cáo (`_arfQueue`).

2.  **Yêu cầu quảng cáo (Ad Request)**:
    - SDK quét các vùng quảng cáo (Zones) được định nghĩa.
    - Thu thập thông tin môi trường (Thiết bị, URL, Domain).
    - Gửi yêu cầu POST đến Ad Server để lấy thông tin Creative.

3.  **Xử lý Response (SSP Callback)**:
    - Ad Server trả về một script thực thi hàm `sspcallback`.
    - SDK nhận diện loại quảng cáo (`formatType`) từ payload.

4.  **Tải và Chạy Plugin (Plugin Execution)**:
    - SDK kiểm tra xem plugin tương ứng (ví dụ: `plugin-banner`) đã được tải chưa.
    - Nếu chưa, SDK sẽ tải file `.js` của plugin đó từ `SDK_BASE_URL`.
    - Sau khi plugin sẵn sàng, SDK gọi hàm render của plugin với các tham số nhận được.

5.  **Render và Tracking**:
    - Plugin tạo iframe và hiển thị nội dung quảng cáo.
    - Tự động chèn logo thương hiệu (`plugin-codeclogo`).
    - Sử dụng `IntersectionObserver` để gửi sự kiện Impression khi người dùng nhìn thấy quảng cáo.
    - Theo dõi lượt click và chuyển hướng đến Landing Page.

## 📁 Cấu trúc thư mục

```text
src/
├── main-sdk.ts       # Entry point, quản lý queue và tải plugin
├── config.ts         # Cấu hình tập trung (CDN URL, Version)
├── helper.ts         # Các hàm tiện ích (UUID, URL detection, Domain check)
├── type.ts           # Định nghĩa các interface và kiểu dữ liệu
├── monitor/          # Hệ thống tracking và thu thập dữ liệu môi trường
└── plugins/          # Các module xử lý định dạng quảng cáo riêng biệt
    ├── plugin-banner.ts
    ├── plugin-float.ts
    ├── plugin-popup.ts
    └── plugin-codeclogo.ts
```

## 🔨 Hướng dẫn Build

Dự án sử dụng **Rollup** để đóng gói và **TypeScript** để phát triển.

1.  **Cài đặt phụ thuộc**:
    ```bash
    npm install
    ```

2.  **Build**:
    - lưu ý trước khi build cần update version trong file config.ts
    - chạy lệnh: npm run build
    - Các file kết quả sẽ nằm trong thư mục `dist/`.
    - tạo tag: git tag {version} && git push origin {version}
 ```bash
    git tag v1.0.10
    git push origin v1.0.10
    ```


3.  **Chế độ Development**:
    để chạy ở chế độ dev thì chạy file index.html trong file này đã import sẵn sdk ở chế độ dev rồi

## 📦 Sử dụng

Nhúng SDK vào trang web:

```html
<script src="https://cdn.jsdelivr.net/gh/datcaoquoc/codecsdk@v1.0.9/dist/main-sdk.min.js" async></script>
```

---
© 2024 Codec Ads Solution. All rights reserved.
