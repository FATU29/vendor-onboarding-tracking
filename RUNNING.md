# Hướng dẫn chạy bằng Docker

Yêu cầu: Docker Desktop đang chạy.

## Khởi động ứng dụng

```bash
docker compose up --build
```

Mở [http://localhost:8080](http://localhost:8080), sau đó đăng nhập bằng **Linh**, **Huy** hoặc **Mai**. Không cần mật khẩu.

## Dừng ứng dụng

```bash
docker compose down
```

## Xóa dữ liệu và chạy lại

```bash
docker compose down -v
docker compose up --build
```
