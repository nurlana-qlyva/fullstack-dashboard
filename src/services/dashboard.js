import { api } from "../lib/api";

export const DashboardAPI = {
  overview: (lowStock = 5) =>
    api.get(`/overview?lowStock=${lowStock}`).then((r) => r.data),
  productAnalytics: () => api.get("/analytics/products").then((r) => r.data),

  users: (params) => api.get("/users", { params }).then((r) => r.data),
  products: (params) => api.get("/products", { params }).then((r) => r.data),

  updateUser: (id, body) => api.patch(`/users/${id}`, body).then((r) => r.data),
  deleteUser: (id) => api.delete(`/users/${id}`).then((r) => r.data),

  createProduct: (body) => api.post("/products", body).then((r) => r.data),
  updateProduct: (id, body) =>
    api.patch(`/products/${id}`, body).then((r) => r.data),
  deleteProduct: (id) => api.delete(`/products/${id}`).then((r) => r.data),
};
