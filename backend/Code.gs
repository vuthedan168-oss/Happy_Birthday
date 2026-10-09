const ROOT_FOLDER_ID = '1SB8axOSseqmkhGHMGYfk77WtePsEXflm';

function doPost(e) {
  try {
    console.log("========== BẮT ĐẦU NHẬN REQUEST ==========");
    
    if (!e || !e.postData || !e.postData.contents) {
      console.error("LỖI: Request không có dữ liệu (Payload trống).");
      return ContentService.createTextOutput('Error: Empty payload');
    }
    
    const data = JSON.parse(e.postData.contents);
    const { videoBase64, mimeType, sessionId, part } = data;
    
    console.log("Session ID:", sessionId, "| Part:", part, "| MimeType:", mimeType);
    
    if (!videoBase64) {
      console.error("LỖI: Không tìm thấy videoBase64 trong dữ liệu gửi lên.");
      return ContentService.createTextOutput('Error: Missing video data');
    }
    
    const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
    
    let sessionFolder;
    const folders = rootFolder.getFoldersByName(sessionId);
    if (folders.hasNext()) {
      sessionFolder = folders.next();
    } else {
      sessionFolder = rootFolder.createFolder(sessionId);
      console.log("Đã tạo thư mục mới:", sessionId);
    }
    
    const ext = mimeType && mimeType.includes('mp4') ? 'mp4' : 'webm';
    const fileName = 'part' + String(part).padStart(3, '0') + '.' + ext;
    
    try {
      console.log("Đang decode Base64 cho file:", fileName);
      
      // KHẮC PHỤC LỖI "Could not decode string":
      // 1. Chuyển đổi định dạng web-safe sang chuẩn nếu có
      let cleanedBase64 = videoBase64.replace(/-/g, '+').replace(/_/g, '/');
      // 2. Xóa toàn bộ ký tự lạ (khoảng trắng, xuống dòng...)
      cleanedBase64 = cleanedBase64.replace(/[^A-Za-z0-9+/=]/g, "");
      // 3. Đảm bảo độ dài luôn chia hết cho 4 (bổ sung padding '=')
      while (cleanedBase64.length % 4 !== 0) {
        cleanedBase64 += '=';
      }
      
      const decodedBytes = Utilities.base64Decode(cleanedBase64);
      
      const safeMime = ext === 'mp4' ? 'video/mp4' : 'video/webm';
      console.log("Đang tạo Blob với MIME type:", safeMime);
      
      const blob = Utilities.newBlob(decodedBytes, safeMime, fileName);
      sessionFolder.createFile(blob);
      console.log("=> LƯU FILE THÀNH CÔNG:", fileName);
      
    } catch (innerErr) {
      console.error("LỖI KHI XỬ LÝ BASE64 / BLOB:", innerErr);
      try {
        sessionFolder.createFile(
          'error_part' + part + '.txt',
          'Lỗi: ' + innerErr.toString() + '\nMimeType: ' + mimeType,
          MimeType.PLAIN_TEXT
        );
      } catch (e2) {
        console.error("Lỗi khi ghi file error.txt:", e2);
      }
      throw innerErr;
    }
    
    return ContentService.createTextOutput('OK');
  } catch (err) {
    console.error("LỖI TOÀN CỤC TRONG DOPOST:", err);
    return ContentService.createTextOutput('Error: ' + err.toString());
  }
}

function doGet(e) {
  return ContentService.createTextOutput('Method GET not supported.');
}