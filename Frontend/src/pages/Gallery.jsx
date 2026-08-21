import { useEffect, useState } from "react";
import api from "../api/axios";
import { SkeletonGalleryGrid } from "../components/Skeleton";

const categories = ["all", "computer-repair", "printer-repair", "networking", "cctv", "training", "general"];

const getImageUrl = (url) => {
  if (!url) return "https://placehold.co/400x300?text=No+Image";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  
  const backendBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const origin = backendBase.replace(/\/api.*$/, "").replace(/\/$/, "");
  let cleanPath = url.startsWith("/") ? url : `/${url}`;
  
  if (!cleanPath.startsWith("/uploads/") && !cleanPath.startsWith("/public/")) {
    cleanPath = `/uploads${cleanPath}`;
  }
  return `${origin}${cleanPath}`;
};

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [category, setCategory] = useState("all");
  
  // State for opening full image preview
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setStatus("loading");
    api
      .get("/gallery", { params: category !== "all" ? { category } : {} })
      .then(({ data }) => {
        setItems(data.items || data || []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [category]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dark Hero Banner */}
      <div className="bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] text-white py-14 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <span className="text-[11px] font-bold tracking-widest uppercase text-teal-400 block mb-2">
            GALLERY
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
            Work from the bench and the field
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl font-light">
            A sample of repairs, installations, and training sessions from our team in Kigali.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-10">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                category === c
                  ? "bg-teal-500 text-white shadow-sm"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {c.replace("-", " ")}
            </button>
          ))}
        </div>

        {status === "loading" && <SkeletonGalleryGrid count={6} />}

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-600 text-sm my-8">
            Couldn't load the gallery right now. Please refresh or try again later.
          </div>
        )}

        {status === "ready" && items.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm my-8">
            No photos in this category yet check back soon.
          </div>
        )}

        {/* Gallery Grid */}
        {status === "ready" && items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const rawImageUrl = item.imageUrl || item.image || item.url || item.path || item.src;
              const fullUrl = getImageUrl(rawImageUrl);

              return (
                <figure
                  key={item._id || item.id}
                  onClick={() => setSelectedImage({ url: fullUrl, title: item.title })}
                  className="group cursor-pointer overflow-hidden rounded bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"
                >
                  <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={fullUrl}
                      alt={item.title || "Gallery Item"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/400x300?text=Image+Not+Found";
                      }}
                    />
                    
                  </div>
                </figure>
              );
            })}
          </div>
        )}
      </div>

      {/* --- FULLSCREEN IMAGE MODAL --- */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-5 right-5 text-white bg-slate-800/80 hover:bg-slate-700 rounded-full p-2.5 px-4 text-sm font-bold transition-colors z-10"
          >
            ✕ Close
          </button>

          {/* Modal Content */}
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.title || "Full preview"}
              className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
            {selectedImage.title && (
              <p className="text-white text-center mt-3 text-sm font-medium bg-slate-900/60 px-4 py-1.5 rounded-full">
                {selectedImage.title}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}