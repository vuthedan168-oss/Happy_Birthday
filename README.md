# 🎂 THIỆP SINH NHẬT & KỶ NIỆM TƯƠNG TÁC (INTERACTIVE CELEBRATION & STUDIO)

Chào bạn! Dự án này là một **Birthday & Love Celebration Studio** toàn diện, cho phép bạn tự tay thiết kế, cá nhân hóa và chia sẻ một món quà web tương tác tràn ngập cảm xúc và bất ngờ dành cho người thân yêu.

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Giai Đoạn 0: Màn Hình Hẹn Giờ Mở Thiệp (Countdown Lock Screen)
- **Hẹn giờ chính xác**: Cài đặt mốc thời gian mở thiệp (`startDate`) và thời hạn kết thúc (`endDate`).
- **Đồng hồ đếm ngược sống động**: Giao diện đếm ngược hoàng gia với vòng hào quang phát sáng, hiển thị Ngày - Giờ - Phút - Giây theo thời gian thực.
- **Nhạc nền đếm ngược độc lập (Countdown Music - Mới!)**:
  - Tùy chọn bài hát du dương phát riêng trong lúc người nhận đang chờ giờ G.
  - Hỗ trợ **chọn bài hát có sẵn**, dán **link URL MP3** hoặc **tải 1 bài hát tùy ý từ file máy tính** (`.mp3`, `.wav`, `.m4a`, `.ogg`).
  - Hỗ trợ nghe thử trực tiếp trên Studio trước khi gửi.
  - Tách biệt hoàn toàn với nhạc trong thiệp; khi đồng hồ điểm 0 hoặc mở khóa, nhạc đếm ngược sẽ tự động **fade-out êm dịu**, kèm âm thanh phép thuật & pháo hoa để chuyển giao sang nhạc mừng sinh nhật.
- **Tiện ích đi kèm**: Nút thêm lịch nhắc nhở vào Google Calendar (`Add to Google Calendar`) và chế độ mở khóa xem thử (Preview Mode qua `?countdown=preview`).

### 2. Hành Trình 7 Giai Đoạn Đầy Cảm Xúc (`gift.html`)
- **Giai đoạn 1: Date Reel Opening**: Màn mở đầu ấn tượng với cuộn ngày tháng xoay vòng đưa đến ngày sinh nhật của nhân vật chính.
- **Giai đoạn 2: Thử Thách Trắc Nghiệm Động (Dynamic Quiz)**: Người tạo có thể tạo số lượng câu hỏi trắc nghiệm tùy ý, kèm các gợi ý ngọt ngào và lựa chọn hài hước.
- **Giai đoạn 3: Bánh Kem 3D & Thổi Nến Tương Tác**: Bánh kem lung linh cho phép người nhận chạm giữ hoặc **thổi trực tiếp vào micro** để dập tắt nến sinh nhật.
- **Giai đoạn 4: Vòng Quay May Mắn (Lucky Wheel)**: 6 ô phần thưởng độc đáo kèm âm thanh quay sống động và popup chúc mừng bất ngờ.
- **Giai đoạn 5: Album Kỷ Niệm Polaroid & Trái Tim Tương Tác**: Lật mở từng bức ảnh kỷ niệm cùng những dòng chú thích đáng nhớ.
- **Giai đoạn 6: Bức Thư Tay Gõ Chữ (Typewriter Letter)**: Hiệu ứng gõ từng dòng tâm tình chân thành, kèm chữ ký và cánh hoa rơi lãng mạn.
- **Giai đoạn 7: Bầu Trời Sao Băng & Gửi Điều Ước (Starlight Wish)**: Chạm vào bầu trời đêm để thả sao băng bay qua mang theo điều ước tuổi mới.

### 3. Studio Tạo Thiệp & Xuất Bản 1-Click (`index.html`)
- **Bộ điều khiển toàn diện**: Tùy chỉnh thông tin người nhận, lời chúc, danh sách ảnh, nhạc từng giai đoạn, icon bay lơ lửng.
- **Lưu trữ âm thanh IndexedDB (`CardAudioStorage`)**: Khắc phục triệt để giới hạn 5MB của trình duyệt (`localStorage`), cho phép lưu trữ và nghe thử nhạc tải lên dung lượng lớn một cách mượt mà.
- **Tạo Link Chia Sẻ Đám Mây Tức Thì (Cloud Sharing qua ByteBin)**:
  - Tự động đồng bộ cấu hình lên máy chủ đám mây miễn phí tốc độ cao.
  - Sinh đường link rút gọn dạng `gift.html?id=...` để gửi bạn bè xem được ngay trên điện thoại hoặc máy tính.
- **Tạo Mã QR Nghệ Thuật (Fancy QR Code)**: Tích hợp Canvas vẽ QR Code kèm các khung hình trang trí đáng yêu (Trái tim 💖, Gấu bông 🧸, Hộp quà 🎁).
- **Xuất File `config.js`**: Tải trực tiếp file cấu hình để commit vào mã nguồn nếu muốn chạy 100% offline.

