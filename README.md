# PeateaShop

PeateaShop là ứng dụng thương mại điện tử full-stack dành cho sản phẩm squishy, plushie và đồ dùng dễ thương, có tích hợp dịch vụ đặt hàng hộ Taobao.

## Tính năng

- Duyệt danh mục, tìm kiếm, xem sản phẩm nổi bật và sản phẩm mới.
- Đăng ký, đăng nhập, đăng nhập Google và quản lý hồ sơ cá nhân.
- Thêm sản phẩm vào giỏ hàng, lưu yêu thích và theo dõi thông báo.
- Tạo đơn hàng với thông tin thanh toán và biên lai chuyển khoản.
- Tạo đơn đặt hộ Taobao và theo dõi trạng thái xử lý.
- Trang quản trị cho dashboard, sản phẩm, danh mục, đơn hàng, khách hàng và đơn Taobao.
- Xác thực JWT, phân quyền người dùng/quản trị viên và giới hạn tần suất gọi API.
- Tải và quản lý hình ảnh qua Cloudinary.

## Công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, HeroUI |
| Quản lý trạng thái | Zustand, TanStack React Query |
| HTTP client | Axios |
| Backend | Java 21, Spring Boot 3.2, Spring Security |
| Cơ sở dữ liệu | PostgreSQL, Spring Data JPA, Hibernate |
| Xác thực | JWT, Google OAuth |
| Media | Cloudinary |
| Build/Test | Maven, JUnit, Spring Test |

## Cấu trúc thư mục

```text
PeateaShop/
├── frontend/               # Ứng dụng React + TypeScript
│   ├── src/
│   │   ├── components/     # Thành phần giao diện dùng chung
│   │   ├── pages/          # Trang khách hàng và trang quản trị
│   │   ├── services/       # Gọi API bằng Axios
│   │   ├── store/          # Trạng thái Zustand
│   │   └── context/        # Context cho hiệu ứng cuộn
│   └── package.json
├── backend/                # REST API Spring Boot
│   ├── src/main/java/com/cuteshop/
│   │   ├── controller/     # REST controllers
│   │   ├── service/        # Nghiệp vụ
│   │   ├── repository/     # Truy cập cơ sở dữ liệu
│   │   ├── entity/         # Entity JPA
│   │   ├── dto/            # Request/response DTO
│   │   ├── security/       # JWT và UserDetails
│   │   └── config/         # Security, CORS, seeding, Cloudinary
│   └── pom.xml
└── README.md
```

## Yêu cầu

- Java 21
- Maven 3.8 trở lên
- Node.js 18 trở lên
- PostgreSQL 14 trở lên
- Tài khoản Cloudinary nếu sử dụng tính năng tải ảnh
- Google OAuth Client ID nếu sử dụng đăng nhập Google

## Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/huutoanit-nguyen/PeateaShop.git
cd PeateaShop
```

### 2. Cấu hình backend

Tạo cơ sở dữ liệu PostgreSQL:

```sql
CREATE DATABASE peatea_db;
```

Tạo file môi trường:

```bash
cd backend
cp .env.example .env
```

Cập nhật các biến trong `backend/.env`:

| Biến | Mô tả |
| --- | --- |
| `DB_URL` | URL JDBC PostgreSQL |
| `DB_USERNAME` | Tên đăng nhập PostgreSQL |
| `DB_PASSWORD` | Mật khẩu PostgreSQL |
| `JWT_SECRET` | Chuỗi bí mật dùng ký JWT |
| `ADMIN_EMAIL` | Email tài khoản quản trị được seed |
| `ADMIN_PASSWORD` | Mật khẩu tài khoản quản trị |
| `CLOUDINARY_CLOUD_NAME` | Cloud name của Cloudinary |
| `CLOUDINARY_API_KEY` | API key của Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret của Cloudinary |
| `CLOUDINARY_FOLDER` | Thư mục lưu ảnh Cloudinary |
| `CORS_ORIGINS` | Danh sách origin frontend, phân cách bằng dấu phẩy |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |

Sinh khóa JWT bằng OpenSSL:

```bash
openssl rand -base64 32
```

### 3. Cấu hình frontend

```bash
cd ../frontend
cp .env.example .env
```

Khi chạy local, giá trị mặc định của Axios là `/api` và backend đang chạy ở port `8080` với context path `/api`.

Chỉ đặt `VITE_API_URL` khi frontend và backend chạy ở các origin hoặc host khác nhau:

```dotenv
VITE_API_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## Chạy ứng dụng

Mở hai terminal.

### Terminal 1 - Backend

```bash
cd backend
mvn spring-boot:run
```

Backend chạy tại `http://localhost:8080/api`.

### Terminal 2 - Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend mặc định chạy tại `http://localhost:5173`.

## Kiểm thử

Chạy toàn bộ test của backend:

```bash
cd backend
mvn test
```

Kiểm tra build frontend:

```bash
cd frontend
npm run build
```

## Tài liệu liên quan

- [README backend](./backend/README.md)
- [Cấu hình backend](./backend/src/main/resources/application.properties)
- [Cấu hình frontend](./frontend/.env.example)
