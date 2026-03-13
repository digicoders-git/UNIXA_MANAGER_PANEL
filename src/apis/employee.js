import http from "./http";

export const updateProfile = async (id, data) => {
  const response = await http.put(`/employees/${id}`, data);
  return response.data;
};

export const uploadProfilePicture = async (id, file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  const response = await http.put(`/employees/${id}/profile-picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
