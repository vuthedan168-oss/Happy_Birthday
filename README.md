# 🎂 THIỆP SINH NHẬT & KỶ NIỆM TƯƠNG TÁC (INTERACTIVE CELEBRATION & STUDIO)

Chào bạn! Dự án này đã được nâng cấp toàn diện thành một **Studio Tạo Thiệp Sinh Nhật & Tình Yêu (tương tự như love.tsonit.com)** với đầy đủ các tính năng hiện đại nhất:

✨ **Người dùng trực tiếp nhập nội dung trên web (không cần sửa file code `config.js`)**  
🎡 **Vòng quay may mắn (Lucky Spin Wheel) với 6 ô quà tùy chỉnh theo tỷ lệ %**  
🎵 **Chọn nhạc nền có sẵn, dán link MP3 hoặc tải bài hát từ thiết bị**  
💖 **Thanh Dock Icon Picker tương tác để người nhận thả bão tim, hoa và quà**  
⏳ **Khóa hẹn giờ đếm ngược (Countdown Lock) chỉ mở thiệp đúng ngày giờ bạn muốn**  
🚀 **Hoạt động 100% tĩnh trên GitHub Pages, Netlify hoặc Vercel mà không cần server backend!**

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Studio Tạo Thiệp Trực Quan (`create.html`)
- Mở `create.html` trên trình duyệt: Bạn có thể nhập ngay Tiêu đề, Tên người nhận, Lời chúc tâm tình (nhiều đoạn), Ngày sinh nhật.
- **Hẹn giờ mở thiệp**: Cài đặt ngày và giờ cho phép xem. Nếu người nhận mở trước giờ này, màn hình sẽ hiển thị đồng hồ đếm ngược bí mật!
- **Kho nhạc đa dạng**: Chọn bài hát có sẵn (Piano, Lofi, Romantic, Party, Synth) hoặc dán link nhạc MP3 tùy biến hoặc tải file từ máy lên.
- **6 Phần quà tùy chỉnh cho Vòng quay**: Tự đặt tên quà, lời nhắn khi trúng và tỷ lệ % trúng thưởng.
- **Bộ Icon / Sticker**: Chọn chủ đề icon (Sinh nhật, Tình yêu, Thú cưng, Lấp lánh) hoặc tự nhập icon riêng.
- **Album ảnh kỷ niệm Polaroid**: Dán link ảnh hoặc tải ảnh trực tiếp từ máy tính/điện thoại (tự động nén để link chia sẻ luôn gọn gàng).
- **1-Click Tạo Link Chia Sẻ**: Toàn bộ dữ liệu được nén URL-safe, chỉ cần bấm **Sao chép** là có ngay link gửi qua Messenger, Zalo, Instagram,... Người nhận mở link là xem được đúng thiệp bạn tạo!
- **Nút Xuất `config.js`**: Hỗ trợ bạn nào muốn tải file cấu hình về lưu trữ lâu dài.

### 2. Giao Diện Trải Nghiệm Người Nhận (`index.html`)
- **Màn hình Đếm ngược (nếu có hẹn giờ)**: Hồi hộp chờ đón khoảnh khắc sinh nhật.
- **Hộp quà 3D phát sáng**: Chạm để mở nắp hộp quà + bắn pháo hoa confetti ngập màn hình + tự động phát nhạc.
- **Bánh kem 3D thổi nến ước nguyện**: Chạm vào nến để thổi tắt lửa, tạo khói bốc lên và gửi điều ước tới các vì sao.
- **Bức thư gõ máy chữ (Typewriter)**: Từng dòng tâm tình xuất hiện sống động kèm con trỏ nhấp nháy.
- **Album ảnh kỷ niệm Polaroid**: Góc xoay ngẫu nhiên phong cách vintage, nhấp vào ảnh để phóng to (Lightbox).
- **VÒNG QUAY MAY MẮN (LUCKY SPIN WHEEL)**:
  - 6 ô quà màu sắc rực rỡ kèm kim chỉ trên đỉnh.
  - Âm thanh tíc tắc chân thực khi xoay.
  - Popup chúc mừng lung linh khi trúng thưởng kèm lời nhắn riêng và nút nhận quà.
