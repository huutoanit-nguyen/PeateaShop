# PeateaShop Backend

REST API của PeateaShop được xây dựng bằng Java 21 và Spring Boot 3.2.

## Công nghệ

- Spring Web
- Spring Security 6
- JWT
- Spring Data JPA và Hibernate
- PostgreSQL
- Cloudinary
- Bucket4j
- Google OAuth
- Maven

## Chức năng

- Xác thực, phân quyền và quản lý hồ sơ người dùng.
- Quản lý danh mục và sản phẩm.
- Giỏ hàng, đặt hàng và cập nhật trạng thái đơn hàng.
- Tạo và theo dõi đơn đặt hàng hộ Taobao.
- Dashboard quản trị, thống kê đơn hàng và danh sách khách hàng.
- Tải/xóa hình ảnh lên Cloudinary.
- Seed tài khoản quản trị và dữ liệu ban đầu.

## Cấu trúc

```text
src/main/java/com/cuteshop/
├── config/       # Cấu hình ứng dụng, bảo mật, CORS và dữ liệu mẫu
├── controller/   # REST endpoints
├── dto/          # Request và response DTO
├── entity/       # Entity JPA
├── exception/    # Xử lý exception toàn cục
├── repository/   # Spring Data repositories
├── security/     # JWT authentication và authorization
└── service/      # Xử lý nghiệp vụ
```

## Cấu hình

Tạo PostgreSQL database và copy file mẫu:

```bash
cp .env.example .env
```

Xem mô tả đầy đủ các biến môi trường tại [README gốc](../README.md#cài-đặt).

## Chạy ứng dụng

```bash
mvn spring-boot:run
```

API chạy tại `http://localhost:8080/api`.

## Chạy test

```bash
mvn test
```
