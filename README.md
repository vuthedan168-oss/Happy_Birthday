# 🎂 THIỆP SINH NHẬT & KỶ NIỆM TƯƠNG TÁC (INTERACTIVE CELEBRATION & STUDIO)

Chào bạn! Dự án này là một **Studio Tạo Thiệp Sinh Nhật & Tình Yêu** với đầy đủ các tính năng hiện đại, cho phép bạn tự tay thiết kế và chia sẻ một món quà web tương tác vô cùng ý nghĩa.

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Studio Tạo Thiệp Trực Quan (`index.html`)
- Mở `index.html` trên trình duyệt: Bạn có thể nhập ngay Tiêu đề, Tên người nhận, Lời chúc, Ngày sinh nhật.
- **Hẹn giờ mở thiệp**: Cài đặt ngày giờ. Nếu người nhận mở trước giờ, một đồng hồ đếm ngược bí mật sẽ xuất hiện thay vì nội dung chính.
- **Kho nhạc & Tùy chỉnh**: Chọn nhạc nền có sẵn, dán link MP3 hoặc tải bài hát từ thiết bị.
- **Vòng quay may mắn (Lucky Spin Wheel)**: Có 6 ô quà tùy chỉnh kèm lời nhắn và tỷ lệ % trúng thưởng.
- **1-Click Tạo Link Chia Sẻ**: Dữ liệu cấu hình được nén URL-safe, chỉ cần tạo và sao chép là có ngay link chia sẻ!

### 2. Giao Diện Trải Nghiệm Người Nhận (`gift.html`)
- **Hộp quà 3D & Bánh kem**: Hộp quà phát sáng 3D, khi mở ra sẽ bắn pháo hoa. Bánh kem 3D cho phép tương tác thổi tắt nến.
- **Bức thư gõ máy chữ (Typewriter)**: Từng dòng tâm tình xuất hiện một cách sống động.
- **Album ảnh & Photobooth (Mới!)**: Tích hợp các bộ lọc camera (Gốc, Đào ngâm, Kẹo ngọt, Cổ điển) với phong cách coquette xinh xắn, giúp người nhận tự sướng ngay trên web.
- **Vòng Quay May Mắn**: Âm thanh vòng quay sống động cùng popup bất ngờ khi trúng thưởng.
- **Thanh Dock Icon Reaction**: Thanh công cụ thả biểu cảm ngập tràn màn hình.

### 3. Tính Năng Ghi Hình Trải Nghiệm Bí Mật (Camera Record)
- Hỗ trợ tính năng quay video quá trình người nhận trải nghiệm thiệp và tự động tải lên Google Drive của bạn!
- Hệ thống backend serverless bằng Google Apps Script (`backend/Code.gs`)
- Tích hợp công cụ shell script ghép video `ffmpeg_merge.sh` dành cho các video segments (chia nhỏ theo luồng upload).
*(Xem thêm hướng dẫn chi tiết tại file `deploy_guide.md`)*

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```text
birthday-card/
├── index.html            # Studio tạo thiệp trực quan (Dành cho Người tạo)
├── gift.html             # Giao diện xem thiệp chính (Dành cho Người nhận)
├── config.js             # Cấu hình dữ liệu mặc định
├── README.md             # Tài liệu giới thiệu tổng quan
├── deploy_guide.md       # Hướng dẫn triển khai tính năng ghi hình lên Google Drive
├── ffmpeg_merge.sh       # Công cụ (script) hỗ trợ ghép file video .webm
├── update.py             # Các scripts hỗ trợ patch/chèn thêm tính năng mới vào css/js
├── backend/
│   └── Code.gs           # Mã nguồn Google Apps Script (Web App webhook upload video)
├── css/
│   ├── style.css         # Phong cách thiệp chính
│   ├── lovegift.css      # Các hiệu ứng nâng cao (Photobooth, animation lấp lánh)
│   └── creator.css       # Style cho giao diện Studio Tạo Thiệp
├── js/
│   ├── card-storage.js   # Logic mã hóa/giải mã config thiệp thông qua URL
│   ├── creator.js        # Logic xử lý tại trang tạo thiệp
│   ├── main.js           # Logic chính xử lý gift.html (camera, quay video, effects)
│   ├── audio.js          # Hệ thống âm thanh (nhạc nền, SFX)
│   └── confetti.min.js   # Thư viện hiệu ứng pháo hoa
└── assets/
    ├── audio/            # Tệp nhạc MP3 mặc định
    └── images/           # Ảnh Polaroid, hình minh họa
```

---

## 🚀 HƯỚNG DẪN SỬ DỤNG VÀ TRIỂN KHAI

### Chạy Local (Trên máy tính cá nhân)
1. Tải toàn bộ mã nguồn về.
2. Các file thuần HTML có thể mở bằng cách double-click. Tuy nhiên, **khuyến nghị** mở thông qua Local Server (như tính năng *Live Server* của VS Code) để các tính năng Camera/Microphone hay Load file nội bộ (CORS) hoạt động trơn tru.
3. Mở `index.html` để bắt đầu tạo thiệp.

### Đẩy lên GitHub Pages (Hosting Miễn Phí)
Vì giao diện chính là tĩnh (chạy 100% frontend mà không cần database), bạn có thể dễ dàng host miễn phí:
1. Tạo một Repository Public trên GitHub.
2. Đẩy (Push) toàn bộ thư mục này lên nhánh `main`.
3. Vào tab **Settings > Pages** trong repo, chọn deploy từ nhánh `main`.
4. Sau ít phút, GitHub Pages sẽ cấp link truy cập (`https://<username>.github.io/<repo>/`).
5. Vào link đó (mặc định sẽ load `index.html`), tạo nội dung thiệp và ấn **Tạo Link**. Link sinh ra sẽ dẫn tới `gift.html` kèm theo dữ liệu mã hóa.

### Triển Khai Tính Năng Quay Trải Nghiệm (Tùy Chọn)
Nếu bạn muốn nhận được video reaction của người xem khi mở thiệp:
1. Đọc và làm chuẩn theo từng bước trong file `deploy_guide.md`.
2. Tạo Web App trên nền tảng Google Apps Script sử dụng code từ `backend/Code.gs`.
3. Thay thế biến `SCRIPT_URL` trong file `js/main.js` bằng URL Web App bạn vừa tạo.
4. Khi nhận được các đoạn video `.webm` ngắt quãng trên Google Drive, dùng lệnh `bash ffmpeg_merge.sh` để gom thành một video duy nhất hoàn hảo.

---

## 💡 MẸO TÙY BIẾN NHANH
- **Chỉnh sửa nội dung mặc định:** Bạn có thể chỉnh nội dung trong file `config.js` nếu muốn trực tiếp mở file `gift.html` bằng một cấu hình tĩnh.
- **Áp dụng tính năng mới bằng Python Scripts:** Các file `update.py` (hoặc `update2.py`, `update3.py`) chứa code giúp tự động chèn các tính năng photobooth, filter máy ảnh vào mã nguồn. Bạn có thể xem source của script đó hoặc tự chỉnh sửa trực tiếp bằng tay vào `css/lovegift.css` và `js/main.js`.

🎉 *Chúc bạn tạo ra thật nhiều món quà sinh nhật bất ngờ, ý nghĩa và mang lại niềm vui cho những người yêu thương!* 💖