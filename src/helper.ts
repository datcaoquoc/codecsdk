export function generateUUIDv4(): string {
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

// hàm so sánh domain
export function _isSameDomain(urlPage: string, urliv: string) {
  // Hàm chuẩn hoá để chỉ lấy domain gốc
  const normalizeDomain = (input: string) => {
    if (!input) return null;

    try {
      // Nếu thiếu protocol thì thêm vào để URL constructor hoạt động
      if (!/^https?:\/\//i.test(input)) {
        input = 'https://' + input;
      }
      const u = new URL(input);
      return u.hostname.replace(/^www\./, '').toLowerCase();
    } catch {
      return null;
    }
  };

  const d1 = normalizeDomain(urlPage);
  const d2 = normalizeDomain(urliv);

  return d1 !== null && d1 === d2;
}