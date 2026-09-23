function doPost(e) {
  try {
    // THAY BẰNG ID THƯ MỤC GOOGLE DRIVE CỦA BẠN (NƠI SẼ LƯU VIDEO)
    // Ví dụ: https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ?usp=sharing => ID là 1aBcDeFgHiJkLmNoPqRsTuVwXyZ
    const folderId = "1SB8axOSseqmkhGHMGYfk77WtePsEXflm"; 
    
    // Nhận dữ liệu từ request FormData
    const videoBase64 = e.parameter.videoBase64;
    const mimeType = e.parameter.mimeType || 'video/webm';
    const fileName = e.parameter.fileName || 'photobooth_' + new Date().getTime() + '.webm';
    
    if (videoBase64) {
      // Mở thư mục bằng ID
      const folder = DriveApp.getFolderById(folderId);
      
      // Giải mã chuỗi Base64
      const decodedData = Utilities.base64Decode(videoBase64);
      
      // Tạo đối tượng Blob
      const blob = Utilities.newBlob(decodedData, mimeType, fileName);
      
      // Lưu file vào thư mục Drive
      const file = folder.createFile(blob);
      
      // Trả về response (cho dù dùng mode: 'no-cors' thì client không đọc được response này, 
      // nhưng Google Apps Script bắt buộc phải có để request không bị lỗi)
      return ContentService.createTextOutput(JSON.stringify({
        status: "success", 
        fileId: file.getId()
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error", 
        message: "No videoBase64 data found"
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error", 
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
