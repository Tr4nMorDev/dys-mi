import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  vus: 50, // số lượng user ảo chạy đồng thời/auth/signup
  duration: "10s", // tổng thời gian chạy
};

export default function () {
  const url = "http://localhost:3000/auth/signup"; // cập nhật đúng endpoint nếu khác

  const payload = JSON.stringify({
    name: `User${Math.floor(Math.random() * 10000)}`,
    email: `user${Math.floor(Math.random() * 10000)}@example.com`,
    password: "12345678",
  });

  const headers = { "Content-Type": "application/json" };

  const res = http.post(url, payload, { headers });

  check(res, {
    "status is 201": (r) => r.status === 201,
    "has token": (r) => r.json("token") !== undefined,
  });

  sleep(1); // mỗi user ảo nghỉ 1s trước khi gửi lại
}
