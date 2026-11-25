---
name: Peatea Shop
description: Góc nhỏ cho squishy, gấu bông và những món đồ dễ thương
colors:
  paper: "#faf9f6"
  surface: "#fffefa"
  ink: "#30372f"
  olive: "#46583f"
  olive-deep: "#344636"
  muted: "#777a70"
  line: "#e5e5dc"
  accent-soft: "#d7e0cd"
  dark:
    paper: "#161915"
    surface: "#1f231d"
    surface-lifted: "#282e25"
    ink: "#edece4"
    muted: "#9fa593"
    olive: "#8fa882"
    olive-deep: "#a5bf97"
    line: "#2b3227"
    accent-soft: "#273123"
typography:
  display:
    fontFamily: "Lora, Georgia, serif"
    fontWeight: 500
    lineHeight: 1.25
  body:
    fontFamily: "Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "6px"
  md: "12px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.olive-deep}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
---

## Overview

Peatea Shop mang phong cách ấm áp, hữu cơ (earthy, organic, cozy) lấy cảm hứng từ tiệm trà và những vật phẩm thủ công nhỏ xinh. Giao diện ưu tiên cảm giác yên bình, tinh tế và thủ công, tránh xa thẩm mỹ công nghiệp, sắc sảo hay công nghệ hóa quá đà của các trang thương mại điện tử đại trà hoặc AI slop.

## Colors

### Light Palette (Tiệm trà ban ngày)
- **Paper (`#faf9f6`)**: Nền chủ đạo của toàn bộ website, tạo cảm giác như trang giấy mỹ thuật mịn, ấm, không chói mắt như màu trắng tinh `#ffffff`.
- **Surface (`#fffefa`)**: Bề mặt thẻ, thẻ sản phẩm, panel thao tác.
- **Ink (`#30372f`)**: Màu chữ chính, sắc xanh rêu đậm pha xám than, dễ đọc và nhẹ mắt hơn màu đen thuần `#000000`.
- **Olive (`#46583f`) & Olive Deep (`#344636`)**: Sắc xanh thực vật đặc trưng của Peatea, dùng cho nút bấm chính, biểu tượng, điểm nhấn nhận diện thương hiệu.
- **Muted (`#777a70`)**: Màu chữ phụ, chú thích, ngày tháng.
- **Line (`#e5e5dc`)**: Đường viền ngăn cách tinh tế, mỏng và tiệp với màu nền giấy.

### Dark Palette (Tiệm trà về đêm / Cozy Evening Tea Room & Bistro)
- **Paper Dark (`#161915`)**: Nền đen than ấm pha ánh lá trà thảo mộc, tránh xa màu đen tuyền `#000000` công nghiệp hay xanh tím lạnh lùng.
- **Surface Dark (`#1f231d`)**: Mặt thẻ sản phẩm, panel, modal tựa như bề mặt gỗ sẫm màu trong quán trà ấm cúng.
- **Surface Lifted (`#282e25`)**: Lớp bề mặt nâng cao khi hover hoặc chọn.
- **Ink Dark (`#edece4`)**: Màu chữ trắng gạo nếp ấm áp, độ tương phản 12:1 vượt chuẩn WCAG AAA trên nền tối, không gây lóa mắt.
- **Olive Dark (`#8fa882`)**: Sắc matcha dịu sáng, đảm bảo độ tương phản > 5:1 (đạt WCAG AA 4.5:1) cho liên kết và biểu tượng.
- **Olive Deep Dark (`#a5bf97`)**: Sắc xanh ngọc bích nhạt làm điểm nhấn hover.
- **Muted Dark (`#9fa593`)**: Chữ chú thích, ngày tháng, đạt tương phản 5.2:1 (vượt chuẩn WCAG AA).
- **Line Dark (`#2b3227`)**: Đường viền tre ấm, phân chia không gian tinh tế 1px.

## Typography

- **Headings / Brand**: `Lora` (Serif). Mang lại sự lắng đọng, văn chương, ấm áp. Tiêu đề chính giữ độ đậm vừa phải (400 - 500) và để nội dung tự nói lên trọng lượng, không dùng các từ đệm/kicker vô nghĩa phía trên.
- **Body / Interface**: `Be Vietnam Pro` (Sans-serif). Được thiết kế riêng cho ngôn ngữ tiếng Việt, dấu thanh cân đối, hiển thị sắc nét và tự nhiên ở mọi kích cỡ.
- **Tabular Numerals**: Các vùng hiển thị giá tiền và số liệu đơn hàng sử dụng `font-variant-numeric: tabular-nums` để các chữ số có chiều rộng đều nhau, không nhảy chữ khi thay đổi giá trị.