- **Thanh Dock Icon Reaction**: Người nhận có thể bấm vào bất kỳ icon nào trên thanh dock ở mép dưới để thả hàng chục icon bay bổng khắp màn hình.
- **Nút "Tự tạo thiệp"**: Giúp người nhận hoặc bạn bè khác có thể bấm vào để tự tạo thiệp tặng người thân (hiệu ứng lan tỏa).

---

## 🚀 HƯỚNG DẪN ĐẨY LÊN GITHUB PAGES (MIỄN PHÍ VĨNH VIỄN)

Trang web được xây dựng 100% bằng HTML5, CSS3 và Vanilla JavaScript thuần, **không cần cơ sở dữ liệu (database) hay Node.js server**, cực kỳ hoàn hảo để đưa lên GitHub Pages:

### Các bước thực hiện:
1. Tạo một Repository mới trên GitHub (ví dụ đặt tên là `birthday-card` hoặc `love-card`), chọn chế độ **Public**.
2. Tải hoặc đẩy toàn bộ các file trong thư mục này lên GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit with Birthday Creator Studio & Lucky Wheel"
   git branch -M main
   git remote add origin https://github.com/TÊN_GITHUB_CỦA_BẠN/birthday-card.git
   git push -u origin main
   ```
3. Truy cập vào **Settings** của Repository trên GitHub > Tìm mục **Pages** (bên menu trái).
4. Tại phần **Branch**, chọn nhánh `main` (thư mục `/root`) và bấm **Save**.
5. Sau 1 - 2 phút, GitHub sẽ cung cấp cho bạn một đường link chính thức:
   `https://TÊN_GITHUB_CỦA_BẠN.github.io/birthday-card/`
6. Từ nay, bạn có thể:
   - Vào `https://TÊN_GITHUB_CỦA_BẠN.github.io/birthday-card/create.html` để tạo vô số thiệp khác nhau cho bạn bè, người yêu, người thân.
   - Mỗi lần bấm "Tạo Link", bạn sẽ nhận được một đường link riêng biệt chứa toàn bộ thiệp đó để gửi đi!

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```text
birthday-card/
├── index.html            # Giao diện xem thiệp chính (Người nhận)
├── create.html           # Studio tạo thiệp trực quan (Người tạo)
├── config.js             # Cấu hình mặc định (fallback khi mở index trực tiếp)
├── README.md             # Tài liệu hướng dẫn sử dụng & triển khai
├── css/
│   ├── style.css         # Phong cách thiệp, vòng quay, reaction dock, đếm ngược
│   ├── cake.css          # Hiệu ứng bánh kem 3D & nến thổi tắt
│   └── creator.css       # Giao diện Form Studio hiện đại chuẩn xu hướng
├── js/
│   ├── card-storage.js   # Bộ mã hóa/giải mã cấu hình qua URL không cần database
│   ├── creator.js        # Logic trang tạo thiệp, upload ảnh, test nhạc
│   ├── main.js           # Logic xem thiệp, vòng quay may mắn, icon reaction
│   ├── audio.js          # Âm thanh thổi nến, bóng bay, nhạc nền, vòng quay
│   └── confetti.min.js   # Thư viện hiệu ứng pháo hoa giấy rực rỡ
└── assets/
    ├── audio/            # Tệp nhạc nền Happy Birthday MP3
    └── images/           # Ảnh mẫu Polaroid
```

---

## 💡 MẸO TÙY BIẾN NHANH
- Nếu muốn chỉnh sửa nhanh nội dung mặc định hiển thị lúc mới vào web, bạn chỉ cần sửa file `config.js`.
- Nếu muốn tạo thiệp gửi bạn bè với thông tin riêng biệt, chỉ cần mở `create.html`, điền form và bấm **Tạo Link Thiệp & Sao Chép**!

Chúc bạn tạo ra thật nhiều món quà sinh nhật bất ngờ, ý nghĩa và ngập tràn hạnh phúc! 🎉💖