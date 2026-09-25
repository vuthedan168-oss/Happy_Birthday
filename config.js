/**
 * =========================================================
 * BẢNG ĐIỀU KHIỂN & CẤU HÌNH THIỆP SINH NHẬT (BIRTHDAY CONFIG)
 * =========================================================
 * Bạn có thể dễ dàng thay đổi tên, ngày sinh, lời chúc, ảnh và nhạc tại đây!
 */

const BIRTHDAY_CONFIG = {
  // 1. THÔNG TIN NGƯỜI NHẬN & NGƯỜI GỬI
  recipientName: "Thế Dân", // Tên người nhận (ví dụ: Hương Giang, Cậu, Em, Bạn)
  senderName: "Tớ", // Tên người gửi (ví dụ: Tớ, Anh, Bạn Thân)
  nickname: "Bạn đáng yêu & rạng rỡ nhất ✨",

  // 2. NGÀY SINH NHẬT (Kích hoạt vòng quay số Date Reel)
  birthDay: 17, // Ngày sinh (1 - 31)
  birthMonth: 7, // Tháng sinh (1 - 12)
  birthdayDate: "17 Tháng 7", // Chuỗi hiển thị phụ
  openingGreeting: "Happy Birthday",

  // 2.5 CÂU HỎI TRẮC NGHIỆM (QUIZ)
  quiz: [
    {
      id: 1,
      question: "Hôm nay là ngày sinh nhật đặc biệt của thiên thần nào nhỉ? 🧚‍♀️",
      hint: "Tất cả các câu trả lời đều hướng về cậu đó!",
      options: [
        { text: "✨ Hương Giang xinh đẹp & rạng ngời ✨", isCorrect: true, emoji: "✨" },
        { text: "🌸 Một nàng tiên nữ vừa giáng trần 🌸", isCorrect: false, emoji: "✨" },
        { text: "👑 Công chúa đáng yêu nhất vũ trụ 👑", isCorrect: false, emoji: "✨" }
      ]
    },
    {
      id: 2,
      question: "Vũ khí bí mật khiến ai gặp cũng phải đổ gục trước thiên thần là gì? 💫",
      hint: "Vì nụ cười của cậu có siêu năng lượng tích cực đó!",
      options: [
        { text: "Nụ cười tỏa nắng xua tan mọi mệt mỏi ☀️", isCorrect: true, emoji: "✨" },
        { text: "Trái tim ấm áp và sự quan tâm chân thành 🍓", isCorrect: false, emoji: "✨" },
        { text: "Đôi mắt biết cười lấp lánh như ngàn vì sao 🌟", isCorrect: false, emoji: "✨" }
      ]
    }
  ],

  // 3. THỔI NẾN BÁNH KEM 3D (CINEMATIC CANDLE)
  cakeTitle: "Có một món quà nhỏ dành cho cậu…",
  cakeSubtitle: "Nhưng trước khi mở, thổi nến trước nhé 🎂",
  cakePrompt: "👆 Nhấn & giữ ngọn nến cho đến khi tắt",
  cakeHoldingHint: "giữ nữa… giữ tiếp…",
  cakeLightingHint: "đang thắp nến cho cậu…",
  cakeImage: "assets/images/cake-new.webp",

  // 4. NHỊP CẢM XÚC SAU KHI NẾN TẮT (BEATS)
  beats: [
    "Ngọn nến đã tắt…",
    "nhưng cậu không đi qua năm nay một mình đâu.",
    "Từ từ thôi nhé, {receiver}. {sender} ở đây mà."
  ],
  blackoutCaption: "đang thu gom những kỷ niệm…",

  // 5. CHỌN ĐIỀU ƯỚC SINH NHẬT (4 THẺ BÀI MAY MẮN)
  wishKicker: "Một điều ước",
  wishQuestion: "Bây giờ… chọn một điều ước cho ngày sinh nhật của cậu.",
  wishes: [
    "Hạnh phúc hơn",
    "Trúng Vietlott",
    "Khỏe mạnh hơn",
    "Bình yên hơn"
  ],
  wishReply: "Điều ước đã được nhận. Mong nó từ từ thành hiện thực.",

  // 6. TRÁI TIM KỶ NIỆM MOSAIC 3D & LIGHTBOX
  heartCaption: "Tất cả những kỷ niệm nhỏ này là dành cho cậu.",
  heartTitle: "Chúc Mừng Sinh Nhật, {receiver}.",
  heartSubtitle: "Hôm nay cậu nhất định phải được ăn mừng.",
  heartTapHint: "Chạm vào trái tim để xem ảnh ♡",

  // 7. BỨC THƯ TÂM TÌNH (VINTAGE LETTER)
  letterKicker: "Lá thư nhỏ",
  letterTitle: "Gửi {receiver} Thân Yêu 💌",
  letterBody: `Tớ không giỏi nói mấy lời hoa mỹ, nên viết đơn giản thôi: chúc mừng sinh nhật cậu nhé.

Năm vừa rồi chắc chẳng dễ dàng gì, vậy mà cậu vẫn đi tới được hôm nay — giỏi hơn cậu nghĩ nhiều đấy.

Tớ chỉ mong cậu ăn ngon ngủ đủ, bớt lo một chút, và nhớ là luôn có người ở đây khi cậu cần.`,
  letterSignature: "— {sender}",

  // 8. THẺ KẾT & BẦU TRỜI SAO BĂNG (STARLIGHT WISH SKY)
  finalKicker: "Dành cho cậu",
  finalTitle: "Chúc Mừng Sinh Nhật, {receiver}",
  finalFrom: "từ {sender}",
  finalMessage: "Mong điều ước cậu chọn lúc nãy thật sự tìm được đường đến với cậu trong năm nay.",

  starlightKicker: "Gửi lên trời",
  starlightTitle: "Biến điều ước thành sao băng",
  starlightSubtitle: "Chạm vào ngôi sao để gửi điều ước của cậu lên trời đêm ✨",
  starlightSentTitle: "Điều ước đã được gửi đi ✨",
  starlightSentMessage: "Người ta nói điều ước theo sao băng sớm muộn cũng thành hiện thực. Từ đêm nay, sẽ luôn có một ngôi sao giữ lời ước ấy giúp cậu.",
  starlightTapHint: "Chạm vào bầu trời để thả thêm sao băng nhé ✧",

  // 9. ALBUM ẢNH KỶ NIỆM (Ghép vào Trái Tim Mosaic & Lightbox)
  gallery: [
    {
      url: "assets/images/girl/girl2.jpeg",
      caption: "Nụ cười rạng rỡ nhất ☀️"
    },
    {
      url: "assets/images/girl/girl3.jpeg",
      caption: "Những khoảnh khắc ngập tràn niềm vui 🌸"
    },
    {
      url: "assets/images/photo1.jpg",
      caption: "Kỷ niệm ngọt ngào như chiếc bánh kem 🍰"
    },
    {
      url: "assets/images/photo2.jpg",
      caption: "Mỗi ngày đều là một món quà đặc biệt 💖"
    },
    {
      url: "assets/images/photo3.jpg",
      caption: "Mãi an yên và ngập tràn may mắn 🍀"
    },
    {
      url: "assets/images/photo4.jpg",
      caption: "Chúc bạn tuổi mới thật rực rỡ! 🎂✨"
    }
  ],

  // 10. NHẠC NỀN & HIỆU ỨNG ÂM THANH
  musicUrl: "assets/audio/birthday.mp3",
  musicTitle: "Happy Birthday (Romantic Melody)",

  // 11. VÒNG QUAY MAY MẮN (LUCKY SPIN WHEEL - PHẦN THƯỞNG BÍ MẬT)
  enableLuckyWheel: true,
  luckyWheel: {
    title: "Vòng Quay May Mắn Sinh Nhật 🎡🎁",
    subtitle: "Chạm nút để quay nhận một món quà sinh nhật bí mật!",
    prizes: [
      { id: 1, name: "1 Chầu Trà Sữa 🧋", message: "Được khao 1 ly trà sữa full topping bất kỳ lúc nào!", color: "#FF6B6B" },
      { id: 2, name: "1 Vé Xem Phim 🍿", message: "Một buổi đi xem phim rạp với combo bắp nước siêu to!", color: "#4ECDC4" },
      { id: 3, name: "1 Điều Ước Bất Kỳ 🌟", message: "Người tạo thiệp sẽ thực hiện 1 điều ước trong khả năng!", color: "#FFD93D" },
      { id: 4, name: "Một Ôm Ấm Áp 🤗", message: "Một cái ôm chân thành tiếp thêm năng lượng tích cực!", color: "#FF8E72" },
      { id: 5, name: "Bữa Tối Thịnh Soạn 🍕", message: "Một bữa ăn thỏa thích với món mà cậu thích nhất!", color: "#6C5CE7" },
      { id: 6, name: "Quà Bí Mật 🎁", message: "Một hộp quà bất ngờ được giao tận tay cậu sớm thôi!", color: "#FFAAA6" }
    ]
  },

  // 12. GIAI ĐOẠN 0: KHÓA HẸN GIỜ (COUNTDOWN LOCK) - Bỏ trống nếu muốn mở thiệp ngay
  // Định dạng: "YYYY-MM-DDTHH:mm:ss", ví dụ: "2026-10-15T00:00:00"
  // Mẹo: Bạn cũng có thể mở link kèm ?countdown=preview để xem thử Giai đoạn 0 bất kỳ lúc nào!
  unlockDateTime: "",
  endDate: "", // Ngày kết thúc cho phép xem thiệp (tùy chọn)

  // Nhạc nền riêng cho màn hình hẹn giờ đếm ngược (Giai đoạn 0)
  // Có thể tải lên từ file MP3 hoặc chọn từ danh sách
  countdownMusicUrl: "assets/audio/ngan-nam-anh-sang.mp3",
  countdownMusicTitle: "Ngàn Năm Ánh Sáng"
};

// Đảm bảo tương thích Node/Browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BIRTHDAY_CONFIG;
}
