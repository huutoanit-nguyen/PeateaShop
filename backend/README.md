# 🌸 PeateaShop - Backend RESTful API

> Hệ thống Backend phục vụ nền tảng thương mại điện tử phụ kiện, đồ chơi dễ thương (Squishy, Plushie, Stationery) tích hợp dịch vụ **Order hộ Taobao / Hàng nội địa Trung**.

---

## 📌 Mục Lục

- [1. Giới thiệu tổng quan](#1-giới-thiệu-tổng-quan)
- [2. Công nghệ sử dụng (Tech Stack)](#2-công-nghệ-sử-dụng-tech-stack)
- [3. Kiến trúc hệ thống](#3-kiến-trúc-hệ-thống)
- [4. Cấu trúc thư mục](#4-cấu-trúc-thư-mục)
- [5. Thiết kế Cơ sở Dữ liệu (Database Schema)](#5-thiết-kế-cơ-sở-dữ-liệu-database-schema)
- [6. Các tính năng chính](#6-các-tính-năng-chính)
- [7. Tài liệu API Endpoints](#7-tài-liệu-api-endpoints)
- [8. Cơ chế Bảo mật & Tối ưu](#8-cơ-chế-bảo-mật--tối-ưu)
- [9. Hướng dẫn Cài đặt & Khởi chạy](#9-hướng-dẫn-cài-đặt--khởi-chạy)
- [10. Dữ liệu mẫu (Data Seeding)](#10-dữ-liệu-mẫu-data-seeding)

---

## 1. Giới thiệu tổng quan

**PeateaShop Backend** là dịch vụ API trung tâm được xây dựng trên nền tảng **Spring Boot 3** và **Java 17**, tuân thủ nghiêm ngặt tiêu chuẩn thiết kế **RESTful API** và kiến trúc đa tầng (Layered Architecture). 

Hệ thống giải quyết 2 bài toán nghiệp vụ trọng tâm:
1. **E-Commerce Shop**: Bán lẻ các sản phẩm quà tặng, squishy, gấu bông, văn phòng phẩm; quản lý phân loại danh mục, giỏ hàng, đặt hàng, tự động quản lý tồn kho và xác nhận thanh toán (COD / Chuyển khoản ngân hàng kèm biên lai ảnh).
2. **Taobao Order Proxy (Order Hộ)**: Tiếp nhận yêu cầu mua sắm hộ từ sàn Taobao/1688 của khách hàng, theo dõi toàn bộ vòng đời vận chuyển từ Trung Quốc về Việt Nam (từ duyệt đơn, đặt hàng bên Trung, hàng xuất kho TQ đến khi giao tận tay khách).

---

## 2. Công nghệ sử dụng (Tech Stack)

| Hạng mục | Công nghệ | Phiên bản / Chi tiết |
| :--- | :--- | :--- |
| **Ngôn ngữ** | Java | 17 LTS |
| **Framework chính** | Spring Boot | 3.2.0 |
| **Bảo mật** | Spring Security 6 & JJWT | JSON Web Token (0.11.5), Stateless Authentication |
| **ORM / Database Access** | Spring Data JPA / Hibernate | Tối ưu hóa truy vấn với Derived Queries & JPQL |
| **Cơ sở dữ liệu** | MySQL | 8.0+ |
| **Media Cloud Storage** | Cloudinary SDK | 1.38.0 (Lưu trữ ảnh sản phẩm, biên lai thanh toán) |
| **Chống Brute-force & DDoS** | Bucket4j | 8.7.0 (Token Bucket Rate Limiting per IP) |
| **Quản lý biến môi trường**| Spring Dotenv | 4.0.0 (Tự động nạp file `.env`) |
| **Boilerplate Reduction** | Project Lombok | Tự động sinh Getter, Setter, Builder, Constructor |
| **Build Tool** | Apache Maven | 3.8+ |

---

## 3. Kiến trúc hệ thống

Dự án áp dụng mô hình kiến trúc phân lớp chuẩn mực của hệ sinh thái Spring Enterprise:

```
[ Client: Web / Mobile / Postman ]
                 │
                 ▼
     [ RateLimitFilter (Bucket4j) ]   <-- Giới hạn request theo IP
                 │
                 ▼
     [ JwtAuthFilter & Security ]    <-- Kiểm tra Token Bearer & Phân quyền
                 │
                 ▼
         [ Controllers ]              <-- Tiếp nhận HTTP Request, Validate DTO
                 │
                 ▼
         [ Service Layer ]            <-- Xử lý nghiệp vụ logic, Quản lý Transaction
                 │
                 ▼
        [ Repository Layer ]          <-- Spring Data JPA / Hibernate Queries
                 │
                 ▼
        [ MySQL Database ]            <-- Lưu trữ dữ liệu quan hệ
                 ▲
                 │ (Upload / Xóa ảnh)
       [ Cloudinary Service ]
```

---

## 4. Cấu trúc thư mục

```
backend/
├── pom.xml                               # File cấu hình dependencies Maven
├── .env.example                          # Mẫu cấu hình biến môi trường
├── src/
│   └── main/
│       ├── resources/
│       │   └── application.properties    # Cấu hình Spring Boot, DataSource, JWT, Cloudinary
│       └── java/
│           └── com/
│               └── cuteshop/
│                   ├── CuteShopApplication.java      # Điểm khởi chạy (Main Application)
│                   │
│                   ├── config/                       # Các cấu hình hệ thống
│                   │   ├── AppConfig.java            # Cấu hình Bean dùng chung
│                   │   ├── CloudinaryConfig.java     # Kết nối Cloudinary API
│                   │   ├── DataSeeder.java           # Tự động nạp dữ liệu mẫu ban đầu
│                   │   ├── RateLimitFilter.java      # Bộ lọc giới hạn tần suất gọi API
│                   │   └── SecurityConfig.java       # Phân quyền Security, CORS, Password Encoder
│                   │
│                   ├── controller/                   # Tầng điều hướng REST Controllers
│                   │   ├── AdminController.java      # Dashboard thống kê & quản lý khách hàng
│                   │   ├── AuthController.java       # Đăng ký, đăng nhập, hồ sơ cá nhân
│                   │   ├── CategoryController.java   # Quản lý danh mục
│                   │   ├── ImageController.java      # Upload & xóa media Cloudinary
│                   │   ├── OrderController.java      # Đặt hàng, theo dõi đơn, duyệt đơn
│                   │   ├── ProductController.java    # Tìm kiếm, lọc, CRUD sản phẩm
│                   │   └── TaobaoOrderController.java# Đặt hàng hộ Taobao & cập nhật tiến độ
│                   │
│                   ├── dto/                          # Data Transfer Objects
│                   │   ├── request/                  # DTO nhận vào từ client (có Validation)
│                   │   │   ├── AuthRequest.java
│                   │   │   ├── CreateOrderRequest.java
│                   │   │   ├── CreateTaobaoOrderRequest.java
│                   │   │   └── ProductRequest.java
│                   │   └── response/
│                   │       └── ResponseDTOs.java     # DTO chuẩn hóa trả lời (ApiResponse<T>, ...)
│                   │
│                   ├── entity/                       # Tầng thực thể JPA Entity (Mapping DB)
│                   │   ├── BaseEntity.java           # Abstract class chứa createdAt, updatedAt
│                   │   ├── Category.java             # Danh mục sản phẩm
│                   │   ├── Order.java                # Đơn đặt hàng của shop
│                   │   ├── OrderItem.java            # Chi tiết từng món trong đơn hàng
│                   │   ├── Product.java              # Thông tin sản phẩm & biến thể
│                   │   ├── TaobaoOrder.java          # Đơn đặt hàng hộ Taobao
│                   │   └── User.java                 # Tài khoản người dùng (ADMIN, CUSTOMER)
│                   │
│                   ├── exception/                    # Xử lý lỗi toàn cục
│                   │   └── GlobalExceptionHandler.java # Bắt và chuẩn hóa mã lỗi trả về
│                   │
│                   ├── repository/                   # Tầng thao tác CSDL Spring Data JPA
│                   │   ├── CategoryRepository.java
│                   │   ├── OrderRepository.java
│                   │   ├── ProductRepository.java
│                   │   ├── TaobaoOrderRepository.java
│                   │   └── UserRepository.java
│                   │
│                   ├── security/                     # Xử lý xác thực JWT
│                   │   ├── JwtAuthFilter.java        # Filter trích xuất và xác thực Token
│                   │   ├── JwtUtils.java             # Tiện ích sinh & giải mã JWT
│                   │   └── UserDetailsServiceImpl.java # Nạp thông tin người dùng cho Security
│                   │
│                   └── service/                      # Tầng nghiệp vụ xử lý Logic
│                       └── impl/
│                           ├── CloudinaryService.java
│                           ├── OrderServiceImpl.java
│                           ├── ProductServiceImpl.java
│                           └── TaobaoOrderServiceImpl.java
```

---

## 5. Thiết kế Cơ sở Dữ liệu (Database Schema)

Dự án sử dụng cơ sở dữ liệu quan hệ MySQL với 6 bảng chính và 2 bảng phụ lưu trữ danh sách:

```
 users (id, email, password, full_name, phone, role, active, ...)
   │
   ├──< orders (id, order_code, user_id, recipient_*, subtotal, total, status, ...)
   │       │
   │       └──< order_items (id, order_id, product_id, quantity, unit_price, total_price)
   │
   ├──< taobao_orders (id, order_code, user_id, taobao_link, status, tracking_number, ...)
   │
 categories (id, name, description, image_url, active)
   │
   └──< products (id, category_id, name, price, stock, active, new_arrival, featured, sold_count)
           │
           ├──< product_images (product_id, image_url)
           └──< product_variants (product_id, variant)
```

### Chi tiết các bảng:
1. **`users`**: Quản lý thông tin tài khoản người dùng và quản trị viên (`Role.ADMIN`, `Role.CUSTOMER`).
2. **`categories`**: Phân loại mặt hàng (Squishy, Plushie, Stationery,...).
3. **`products`**: Thông tin mặt hàng, giá bán, số lượng tồn kho (`stock`), số lượng đã bán (`sold_count`), trạng thái nổi bật (`featured`), hàng mới về (`new_arrival`).
   - `product_images`: Lưu trữ danh sách URLs hình ảnh của sản phẩm.
   - `product_variants`: Danh sách phân loại (màu sắc, kích cỡ: Pink, Mint, Blue...).
4. **`orders`**: Quản lý đơn hàng mua sắm tại shop.
   - Trạng thái đơn (`status`): `PENDING` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `COMPLETED` / `CANCELLED`.
   - Phương thức thanh toán (`paymentMethod`): `COD` (Thanh toán khi nhận) hoặc `BANK_TRANSFER` (Chuyển khoản).
   - Trạng thái thanh toán (`paymentStatus`): `PENDING`, `PAID`, `REFUNDED`.
   - `paymentProofUrl`: Ảnh chụp biên lai thanh toán do khách hàng tải lên.
5. **`order_items`**: Chi tiết từng sản phẩm bên trong đơn hàng (giá mua tại thời điểm đặt, số lượng, phân loại đã chọn).
6. **`taobao_orders`**: Quản lý các yêu cầu đặt mua hộ hàng Taobao/1688.
   - Trạng thái (`status`): `NEW` ➔ `CONFIRMED` ➔ `ORDERED_ON_TAOBAO` ➔ `SHIPPED_FROM_CHINA` ➔ `DELIVERED` / `CANCELLED`.
   - `trackingNumber`: Mã vận đơn theo dõi lô hàng quốc tế.

---

## 6. Các tính năng chính

### 🛡️ 1. Xác thực & Quản lý Người dùng
- Đăng ký tài khoản khách hàng mới có kiểm tra trùng lặp email và kiểm tra ràng buộc số điện thoại/họ tên.
- Đăng nhập xác thực bằng mật khẩu đã được mã hóa **BCrypt**.
- Cơ chế cấp phát mã thông báo **JWT (Bearer Token)** với thời gian sống 24 giờ.
- Endpoint lấy thông tin tài khoản hiện tại (`/api/auth/me`), cập nhật hồ sơ (`fullName`, `phone`, `address`, `city`, `province`) và đổi mật khẩu an toàn.

### 📦 2. Quản lý Danh mục & Sản phẩm
- Danh mục sản phẩm động: Khách hàng xem danh mục đang hoạt động kèm số lượng sản phẩm con; Admin có toàn quyền Thêm / Sửa / Xóa danh mục.
- Tìm kiếm & Lọc sản phẩm nâng cao:
  - Tìm kiếm theo từ khóa tên sản phẩm (không phân biệt chữ hoa/thường).
  - Lọc theo danh mục (`categoryId`).
  - Lọc theo khoảng giá (`minPrice` - `maxPrice`).
  - Lọc sản phẩm mới về (`newArrival`) hoặc nổi bật (`featured`).
  - Sắp xếp linh hoạt: Mới nhất (`newest`), Giá tăng dần (`price_asc`), Giá giảm dần (`price_desc`), Bán chạy nhất (`popular`).
- Quản lý kho hàng & ảnh tự động: Khi Admin xóa hoặc cập nhật ảnh sản phẩm, hệ thống tự động gọi Cloudinary API để xóa file ảnh thừa trên đám mây, tối ưu hóa dung lượng lưu trữ.

### 🛒 3. Quy trình Xử lý Đơn hàng (E-Commerce)
- Đặt hàng an toàn giao dịch (`@Transactional`):
  - Tự động kiểm tra số lượng tồn kho của từng sản phẩm.
  - Trừ kho tức thời và tăng chỉ số đã bán (`soldCount`).
  - Tự sinh mã đơn hàng chuẩn định dạng (`#1001`, `#1002`...).
- Upload ảnh minh chứng chuyển khoản: Khách hàng tải ảnh biên lai chuyển khoản trực tiếp qua endpoint riêng để Admin xác nhận thanh toán.
- Admin quản lý đơn hàng: Tìm kiếm theo mã đơn/tên/SĐT khách, lọc theo ngày tạo và trạng thái, cập nhật ghi chú nội bộ (`adminNote`).

### 🇨🇳 4. Dịch vụ Order Hộ Taobao (Forwarding & Proxy)
- Tiếp nhận đơn đặt hàng từ link Taobao: Khách hàng (kể cả khách vãng lai không cần đăng nhập) có thể gửi yêu cầu đặt hàng với link sản phẩm, mô tả, số lượng, màu/size và giá ước tính (CNY).
- Nếu khách đã đăng nhập, đơn Taobao sẽ được tự động gắn với tài khoản của khách để tiện theo dõi trong mục "Đơn Taobao của tôi".
- Mã đơn tự động: `TB-2001`, `TB-2002`...
- Quy trình chuẩn hóa trạng thái chuỗi cung ứng: Khách gửi đơn ➔ Admin xác nhận ➔ Đặt mua bên Trung Quốc ➔ Xuất kho vận chuyển về VN ➔ Giao hàng thành công.

### 📊 5. Dashboard Báo cáo & Thống kê
- Cung cấp chỉ số thời gian thực:
  - Tổng số lượng đơn hàng, số đơn chờ xử lý (`PENDING`), số đơn đang giao (`PROCESSING`).
  - Tổng doanh thu trong ngày hôm nay từ các đơn hoàn thành.
  - Tổng số lượng khách hàng đăng ký và số lượng yêu cầu đặt Taobao mới.
  - Biểu đồ thống kê số lượng đơn hàng trong 7 ngày gần nhất.
  - Danh sách 5 đơn hàng mới nhất cần xử lý.
- Danh sách quản lý khách hàng phân trang và tìm kiếm theo tên/email.

---

## 7. Tài liệu API Endpoints

> **Base URL**: `http://localhost:8080/api`  
> **Headers bắt buộc khi gọi API bảo mật**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`

### 7.1. Authentication (Xác thực)

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Đăng ký tài khoản mới |
| `POST` | `/auth/login` | Public | Đăng nhập lấy Bearer JWT |
| `GET` | `/auth/me` | Authenticated | Lấy thông tin user đăng nhập hiện tại |
| `PUT` | `/auth/auth/profile` | Authenticated | Cập nhật thông tin cá nhân |
| `PUT` | `/auth/auth/password` | Authenticated | Thay đổi mật khẩu |

### 7.2. Categories (Danh mục)

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/categories` | Public | Lấy danh sách danh mục đang active |
| `POST` | `/admin/categories` | Admin | Tạo danh mục mới |
| `PUT` | `/admin/categories/{id}` | Admin | Cập nhật danh mục |
| `DELETE` | `/admin/categories/{id}` | Admin | Xóa danh mục |

### 7.3. Products (Sản phẩm)

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Public | Xem danh sách sản phẩm (phân trang: `page`, `size`) |
| `GET` | `/products/featured` | Public | Lấy danh sách sản phẩm nổi bật |
| `GET` | `/products/new-arrivals` | Public | Lấy danh sách sản phẩm mới về |
| `GET` | `/products/{id}` | Public | Xem chi tiết 1 sản phẩm |
| `GET` | `/products/search` | Public | Tìm kiếm & lọc (keyword, categoryId, minPrice, maxPrice, newArrival, sort, page, size) |
| `POST` | `/admin/products` | Admin | Tạo sản phẩm mới |
| `PUT` | `/admin/products/{id}` | Admin | Cập nhật sản phẩm |
| `DELETE` | `/admin/products/{id}` | Admin | Xóa sản phẩm |
| `PATCH`| `/admin/products/{id}/toggle` | Admin | Bật/Tắt trạng thái hoạt động sản phẩm |

### 7.4. Orders (Đơn hàng Shop)

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | Authenticated | Đặt hàng từ giỏ hàng |
| `GET` | `/orders/my` | Authenticated | Xem lịch sử đơn hàng của bản thân |
| `GET` | `/orders/{id}` | Authenticated | Xem chi tiết đơn hàng |
| `PATCH`| `/orders/{id}/payment-proof` | Authenticated | Tải lên ảnh biên lai chuyển khoản (Multipart file) |
| `GET` | `/admin/orders` | Admin | Danh sách đơn hàng toàn shop (lọc keyword, status, date) |
| `PATCH`| `/admin/orders/{id}/status` | Admin | Cập nhật trạng thái đơn hàng (`status`, `adminNote`) |
| `PATCH`| `/admin/orders/{id}/payment` | Admin | Cập nhật trạng thái thanh toán (`paymentStatus`) |

### 7.5. Taobao Orders (Đơn Order Hộ Taobao)

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/taobao-orders` | Public / Customer | Gửi form yêu cầu đặt mua hộ hàng Taobao |
| `GET` | `/taobao-orders/my` | Authenticated | Xem danh sách đơn Taobao của tài khoản hiện tại |
| `GET` | `/admin/taobao-orders` | Admin | Quản lý danh sách đơn Taobao (phân trang, lọc) |
| `PATCH`| `/admin/taobao-orders/{id}/status` | Admin | Cập nhật trạng thái, mã vận đơn (`trackingNumber`), ghi chú |

### 7.6. Admin Analytics & Media Management

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/dashboard` | Admin | Thống kê số liệu, doanh thu hôm nay, biểu đồ 7 ngày |
| `GET` | `/admin/customers` | Admin | Danh sách khách hàng kèm tìm kiếm, phân trang |
| `POST` | `/admin/images/upload` | Admin | Upload 1 file ảnh lên Cloudinary (Trả về URL ảnh tối ưu) |
| `POST` | `/admin/images/upload-multiple` | Admin | Upload nhiều ảnh cùng lúc lên Cloudinary |
| `DELETE`| `/admin/images/delete` | Admin | Xóa ảnh khỏi Cloudinary qua URL |

---

## 8. Cơ chế Bảo mật & Tối ưu

1. **Chuẩn hóa phản hồi API (Standardized Response Envelope)**:
   Mọi API đều trả về thống nhất theo cấu trúc:
   ```json
   {
     "success": true,
     "message": "Success",
     "data": { ... }
   }
   ```
2. **Rate Limiting với Bucket4j**:
   - Nhóm Auth (`/api/auth/login`, `/api/auth/register`): Giới hạn **10 requests / 1 phút / 1 IP** nhằm ngăn chặn tấn công dò mật khẩu (Brute-force).
   - Nhóm API chung: Giới hạn **100 requests / 1 phút / 1 IP**.
   - Khi vượt quá giới hạn, server trả về `HTTP 429 Too Many Requests`.
3. **Quản lý lỗi tập trung (`GlobalExceptionHandler`)**:
   - Tự động bắt lỗi xác thực dữ liệu đầu vào (`MethodArgumentNotValidException`), sai tài khoản/mật khẩu (`BadCredentialsException`), không đủ quyền (`AccessDeniedException`) và trả về JSON thân thiện.
4. **Tối ưu hình ảnh đám mây (Cloudinary Transformations)**:
   - Ảnh khi upload được tự động giới hạn độ phân giải (800x800 limit), chuyển đổi định dạng tối ưu nhất theo trình duyệt (`fetchFormat: auto`) và nén dung lượng mà không suy giảm chất lượng (`quality: auto`).

---

## 9. Hướng dẫn Cài đặt & Khởi chạy

### 9.1. Yêu cầu hệ thống
- **Java**: JDK 17 trở lên (`java -version`)
- **Maven**: 3.8 trở lên (`mvn -version`)
- **MySQL**: Phiên bản 8.0 trở lên

### 9.2. Tạo Database MySQL
Đăng nhập vào MySQL và tạo database rỗng:
```sql
CREATE DATABASE peatea_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 9.3. Cấu hình biến môi trường
Tạo file `.env` tại thư mục `backend/` dựa trên mẫu `.env.example`:
```ini
# Database
DB_URL=jdbc:mysql://localhost:3306/peatea_db?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# JWT
# Tạo secret riêng bằng lệnh: openssl rand -base64 32
# Ứng dụng sẽ không khởi động nếu JWT_SECRET bị thiếu hoặc không đủ độ dài.
JWT_SECRET=

# Admin mặc định (dùng để seed tài khoản đầu tiên)
ADMIN_EMAIL=admin@squishyheaven.ph
# Bắt buộc khi khởi động lần đầu với database trống; dùng mật khẩu riêng tối thiểu 12 ký tự.
ADMIN_PASSWORD=

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=peatea_squishy

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 9.4. Build và Chạy ứng dụng
Mở terminal tại thư mục `backend/`:

1. Tải dependencies và đóng gói ứng dụng:
   ```bash
   mvn clean install -DskipTests
   ```
2. Chạy ứng dụng Spring Boot:
   ```bash
   mvn spring-boot:run
   ```
   *Hoặc chạy file JAR:*
   ```bash
   java -jar target/cute-shop-backend-1.0.0.jar
   ```

Khi khởi chạy thành công, console sẽ hiển thị thông báo:
```
Tomcat started on port 8080 (http) with context path '/api'
Started CuteShopApplication in ... seconds
```

---

## 10. Dữ liệu mẫu (Data Seeding)

Khi khởi động lần đầu với database trống, hệ thống (`DataSeeder`) sẽ tự động tạo dữ liệu mẫu bao gồm:

- **Tài khoản Quản trị viên (Admin)**:
  - Email: `admin@squishyheaven.ph` (hoặc email cấu hình trong `ADMIN_EMAIL`)
  - Password: mật khẩu cấu hình trong `ADMIN_PASSWORD` (bắt buộc, tối thiểu 12 ký tự)
  - Role: `ROLE_ADMIN`
- **Tài khoản Khách hàng mẫu**:
  - Email: `maria@email.com`
  - Password: `password`
  - Role: `ROLE_CUSTOMER`
- **3 Danh mục mặc định**: *Squishy*, *Plushie*, *Stationery*.
- **Các sản phẩm demo ban đầu** kèm ảnh Unsplash, tồn kho và các biến thể màu sắc.
