const API_BASE_URL = "https://a-e-tech-project.onrender.com";

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.png";

  // If the path contains localhost, replace it with the production URL
  if (imagePath.includes("localhost:5000")) {
    return imagePath.replace("http://localhost:5000", API_BASE_URL).replace("http://", "https://");
  }

  // If it's a relative path starting with /uploads
  if (imagePath.startsWith("/uploads")) {
    return `${API_BASE_URL}${imagePath}`;
  }

  // Ensure any other HTTP link gets upgraded to HTTPS
  return imagePath.replace("http://", "https://");
};