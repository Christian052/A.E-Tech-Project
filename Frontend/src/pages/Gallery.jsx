import { useEffect, useState } from "react";
import api from "../api/axios";
import { SkeletonGalleryGrid } from "../components/Skeleton";
import { getImageUrl } from "../utils/getImageUrl";
import { useLanguage } from "../context/LanguageContext";

const categories = [
  "all",
  "computer-repair",
  "printer-repair",
  "networking",
  "cctv",
  "training",
  "general",
];

export default function Gallery() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [category, setCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);

  /* =========================================================
     LOAD GALLERY
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadGallery = async () => {
      try {
        setStatus("loading");

        const response = await api.get("/gallery", {
          params:
            category !== "all"
              ? { category }
              : {},
        });

        if (cancelled) return;

        const galleryItems =
          response.data?.items ||
          response.data ||
          [];

        setItems(
          Array.isArray(galleryItems)
            ? galleryItems
            : []
        );

        setStatus("ready");
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Failed to load gallery:",
          error
        );

        setStatus("error");
      }
    };

    loadGallery();

    return () => {
      cancelled = true;
    };
  }, [category]);

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case "all":
        return t("gallery.all");
      case "computer-repair":
        return t("gallery.computerRepair");
      case "printer-repair":
        return t("gallery.printerRepair");
      case "networking":
        return t("gallery.networking");
      case "cctv":
        return t("gallery.cctv");
      case "training":
        return t("gallery.training");
      default:
        return cat;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] px-6 py-14 sm:px-12 lg:px-20 text-white">
        <div className="max-w-6xl mx-auto">
          <span className="text-[11px] font-bold tracking-widest uppercase text-teal-400 block mb-2">
            {t("gallery.badge")}
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {t("gallery.title")}
          </h1>

          <p className="mt-4 text-xs sm:text-base text-slate-200 max-w-2xl leading-relaxed">
            {t("gallery.subtitle")}
          </p>
        </div>
      </section>

      {/* 2. FILTER TABS & MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pb-6 border-b border-slate-200">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                category === c
                  ? "bg-teal-500 text-slate-900 shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {getCategoryLabel(c)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {status === "loading" && (
          <div className="mt-8">
            <SkeletonGalleryGrid count={6} />
          </div>
        )}

        {/* Empty State */}
        {status === "ready" && items.length === 0 && (
          <div className="card text-center py-16 px-4 my-8">
            <p className="text-base font-semibold text-slate-700">
              {t("gallery.empty")}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {t("common.noData")}
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        {status === "ready" && items.length > 0 && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {items.map((item) => (
              <article
                key={item._id}
                onClick={() => setSelectedImage(item)}
                className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Media */}
                <div className="relative h-60 w-full overflow-hidden bg-slate-950">
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.title || "AUGU Tech Workshop Photo"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-slate-900/80 px-2 py-0.5 rounded-md">
                      {item.category || "Workshop"}
                    </span>
                    <h3 className="text-sm font-bold mt-1 leading-snug line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Footer caption */}
                {item.description && (
                  <div className="p-4 bg-white border-t border-slate-100">
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Image Modal Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 cursor-pointer"
            >
              ✕
            </button>
            <img
              src={getImageUrl(selectedImage.imageUrl)}
              alt={selectedImage.title}
              className="w-full max-h-[70vh] object-contain bg-black"
            />
            <div className="p-4 sm:p-6 bg-slate-900 text-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                {selectedImage.category}
              </span>
              <h3 className="text-lg font-bold mt-1">{selectedImage.title}</h3>
              {selectedImage.description && (
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {selectedImage.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
