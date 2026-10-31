/**
 * Làm sạch chuỗi đầu vào: loại bỏ ký tự điều khiển, khoảng trắng thừa và chuẩn hóa chuỗi
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    // Loại bỏ ký tự điều khiển ngoại trừ xuống dòng và tab
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Gộp nhiều khoảng trắng thành một khoảng trắng
    .replace(/[ \t]+/g, ' ')
    .trim();
}

