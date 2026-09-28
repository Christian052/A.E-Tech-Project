const API_BASE_URL = "https://a-e-tech-project.onrender.com";

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.png";

  // If already HTTPS or Data URL, return directly
  if (
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  // Convert HTTP to HTTPS and replace localhost
  if (imagePath.startsWith("http://")) {
    if (imagePath.includes("localhost:5000") || imagePath.includes("localhost:3000")) {
      return imagePath
        .replace(/^http:\/\/localhost:(5000|3000)/, API_BASE_URL)
        .replace("http://", "https://");
    }
    return imagePath.replace("http://", "https://");
  }

  // If it's a relative path starting with /uploads
  if (imagePath.startsWith("/uploads/")) {
    return `${API_BASE_URL}${imagePath}`;
  }

  // If imagePath starts with uploads/ without leading slash
  if (imagePath.startsWith("uploads/")) {
    return `${API_BASE_URL}/${imagePath}`;
  }

  // Static assets from public folder (e.g. /A.E TECH 001.jpg)
  return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
};