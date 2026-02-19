import http from "./http";

export const updateProfile = async (id, data) => {
  const response = await http.put(`/employees/${id}`, data);
  return response.data;
};
