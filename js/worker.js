// Worker xử lý chuyển đổi Blob sang Base64 cho video segment
// Tránh block main thread khi file lớn

self.onmessage = (e) => {
  const { blob, part, mimeType } = e.data;
  
  const reader = new FileReader();
  
  reader.onloadend = () => {
    // reader.result có dạng "data:video/webm;base64,GkXfo59ChoEBQveBAUL..."
    // Chỉ lấy phần sau dấu phẩy
    const base64 = reader.result.split(',')[1];
    self.postMessage({ base64, part, mimeType });
  };
  
  reader.onerror = (err) => {
    console.error("Worker FileReader error:", err);
  };
  
  reader.readAsDataURL(blob);
};
