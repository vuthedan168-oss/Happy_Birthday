#!/bin/bash
# Hướng dẫn sử dụng:
# 1. Tải folder chứa các segment (VD: sessionId) về máy
# 2. Đặt file script này vào trong folder đó (hoặc cd tới đó)
# 3. Cấp quyền chạy: chmod +x ffmpeg_merge.sh
# 4. Chạy: ./ffmpeg_merge.sh
# Video hoàn chỉnh sẽ là: output_full.webm (hoặc mp4)

echo "Bắt đầu gộp các file segment..."

# Tìm định dạng (ưu tiên webm)
EXT="webm"
if ls *.mp4 1> /dev/null 2>&1; then
  EXT="mp4"
fi

# Tạo danh sách file theo thứ tự tên (part000, part001...)
rm -f file_list.txt
for f in $(ls part*.$EXT 2>/dev/null | sort); do
  if [ -f "$f" ]; then
    echo "file '$f'" >> file_list.txt
  fi
done

if [ ! -s file_list.txt ]; then
  echo "Không tìm thấy file segment nào có tên bắt đầu bằng 'part' và đuôi .$EXT"
  exit 1
fi

# Ghép file nhanh bằng ffmpeg concat demuxer (không encode lại)
ffmpeg -f concat -safe 0 -i file_list.txt -c copy output_full.$EXT

echo "Hoàn thành! Video đã được gộp thành: output_full.$EXT"
rm -f file_list.txt