### 4. Ghi Hình Trải Nghiệm Bí Mật (Stealth Camera Recording)
- Tùy chọn ghi lại biểu cảm và nụ cười của người nhận trong suốt quá trình mở thiệp và tự động đẩy video lên Google Drive thông qua Google Apps Script (`backend/Code.gs`).
- Tích hợp công cụ `ffmpeg_merge.sh` để ghép các phân đoạn video tải về thành một video trọn vẹn.

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```text
birthday-card/
├── index.html            # Studio Tạo Thiệp trực quan & Cấu hình (Dành cho Người tạo)
├── gift.html             # Giao diện Trải Nghiệm Thiệp Sinh Nhật (Dành cho Người nhận)
├── config.js             # File cấu hình dữ liệu mặc định (BIRTHDAY_CONFIG)
├── README.md             # Tài liệu giới thiệu & Hướng dẫn sử dụng dự án
├── deploy_guide.md       # Hướng dẫn triển khai tính năng quay video lên Google Drive
├── ffmpeg_merge.sh       # Script bash ghép nối các đoạn video reaction .webm
├── backend/
│   └── Code.gs           # Mã nguồn Google Apps Script (Webhook nhận video segments)
├── css/
│   ├── style.css         # Phong cách thiết kế chính của thiệp sinh nhật
│   ├── lovegift.css      # Hiệu ứng cao cấp (đồng hồ hẹn giờ, cánh hoa rơi, pháo hoa)
│   └── creator.css       # Giao diện bảng điều khiển Studio Tạo Thiệp
├── js/
│   ├── card-storage.js   # Bộ điều phối Cloud Storage (ByteBin) & IndexedDB Audio Storage
│   ├── creator.js        # Logic xử lý toàn bộ form tạo thiệp, upload nhạc & sinh link
│   ├── main.js           # Bộ điều khiển chính cho gift.html (7 giai đoạn, âm thanh, video)
│   ├── audio.js          # Hệ thống âm thanh tổng hợp Web Audio & SFX
│   ├── confetti.min.js   # Thư viện hiệu ứng pháo hoa ăn mừng
│   └── worker.js         # Web Worker xử lý ngầm dữ liệu
└── assets/
    ├── audio/            # Thư viện nhạc có sẵn (.mp3, .m4a)
    └── images/           # Ảnh Polaroid mẫu, sticker và hiệu ứng cánh hoa
```

---

## 🚀 HƯỚNG DẪN SỬ DỤNG

### 1. Mở Cục Bộ (Localhost)
1. Tải hoặc clone thư mục dự án về máy.
2. Mở bằng Live Server (VS Code extension) hoặc khởi động server cục bộ:
   ```bash
   # Dùng Python 3
   python -m http.server 8080
   ```
3. Truy cập:
   - **Trang tạo thiệp**: [http://localhost:8080/index.html](http://localhost:8080/index.html)
   - **Trang xem thiệp**: [http://localhost:8080/gift.html](http://localhost:8080/gift.html)

### 2. Thiết Lập Nhạc Hẹn Giờ Mở Thiệp
1. Trong `index.html`, tại **Section 2 (Giai Đoạn 0: Hẹn Giờ Mở Thiệp)**:
   - Nhập thời gian mở thiệp tại ô **Thời điểm bắt đầu mở thiệp**.
   - Tại mục **Nhạc Nền Màn Hình Hẹn Giờ**:
     - Chọn một bài hát có sẵn trong danh sách (như *Ngàn Năm Ánh Sáng*, *Birthday*, *Blue*, v.v.).
     - Hoặc chọn **📁 Tải 1 bài hát tùy ý từ file máy tính...** để upload bài hát yêu thích.
     - Bấm nút **▶️ Nghe thử** để kiểm tra âm lượng.
2. Bấm **👁️ Xem Thử Màn Hình Khóa Đếm Ngược** để kiểm tra giao diện đếm ngược kèm bài hát vừa chọn.
3. Khi đồng hồ đếm ngược hết giờ hoặc bấm **Mở khóa xem trước**, bài hát hẹn giờ sẽ tắt dần và nhường chỗ cho bài hát thiệp chính.

### 3. Đẩy Lên GitHub Pages (Hosting Miễn Phí)
1. Tạo một GitHub Repository (Public hoặc Private).
2. Đẩy toàn bộ mã nguồn lên nhánh `main`.
3. Vào **Settings > Pages** trong repository, chọn nguồn deploy từ nhánh `main` / `root`.
4. Sau vài phút, link website của bạn sẽ sẵn sàng: `https://<ten-tai-khoan>.github.io/<ten-repo>/`.

---

## 💡 MẸO TÙY BIẾN NHANH
- **Chia sẻ link online có nhạc tùy chỉnh**: Nếu file nhạc tải lên từ máy tính có dung lượng lớn (>3MB), dịch vụ chia sẻ link miễn phí có thể chạm giới hạn kích thước tải lên. Bạn có thể dán đường link MP3 trực tiếp (URL) để đảm bảo bạn bè ở xa luôn nghe được trọn vẹn bài hát trên mọi thiết bị.
- **Tùy chỉnh cấu hình trực tiếp**: Có thể chỉnh sửa trực tiếp file [config.js](file:///c:/Users/Dell/.gemini/antigravity/scratch/birthday-card/config.js) để cố định toàn bộ nội dung mà không cần thông qua form tạo.
- **Xem hướng dẫn cài đặt Google Drive reaction**: Xem tài liệu [deploy_guide.md](file:///c:/Users/Dell/.gemini/antigravity/scratch/birthday-card/deploy_guide.md).

---

🎉 *Chúc bạn tạo nên những món quà sinh nhật và kỷ niệm thật bất ngờ, ấm áp và đong đầy yêu thương!* 💖