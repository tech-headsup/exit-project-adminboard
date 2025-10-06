import { API_BASE_URL, API_ENDPOINTS } from "@/constant/apiEnpoints";

export const getImageUrl = (imageId: string | undefined): string => {
  if (!imageId) return "";
  // If it's already a full URL, return it
  if (imageId.startsWith("http://") || imageId.startsWith("https://")) {
    return imageId;
  }
  // Otherwise, construct the URL using the API endpoint
  return `${API_BASE_URL}${API_ENDPOINTS.STORAGE_BUCKET.RETRIEVE_PUBLIC}/${imageId}`;
};

export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.STORAGE_BUCKET.UPLOAD}`,
      {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url || data.data?.url || null;
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
};
