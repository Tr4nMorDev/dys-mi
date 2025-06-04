import client from "prom-client";

export const metrics = new client.Registry();
client.collectDefaultMetrics({ register: metrics });

export const wsConnectedClients = new client.Gauge({
  name: "ws_connected_clients",
  help: "Số client đang kết nối WebSocket",
});

export const matchesCreated = new client.Counter({
  name: "matches_created_total",
  help: "Số trận được tạo trong game",
});
export const registeredUsers = new client.Counter({
  name: "registered_users_total",
  help: "Tổng số người dùng đã đăng ký",
});
// Tổng số trận được lưu vào Redis
export const matchCacheStored = new client.Counter({
  name: "match_cache_stored_total",
  help: "Tổng số trận được lưu vào Redis cache",
});

// Tổng số trận lấy từ Redis (cache hit)
export const matchCacheHit = new client.Counter({
  name: "match_cache_hit_total",
  help: "Tổng số lần lấy trận từ Redis cache (hit)",
});

// Tổng số trận không có trong Redis (cache miss)
export const matchCacheMiss = new client.Counter({
  name: "match_cache_miss_total",
  help: "Tổng số lần không có trận trong Redis cache (miss)",
});

// Histogram đo thời lượng trung bình một ván
export const matchDuration = new client.Histogram({
  name: "match_duration_seconds",
  help: "Thời lượng các trận đấu (tính bằng giây)",
  buckets: [30, 60, 120, 300, 600], // tuỳ theo thời gian ván
});
// Auth qua Google
export const loginGoogle = new client.Counter({
  name: "login_google_total",
  help: "Số lần đăng nhập bằng Google",
});

// Auth qua GitHub
// export const loginGithub = new client.Counter({
//   name: "login_github_total",
//   help: "Số lần đăng nhập bằng GitHub",
// });

// Auth qua JWT truyền thống
export const loginJwt = new client.Counter({
  name: "login_jwt_total",
  help: "Số lần đăng nhập bằng JWT truyền thống",
});
export const wsClientDisconnect = new client.Counter({
  name: "ws_client_disconnected_total",
  help: "Tổng số lần client WebSocket ngắt kết nối",
});

export const wsError = new client.Counter({
  name: "ws_error_total",
  help: "Tổng số lỗi WebSocket xảy ra",
});

metrics.registerMetric(registeredUsers);
metrics.registerMetric(wsConnectedClients);
metrics.registerMetric(matchesCreated);
