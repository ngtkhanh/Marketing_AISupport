# TỔNG HỢP YÊU CẦU ĐỀ BÀI, TIÊU CHÍ ĐÁNH GIÁ & HƯỚNG DẪN NỘP BÀI

---

## PHẦN 1: ĐỀ BÀI CHI TIẾT

### Đề đã nhận: Đề 9 - AI gợi ý ý tưởng chiến dịch marketing

* **Bối cảnh:** Bí ý tưởng là nỗi đau chung của người làm marketing. Hãy dựng **Trợ lý Marketing gợi ý ý tưởng chiến dịch theo ngân sách**.

### 1. Yêu cầu chức năng (5 tính năng chính)
1. **Form nhập thông tin:**
   * Ngành hàng
   * Tên sản phẩm
   * Mức ngân sách: 03 mức (*Thấp / Trung bình / Cao*)
   * Mục tiêu chiến dịch
2. **AI đề xuất 05 ý tưởng chiến dịch:** Mỗi ý tưởng gồm:
   * Tên chiến dịch
   * Kênh triển khai
   * Nội dung chính
3. **Timeline triển khai:**
   * Mỗi ý tưởng kèm timeline triển khai 04 tuần tóm tắt (dạng danh sách từ Tuần 1 đến Tuần 4, không cần biểu đồ Gantt).
4. **Nút "Lưu vào shortlist":**
   * Cho phép bấm lưu riêng cho từng ý tưởng yêu thích.
5. **Trang shortlist:**
   * Xem lại danh sách các ý tưởng đã lưu.
   * Xóa ý tưởng khỏi shortlist.
   * Sao chép (copy) tóm tắt ý tưởng để gửi cho team.

### 2. Giải thích & Quy định kỹ thuật từ Ban Tổ Chức (BTC)
* **Ngân sách:** Cung cấp 03 lựa chọn có sẵn (*Thấp / Trung bình / Cao*); đội thi tự định nghĩa khoảng tiền minh họa cụ thể cho từng mức.
* **Timeline:** Trình bày dạng danh sách Tuần 1 – Tuần 4, không bắt buộc vẽ biểu đồ Gantt.
* **Lưu trữ:** Dữ liệu Shortlist lưu trữ bằng `localStorage`.

---

## PHẦN 2: TIÊU CHÍ ĐÁNH GIÁ (BẢNG A - TỔNG 100 ĐIỂM)

| STT | Nội dung đánh giá | Điểm tối đa | Đội thi cần thể hiện |
| :---: | :--- | :---: | :--- |
| **1** | **Hoàn thành chức năng & độ đúng nghiệp vụ** | **25** | Hoàn thành đầy đủ 5 tính năng; luồng trải nghiệm người dùng xuyên suốt; kết quả gợi ý đúng nghiệp vụ marketing. |
| **2** | **Thiết kế kỹ thuật & chất lượng mã nguồn** | **20** | Code có cấu trúc rõ ràng, dữ liệu nhất quán, đảm bảo an toàn cơ bản; lựa chọn công nghệ phù hợp. |
| **3** | **Tích hợp AI & kiểm soát đầu ra** | **15** | Prompt/AI phù hợp với dữ liệu đầu vào; tích hợp và kiểm soát chất lượng kết quả trả về rõ ràng. *(Lưu ý: Chỉ dùng mock AI tối đa 4/15 điểm)*. |
| **4** | **Kiểm thử độ ổn định & xử lý lỗi** | **15** | Có kiểm tra (validation), chặn dữ liệu sai và xử lý ngoại lệ/sự cố hợp lý. |
| **5** | **Làm chủ Vibe Coding & phản biện kỹ thuật** | **15** | Có tài liệu minh chứng dùng AI hiệu quả; hiểu sâu và giải thích thuyết phục về sản phẩm. |
| **6** | **Giao diện & trải nghiệm người dùng (UI/UX)** | **5** | Giao diện dễ thao tác, dễ đọc, hiển thị tốt và dùng được trên thiết bị di động (Responsive). |
| **7** | **Triển khai & bàn giao** | **5** | Có link online chạy thực tế, source code và tài liệu hướng dẫn chạy, video demo đúng yêu cầu. |
| **TỔNG** | | **100** | |

