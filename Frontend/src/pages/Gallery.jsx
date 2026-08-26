import { useEffect, useState } from "react";
import api from "../api/axios";
import { SkeletonGalleryGrid } from "../components/Skeleton";

const categories = [
  "all",
  "computer-repair",
  "printer-repair",
  "networking",
  "cctv",
  "training",
  "general",
];

/* =========================================================
   IMAGE URL HELPER

   Cloudinary images are already complete HTTPS URLs,
   so return them directly.

   Legacy/local images are converted to the backend URL.
========================================================= */

const getImageUrl = (url) => {
  if (!url) {
    return "https://placehold.co/400x300?text=No+Image";
  }

  /* -------------------------------------------------------
     Cloudinary / external URLs
  ------------------------------------------------------- */

  if (
    url.startsWith("https://") ||
    url.startsWith("http://") ||
    url.startsWith("data:")
  ) {
    /*
     * Cloudinary normally returns HTTPS.
     *
     * Keep HTTPS URLs exactly as they are.
     *
     * For old HTTP URLs, upgrade to HTTPS.
     */
    return url.replace(/^http:\/\//, "https://");
  }

  /* -------------------------------------------------------
     Backend URL
  ------------------------------------------------------- */

  const backendBase =
    import.meta.env.VITE_API_BASE_URL ||
    "https://a-e-tech-project.onrender.com";

  const origin = backendBase
    .replace(/\/api.*$/, "")
    .replace(/\/$/, "");

  /* -------------------------------------------------------
     Legacy localhost URLs
  ------------------------------------------------------- */

  if (url.includes("localhost:5000")) {
    return url
      .replace(/^http:\/\/localhost:5000/, origin)
      .replace(/^http:\/\//, "https://");
  }

  /* -------------------------------------------------------
     Relative paths
  ------------------------------------------------------- */

  let cleanPath = url.startsWith("/")
    ? url
    : `/${url}`;

  /*
   * Legacy database records may contain:
   *
   * /uploads/image.jpg
   * /public/image.jpg
   *
   * If the path is neither, assume it belongs to
   * the old uploads directory.
   */

  if (
    !cleanPath.startsWith("/uploads/") &&
    !cleanPath.startsWith("/public/")
  ) {
    cleanPath = `/uploads${cleanPath}`;
  }

  return `${origin}${cleanPath}`;
};

export default function Gallery() {
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

  /* =========================================================
     RETRY
  ========================================================= */

  const retryGallery = () => {
    setStatus("loading");

    /*
     * Changing category isn't necessary.
     * We can simply re-fetch the current category.
     */

    api
      .get("/gallery", {
        params:
          category !== "all"
            ? { category }
            : {},
      })
      .then(({ data }) => {
        const galleryItems =
          data?.items || data || [];

        setItems(
          Array.isArray(galleryItems)
            ? galleryItems
            : []
        );

        setStatus("ready");
      })
      .catch((error) => {
        console.error(
          "Gallery retry failed:",
          error
        );

        setStatus("error");
      });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          HERO
      ====================================================== */}

      <div className="bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] px-4 py-10 text-white sm:px-6 md:px-12 md:py-14 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-teal-400">
            GALLERY
          </span>

          <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Work from the bench and the field
          </h1>

          <p className="max-w-2xl text-sm font-light text-slate-300 md:text-base">
            A sample of repairs, installations,
            and training sessions from our team in
            Kigali.
          </p>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 md:px-12 lg:px-20">
        {/* ===================================================
            CATEGORY FILTERS
        ==================================================== */}

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                category === c
                  ? "bg-teal-500 text-white shadow-sm"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {c.replace("-", " ")}
            </button>
          ))}
        </div>

        {/* ===================================================
            LOADING
        ==================================================== */}

        {status === "loading" && (
          <SkeletonGalleryGrid count={6} />
        )}

        {/* ===================================================
            ERROR
        ==================================================== */}

        {status === "error" && (
          <div className="my-8 rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
            <p>
              Couldn't load the gallery right now.
              Please refresh or try again later.
            </p>

            <button
              type="button"
              onClick={retryGallery}
              className="mt-4 rounded-full bg-red-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ===================================================
            EMPTY STATE
        ==================================================== */}

        {status === "ready" &&
          items.length === 0 && (
            <div className="my-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 sm:p-12">
              No photos in this category yet.
              Check back soon.
            </div>
          )}

        {/* ===================================================
            GALLERY GRID
        ==================================================== */}

        {status === "ready" &&
          items.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const itemId =
                  item._id || item.id;

                const rawImageUrl =
                  item.imageUrl ||
                  item.image ||
                  item.url ||
                  item.path ||
                  item.src;

                const fullUrl =
                  getImageUrl(rawImageUrl);

                return (
                  <figure
                    key={itemId}
                    onClick={() =>
                      setSelectedImage({
                        url: fullUrl,
                        title: item.title,
                      })
                    }
                    className="group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-md transition-all duration-300 hover:shadow-xl"
                  >
                    {/* IMAGE */}

                    <div className="relative h-56 w-full overflow-hidden bg-slate-100 sm:h-60">
                      <img
                        src={fullUrl}
                        alt={
                          item.title ||
                          "Gallery Item"
                        }
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror =
                            null;

                          e.currentTarget.src =
                            "https://placehold.co/400x300?text=Image+Not+Found";
                        }}
                      />

                      {/* CATEGORY BADGE */}

                      {item.category && (
                        <div className="absolute bottom-3 left-3 rounded-full bg-slate-900/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                          {item.category.replace(
                            "-",
                            " "
                          )}
                        </div>
                      )}
                    </div>

                    {/* TITLE */}

                    {item.title && (
                      <figcaption className="border-t border-slate-100 bg-white p-3">
                        <p
                          className="truncate text-sm font-semibold text-slate-800"
                          title={item.title}
                        >
                          {item.title}
                        </p>
                      </figcaption>
                    )}
                  </figure>
                );
              })}
            </div>
          )}
      </div>

      {/* =====================================================
          FULLSCREEN IMAGE MODAL
      ====================================================== */}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-4"
          onClick={() =>
            setSelectedImage(null)
          }
        >
          {/* CLOSE BUTTON */}

          <button
            type="button"
            onClick={() =>
              setSelectedImage(null)
            }
            className="absolute right-3 top-3 z-10 rounded-full bg-slate-800/80 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-700 sm:right-5 sm:top-5"
          >
            ✕ Close
          </button>

          {/* IMAGE CONTAINER */}

          <div
            className="relative flex max-h-[90vh] max-w-5xl flex-col items-center justify-center"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <img
              src={selectedImage.url}
              alt={
                selectedImage.title ||
                "Full preview"
              }
              className="max-h-[78vh] max-w-full rounded-lg object-contain shadow-2xl sm:max-h-[80vh]"
            />

            {/* {selectedImage.title && (
              <p className="mt-3 max-w-[90vw] rounded-full bg-slate-900/60 px-4 py-1.5 text-center text-sm font-medium text-white">
                {selectedImage.title}
              </p>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
}