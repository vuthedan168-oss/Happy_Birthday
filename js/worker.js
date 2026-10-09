// Worker xử lý chuyển đổi Blob sang Base64 cho video segment
// Tránh block main thread khi file lớn

self.onmessage = (e) => {
  const { blob, part, mimeType } = e.data;
  
  const reader = new FileReader();
  
  reader.onloadend = () => {
    // reader.result có dạng "data:video/webm;codecs=vp8,opus;base64,GkXfo59ChoEBQveBAUL..."
    // Dùng indexOf(';base64,') để tránh lỗi tách nhầm dấu phẩy trong codecs
    const marker = ';base64,';
    const markerIdx = reader.result.indexOf(marker);
    const base64 = markerIdx !== -1 ? reader.result.substring(markerIdx + marker.length) : reader.result.split(',').pop();
    self.postMessage({ base64, part, mimeType });
  };
  
  reader.onerror = (err) => {
    console.error("Worker FileReader error:", err);
  };
  
  reader.readAsDataURL(blob);
};
