import { api } from "../lib/api";

export const Backend = {
  overview: (lowStock = 5) =>
    api.get(`/overview?lowStock=${lowStock}`).then((r) => r.data),
  analyticsProducts: () => api.get("/analytics/products").then((r) => r.data),
  advancedAnalytics: (range = "7d") =>
    api.get(`/analytics/advanced?range=${range}`).then((r) => r.data),
  users: (params) => api.get("/users", { params }).then((r) => r.data),
  updateUser: (id, body) => api.patch(`/users/${id}`, body).then((r) => r.data),
  deleteUser: (id) => api.delete(`/users/${id}`).then((r) => r.data),

  products: (params) => api.get("/products", { params }).then((r) => r.data),
  createProduct: (body) => api.post("/products", body).then((r) => r.data),
  updateProduct: (id, body) =>
    api.patch(`/products/${id}`, body).then((r) => r.data),
  deleteProduct: (id) => api.delete(`/products/${id}`).then((r) => r.data),
  overviewAnalytics: (range = "7d") =>
    api.get(`/analytics/overview?range=${range}`).then((r) => r.data),
  orders: (params) => api.get("/orders", { params }).then((r) => r.data),
  orderById: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  updateOrderStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, { status }).then((r) => r.data),
  recentOrders: (limit = 5) =>
    api.get(`/orders/recent?limit=${limit}`).then((r) => r.data),
};
