# Hướng Dẫn Cấu Hình Và Deploy Tính Năng Ghi Hình Trải Nghiệm

## Bước 1: Tạo Folder trên Google Drive
1. Vào [Google Drive](https://drive.google.com).
2. Tạo một thư mục mới để chứa các video ghi lại (VD: `Birthday_Videos`).
3. Mở thư mục đó ra, nhìn lên thanh URL của trình duyệt. Nó có dạng: `https://drive.google.com/drive/folders/ABC123XYZ456...`
4. Copy phần ID (`ABC123XYZ456...`). Đây là `ROOT_FOLDER_ID`.

## Bước 2: Tạo Google Apps Script (Backend)
1. Truy cập [Google Apps Script](https://script.google.com) và bấm **New project**.
2. Xóa code có sẵn và dán toàn bộ nội dung file `backend/Code.gs` vào.
3. Thay dòng `const ROOT_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID_HERE';` bằng ID vừa copy ở Bước 1.
4. Đổi tên dự án (Góc trên cùng bên trái) thành "Birthday Webhook" hoặc gì tùy ý.
5. Bấm icon 💾 để Save (hoặc Ctrl+S).

## Bước 3: Deploy thành Web App
1. Nhìn lên góc trên bên phải, bấm nút xanh **Deploy** -> **New deployment**.
2. Ở phần Select type (bánh răng nhỏ), chọn **Web app**.
3. Điền thông tin:
   - Description: (Để trống hoặc ghi chú)
   - Execute as: **Me** (Chọn tài khoản Google của bạn)
   - Who has access: **Anyone**
4. Bấm **Deploy**.
5. *Lưu ý:* Nếu Google yêu cầu cấp quyền (Authorize access), hãy bấm **Review permissions** -> Chọn tài khoản -> Bấm **Advanced** (Nâng cao) -> **Go to ... (unsafe)** -> **Allow** (Cho phép).
6. Khi hoàn tất, sẽ hiện ra một bảng có dòng **Web app URL**. Copy đường link này.

## Bước 4: Cấu hình Frontend
1. Mở file `js/main.js` trong thư mục dự án của bạn.
2. Tìm dòng (ở phần cuối file): 
   `const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';`
3. Thay thế chuỗi đó bằng **Web app URL** vừa copy ở Bước 3.
4. Xong! Web app của bạn đã sẵn sàng ghi hình và upload ẩn lên Google Drive.

## Bước 5 (Sau khi xong trải nghiệm): Ghép video
- Sau khi trải nghiệm kết thúc, Google Drive của bạn sẽ có 1 thư mục chứa nhiều file (part000.webm, part001.webm,...).
- Tải toàn bộ thư mục đó về máy.
- Bỏ file `ffmpeg_merge.sh` vào thư mục đó.
- Cấp quyền thực thi (`chmod +x ffmpeg_merge.sh`) và chạy script.
- Script sẽ ghép các segment thành 1 file `output_full.webm` hoàn chỉnh. (Yêu cầu máy phải cài sẵn FFmpeg).
