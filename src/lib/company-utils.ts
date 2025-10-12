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
    console.log("Upload response:", data); // Debug log to see the actual response structure

    // Return the file ID (not the URL) - the backend should return the file ID
    // We store the ID and use getImageUrl() to construct the full URL when needed
    // Try different possible field names that might contain the file ID
    const fileId =
      data.id ||
      data.data?.id ||
      data.fileId ||
      data.data?.fileId ||
      data.key ||
      data.data?.key ||
      data._id ||
      data.data?._id ||
      null;

    if (!fileId) {
      console.error("Could not extract file ID from upload response:", data);
      throw new Error("Upload succeeded but no file ID was returned");
    }

    console.log("Extracted file ID:", fileId); // Debug log
    return fileId;
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
};