> **Lưu ý đặc biệt cho Bảng A:**
> * Cần tích hợp AI thật để được đánh giá trọn vẹn nhóm điểm AI.
> * Không bắt buộc phải có backend phức tạp hoặc cơ sở dữ liệu thật.
> * Không cộng điểm cho việc nhồi nhét nhiều công nghệ không cần thiết.

---

## PHẦN 3: HƯỚNG DẪN & CÁC BƯỚC CHUẨN BỊ BÀI NỘP

### 1. Gói mã nguồn (File ZIP) & File README
* **File nén:** Đóng gói toàn bộ source code thành 1 file `.zip`.
* **Nội dung file `README.md` bắt buộc gồm:**
  * Số đề (Đề 9).
  * Công nghệ sử dụng.
  * Danh sách các tính năng đã hoàn thiện.
  * Hướng dẫn chi tiết cách cài đặt và chạy ứng dụng cục bộ (local).
  * Mô hình/Dịch vụ AI sử dụng.
  * Giới hạn của hệ thống hiện tại.
  * Các nguồn tham khảo (nếu có).
* **Bảo mật:** Chỉ cung cấp file cấu hình mẫu (ví dụ: `.env.example`). **Tuyệt đối không để lộ API Key hoặc mật khẩu** trong source code nộp.

### 2. Video Demo sản phẩm
* **Thời lượng:** Tối đa **02 phút**.
* **Nội dung:** Thao tác thực tế trên giao diện, trình diễn đầy đủ cả **5 tính năng** theo yêu cầu đề bài.

### 3. Tài liệu minh chứng sử dụng AI (Vibe Coding)
* **Dung lượng:** Tối đa **01 trang**.
* **Nội dung:** Kèm tối đa **05 ảnh chụp màn hình/đoạn hội thoại chọn lọc** minh chứng quá trình trao đổi với AI, thể hiện rõ việc thử nghiệm, tinh chỉnh prompt và cải thiện mã nguồn.

### 4. Danh sách kịch bản kiểm thử (Test Cases)
Bảng A yêu cầu chuẩn bị tài liệu ghi nhận kết quả thực tế của **ít nhất 06 ca kiểm thử (Test Cases)** (chấp nhận kiểm thử thủ công):
* **02 ca kiểm thử bình thường (Normal Cases):** Dữ liệu chuẩn, kiểm tra luồng tạo ý tưởng và lưu shortlist thành công.
* **02 ca đầu vào không hợp lệ (Invalid Inputs):** Để trống trường, dữ liệu sai định dạng, vượt quá giới hạn ký tự,... kiểm tra xem hệ thống có chặn và báo lỗi rõ ràng không.
* **02 ca biên/sự cố (Edge / Error Cases):** Lỗi mất mạng khi gọi AI, API AI hết hạn mức (rate limit/quota), nội dung nhạy cảm, ngân sách bất thường,... kiểm tra phản ứng và cách xử lý lỗi của hệ thống.

### 5. Chuẩn bị phần Vấn đáp / Phản biện (Q&A)
* **Thời gian:** Mỗi đội có **05 phút** hỏi đáp với Ban Giám Khảo.
* **Yêu cầu Bảng A:** Tập trung giải thích sâu về mặt **kỹ thuật**, cấu trúc code, cơ chế tích hợp & kiểm soát AI, cách giải quyết sự cố. *(Ban giám khảo không yêu cầu sửa code trực tiếp).*

### 6. Quy định về Hạn chót & Bàn giao
* Nộp đúng thời hạn quy định từ BTC.
* Sản phẩm, mã nguồn và minh chứng được nộp tại đúng mốc deadline sẽ là căn cứ duy nhất để chấm điểm.
* **Không được bổ sung, sửa đổi tính năng sau thời hạn nộp bài.**