## Layout

- Chiều rộng nội dung chuẩn trong container `.shell` tối đa 1280px, căn giữa tự nhiên.
- Khoảng cách giữa các nhóm thông tin rõ ràng, ưu tiên khoảng trắng thoáng đãng (breathing room) hơn là dồn nén thông tin vào quá nhiều ô thẻ.

## Elevation & Depth

- Tránh hoàn toàn việc vừa viền đậm vừa đổ bóng nhòe lớn (ghost card).
- Độ nổi được thể hiện qua đường viền tự nhiên mỏng 1px (`#e5e5dc`) kết hợp với bóng đổ rất nhẹ có độ lệch thực tế (`0 4px 14px -2px rgba(52, 70, 54, 0.08)`).
- Không dùng viền màu đơn phương một cạnh (one-sided border) hay hiệu ứng dạ quang lòe loẹt.

## Shapes

- Thẻ sản phẩm và khối hiển thị: Bo góc tự nhiên 12px (`rounded.md`).
- Nút bấm, thanh tìm kiếm, ô nhập liệu: Bo tròn hoàn toàn dạng pill 9999px (`rounded.pill`).

## Components

- **Primary Button**: Nền xanh đậm `#344636`, chữ trắng, không dùng gradient màu đường chéo giả 3D. Hiệu ứng hover nhấc nhẹ 2px với bóng đổ êm ái.
- **Outline Button**: Viền mỏng màu ô liu, nền giấy `#fffefa`, màu chữ ink.
- **Product Card**: Ảnh sản phẩm có tỷ lệ vuông đồng nhất, nhãn trạng thái nhỏ gọn thanh thoát, nút tim yêu thích đặt góc trên ảnh.

## Do's and Don'ts

- **DO**: Giữ lời văn nhẹ nhàng, chân thành, tự nhiên trong tiếng Việt.
- **DO**: Giữ phong cách đồng bộ giữa Lora và Be Vietnam Pro.
- **DON'T**: Không thêm các dòng kicker/eyebrow bằng tiếng Anh viết hoa trên đầu tiêu đề tiếng Việt (ví dụ: `THE PEATEA EDIT`, `A LITTLE CORNER...`).
- **DON'T**: Không dùng font Inter hoặc font mặc định máy tính cho phần giao diện thương hiệu ấm cúng.
- **DON'T**: Không dùng animation nảy liên tục (bounce easing) gây mất tập trung.
- **DON'T**: Không dùng emoji bừa bãi trong các thông báo hệ thống hoặc thông điệp sản phẩm.

## Motion Principles

- **Organic & Tactile**: Chuyển động nhẹ nhàng, tự nhiên như chạm vào bề mặt ấm áp, thủ công.
- **Timing & Curves**:
  - Tương tác phản hồi tức thì (active/tap): 120–150ms.
  - Hover và đổi trạng thái (state transition): 180–240ms.
  - Mở modal / drawer / reveal: 300–360ms với đường cong giảm tốc tự nhiên `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo).
  - Thu hồi (exit): Nhanh hơn lúc xuất hiện (150–200ms).
- **No Spring/Bounce**: Tuyệt đối không dùng easing lò xo nảy qua lại (overshoot / bounce) làm giật khung hình và tạo cảm giác AI giả tạo.
- **Pointer Stability**: Không di chuyển chính thẻ đang hover làm lệch con trỏ chuột (`whileHover={{ y: -4 }}` trên thẻ ngoài). Hãy để bóng đổ sâu hơn và các phần tử con bên trong (ảnh zoom nhẹ, nút quickview trượt lên) thực hiện chuyển động.
- **Accessibility (`prefers-reduced-motion`)**: Giảm biên độ dịch chuyển không gian (spatial movement) thành chuyển đổi mờ/rõ (opacity fade) hoặc đổi màu nhẹ, bảo toàn phản hồi tương tác mà không gây khó chịu cho người dùng.

