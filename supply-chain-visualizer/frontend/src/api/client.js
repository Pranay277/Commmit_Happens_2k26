import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export async function uploadSbom(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function fetchAiInsight(context) {
  const { data } = await api.post("/api/ai-insight", context);
  return data;
}

export default api;
