# 🌸 PeateaShop - Backend System

Chào mừng bạn đến với kho lưu trữ mã nguồn **PeateaShop**. Thư mục này bao gồm toàn bộ mã nguồn và tài liệu của hệ thống **Backend RESTful API**.

---

## 📖 Tài liệu chi tiết Backend
Toàn bộ tài liệu chi tiết về kiến trúc, danh sách API, thiết kế cơ sở dữ liệu và hướng dẫn cài đặt nằm tại:
👉 [**backend/README.md**](./backend/README.md)

---

## 🚀 Giới thiệu ngắn về Backend

- **Nền tảng**: Java 21 LTS, Spring Boot 3.2.0
- **Cơ sở dữ liệu**: MySQL 8.0 với Spring Data JPA & Hibernate
- **Bảo mật**: Spring Security 6, JWT Stateless Authentication (JJWT), mã hóa mật khẩu BCrypt
- **Chống Brute-force & DDoS**: Bucket4j Token Bucket Rate Limiting (10 req/phút cho Auth, 100 req/phút cho API)
- **Lưu trữ đa phương tiện**: Cloudinary SDK (tự động nén và resize ảnh sản phẩm & biên lai)
- **Nghiệp vụ cốt lõi**:
  1. **E-Commerce Shop**: Danh mục, sản phẩm đa biến thể, giỏ hàng, đặt hàng trừ kho tự động, tải biên lai chuyển khoản ngân hàng.
  2. **Dịch vụ Order Hộ Taobao**: Nhận link Taobao, theo dõi quy trình đặt hàng Trung Quốc - Việt Nam kèm mã vận đơn.
  3. **Quản trị & Thống kê**: Bảng điều khiển doanh thu, biểu đồ đơn hàng 7 ngày, quản lý khách hàng và phân quyền Admin.

---

## 🛠️ Hướng dẫn chạy nhanh Backend

```bash
# 1. Chuyển vào thư mục backend
cd backend

# 2. Tạo file cấu hình môi trường
cp .env.example .env
# Chỉnh sửa thông tin database và credentials trong .env

# 3. Khởi chạy ứng dụng
mvn spring-boot:run
```

API sẽ khởi chạy tại: `http://localhost:8080/api`

