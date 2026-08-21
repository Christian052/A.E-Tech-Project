import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";
import ServicesManager from "./ServicesManager";
import GalleryManager from "./GalleryManager";
import TrainingManager from "./TrainingManager";
import UsersManager from "./UsersManager";

import {
  SkeletonStatCard,
  SkeletonTableRows,
  SkeletonChartCard,
} from "../../components/Skeleton";

import {
  InquiriesTrendChart,
  StatusBreakdownChart,
  ServicesBySlotChart,
  ProgramSeatsChart,
} from "./DashboardCharts";

const ITEMS_PER_PAGE = 10;

// ============================================================
// PAGINATION
// ============================================================

export function PaginationControls({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-navy-100 bg-white px-4 py-3 sm:px-6">
      <div className="text-xs text-navy-500">
        Showing{" "}
        <span className="font-medium">
          {totalItems === 0
            ? 0
            : (currentPage - 1) * itemsPerPage + 1}
        </span>{" "}
        to{" "}
        <span className="font-medium">
          {Math.min(currentPage * itemsPerPage, totalItems)}
        </span>{" "}
        of <span className="font-medium">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded border border-navy-200 px-3 py-1 text-xs font-medium text-navy-700 hover:bg-navy-50 disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-xs text-navy-600">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded border border-navy-200 px-3 py-1 text-xs font-medium text-navy-700 hover:bg-navy-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ============================================================
// INQUIRY MODAL
// ============================================================

export function InquiryModal({ inquiry, onClose }) {
  if (!inquiry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-navy-800">
            Inquiry Details
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="text-navy-400 hover:text-navy-600"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-navy-700">
          <p>
            <strong>Name:</strong> {inquiry.name || "N/A"}
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {inquiry.phone ? (
              <a
                href={`tel:${inquiry.phone}`}
                className="text-teal-600 underline"
              >
                {inquiry.phone}
              </a>
            ) : (
              "N/A"
            )}
          </p>

          <p>
            <strong>Email:</strong> {inquiry.email || "N/A"}
          </p>

          <p>
            <strong>Service Interest:</strong>{" "}
            {inquiry.serviceInterest || "N/A"}
          </p>

          <p>
            <strong>Date Submitted:</strong>{" "}
            {inquiry.createdAt
              ? new Date(inquiry.createdAt).toLocaleString()
              : "N/A"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            <span className="capitalize">
              {inquiry.status || "N/A"}
            </span>
          </p>

          <div className="rounded-lg bg-navy-50 p-3">
            <p>
              <strong>Message:</strong>
            </p>

            <p className="mt-1 whitespace-pre-wrap text-navy-800">
              {inquiry.message || "N/A"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-navy-100 px-4 py-2 text-sm font-medium text-navy-700 hover:bg-navy-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// APPLICATION MODAL
// ============================================================

export function ApplicationModal({ application, onClose }) {
  if (!application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-navy-800">
            Application Details
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="text-navy-400 hover:text-navy-600"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-navy-700">
          <p>
            <strong>Applicant Name:</strong>{" "}
            {application.fullName || "N/A"}
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {application.phone ? (
              <a
                href={`tel:${application.phone}`}
                className="text-teal-600 underline"
              >
                {application.phone}
              </a>
            ) : (
              "N/A"
            )}
          </p>

          {application.email && (
            <p>
              <strong>Email:</strong>{" "}
              <a
                href={`mailto:${application.email}`}
                className="text-teal-600 underline"
              >
                {application.email}
              </a>
            </p>
          )}

          <p>
            <strong>Program:</strong>{" "}
            {application.programId?.title || "N/A"}
          </p>

          <p>
            <strong>Date Applied:</strong>{" "}
            {application.createdAt
              ? new Date(application.createdAt).toLocaleString()
              : "N/A"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            <span className="capitalize">
              {application.status || "N/A"}
            </span>
          </p>

          {application.notes && (
            <div className="rounded-lg bg-navy-50 p-3">
              <p>
                <strong>Notes / Cover Note:</strong>
              </p>

              <p className="mt-1 whitespace-pre-wrap text-navy-800">
                {application.notes}
              </p>
            </div>
          )}

          {application.message && (
            <div className="rounded-lg bg-navy-50 p-3">
              <p>
                <strong>Message:</strong>
              </p>

              <p className="mt-1 whitespace-pre-wrap text-navy-800">
                {application.message}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-navy-100 px-4 py-2 text-sm font-medium text-navy-700 hover:bg-navy-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN DASHBOARD
// ============================================================

export default function AdminDashboard() {
  const [tab, setTab] = useState("Overview");

  const [inquiries, setInquiries] = useState([]);
  const [applications, setApplications] = useState([]);
  const [services, setServices] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // ==========================================================
  // INQUIRIES CONTROLS
  // ==========================================================

  const [inquirySearchQuery, setInquirySearchQuery] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] =
    useState("all");
  const [inquiriesPage, setInquiriesPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // ==========================================================
  // APPLICATION CONTROLS
  // ==========================================================

  const [appSearchQuery, setAppSearchQuery] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("all");
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [updatingId, setUpdatingId] = useState(null);

  // ==========================================================
  // LOAD ALL DASHBOARD DATA
  // ==========================================================

  const loadAll = useCallback(async (signal) => {
    setLoading(true);
    setLoadError(null);

    try {
      const [
        inqRes,
        appRes,
        svcRes,
        galRes,
        progRes,
      ] = await Promise.all([
        api.get("/contact/inquiries", { signal }),

        api.get("/applications", { signal }),

        api.get("/services", {
          params: { all: "true" },
          signal,
        }),

        api.get("/gallery", { signal }),

        api.get("/training-programs", {
          params: { all: "true" },
          signal,
        }),
      ]);

      setInquiries(inqRes.data?.inquiries || []);
      setApplications(appRes.data?.applications || []);
      setServices(svcRes.data?.services || []);
      setGalleryItems(galRes.data?.items || []);
      setPrograms(progRes.data?.programs || []);
    } catch (err) {
      if (
        err.name !== "CanceledError" &&
        err.code !== "ERR_CANCELED"
      ) {
        console.error("Dashboard loading error:", err);

        setLoadError(
          "Couldn't load dashboard data. Please refresh the page."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadAll(controller.signal);

    return () => controller.abort();
  }, [loadAll]);

  // ==========================================================
  // RESET PAGINATION
  // ==========================================================

  useEffect(() => {
    setInquiriesPage(1);
  }, [inquirySearchQuery, inquiryStatusFilter]);

  useEffect(() => {
    setApplicationsPage(1);
  }, [appSearchQuery, appStatusFilter]);

  // ==========================================================
  // UPDATE INQUIRY STATUS
  // ==========================================================

  const updateInquiryStatus = async (id, status) => {
    setUpdatingId(id);

    const previousInquiries = [...inquiries];

    // Optimistic update
    setInquiries((prev) =>
      prev.map((inquiry) =>
        inquiry._id === id
          ? { ...inquiry, status }
          : inquiry
      )
    );

    if (selectedInquiry?._id === id) {
      setSelectedInquiry((prev) => ({
        ...prev,
        status,
      }));
    }

    try {
      await api.patch(
        `/contact/inquiries/${id}`,
        { status }
      );
    } catch (err) {
      console.error(
        "Update inquiry status error:",
        err
      );

      setInquiries(previousInquiries);

      alert(
        err.response?.data?.message ||
          "Failed to update inquiry status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================================
  // UPDATE APPLICATION STATUS
  // ==========================================================

  const updateApplicationStatus = async (id, status) => {
    setUpdatingId(id);

    const previousApplications = [...applications];

    // Optimistic update
    setApplications((prev) =>
      prev.map((application) =>
        application._id === id
          ? {
              ...application,
              status,
            }
          : application
      )
    );

    if (selectedApplication?._id === id) {
      setSelectedApplication((prev) => ({
        ...prev,
        status,
      }));
    }

    try {
      await api.patch(
        `/applications/${id}`,
        { status }
      );
    } catch (err) {
      console.error(
        "Update application status error:",
        err
      );

      setApplications(previousApplications);

      alert(
        err.response?.data?.message ||
          "Failed to update application status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================================
  // DELETE INQUIRY
  // ==========================================================

  const handleDeleteInquiry = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this inquiry?"
    );

    if (!confirmed) return;

    try {
      setUpdatingId(id);

      await api.delete(
        `/contact/inquiries/${id}`
      );

      setInquiries((prev) =>
        prev.filter(
          (inquiry) => inquiry._id !== id
        )
      );

      if (selectedInquiry?._id === id) {
        setSelectedInquiry(null);
      }

      // Move back one page if the deleted item
      // was the last item on the current page.
      if (
        paginatedInquiries.length === 1 &&
        inquiriesPage > 1
      ) {
        setInquiriesPage((prev) => prev - 1);
      }
    } catch (err) {
      console.error(
        "Delete inquiry error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to delete inquiry. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================================
  // DELETE APPLICATION
  // ==========================================================

  const handleDeleteApplication = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this application?"
    );

    if (!confirmed) return;

    try {
      setUpdatingId(id);

      await api.delete(
        `/applications/${id}`
      );

      setApplications((prev) =>
        prev.filter(
          (application) => application._id !== id
        )
      );

      if (
        selectedApplication?._id === id
      ) {
        setSelectedApplication(null);
      }

      if (
        paginatedApplications.length === 1 &&
        applicationsPage > 1
      ) {
        setApplicationsPage(
          (prev) => prev - 1
        );
      }
    } catch (err) {
      console.error(
        "Delete application error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to delete application. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================================
  // FILTER INQUIRIES
  // ==========================================================

  const filteredInquiries = useMemo(() => {
    const query =
      inquirySearchQuery.trim().toLowerCase();

    return inquiries.filter((inquiry) => {
      const matchesSearch =
        !query ||
        inquiry.name
          ?.toLowerCase()
          .includes(query) ||
        inquiry.phone
          ?.toLowerCase()
          .includes(query) ||
        inquiry.serviceInterest
          ?.toLowerCase()
          .includes(query) ||
        inquiry.email
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        inquiryStatusFilter === "all" ||
        inquiry.status ===
          inquiryStatusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    inquiries,
    inquirySearchQuery,
    inquiryStatusFilter,
  ]);

  // ==========================================================
  // PAGINATE INQUIRIES
  // ==========================================================

  const paginatedInquiries = useMemo(() => {
    const start =
      (inquiriesPage - 1) *
      ITEMS_PER_PAGE;

    return filteredInquiries.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [
    filteredInquiries,
    inquiriesPage,
  ]);

  // ==========================================================
  // FILTER APPLICATIONS
  // ==========================================================

  const filteredApplications = useMemo(() => {
    const query =
      appSearchQuery.trim().toLowerCase();

    return applications.filter(
      (application) => {
        const matchesSearch =
          !query ||
          application.fullName
            ?.toLowerCase()
            .includes(query) ||
          application.phone
            ?.toLowerCase()
            .includes(query) ||
          application.email
            ?.toLowerCase()
            .includes(query) ||
          application.programId?.title
            ?.toLowerCase()
            .includes(query);

        const matchesStatus =
          appStatusFilter === "all" ||
          application.status ===
            appStatusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    applications,
    appSearchQuery,
    appStatusFilter,
  ]);

  // ==========================================================
  // PAGINATE APPLICATIONS
  // ==========================================================

  const paginatedApplications = useMemo(() => {
    const start =
      (applicationsPage - 1) *
      ITEMS_PER_PAGE;

    return filteredApplications.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [
    filteredApplications,
    applicationsPage,
  ]);

  // ==========================================================
  // DASHBOARD COUNTERS
  // ==========================================================

  const newInquiries = inquiries.filter(
    (inquiry) =>
      inquiry.status === "unread"
  ).length;

  const newApplications =
    applications.filter(
      (application) =>
        application.status === "new"
    ).length;

  // ==========================================================
  // STATUS BADGE
  // ==========================================================

  const renderBadge = (status) => {
    const styles = {
      unread:
        "bg-amber-100 text-amber-800",

      read:
        "bg-blue-100 text-blue-800",

      responded:
        "bg-emerald-100 text-emerald-800",

      new:
        "bg-amber-100 text-amber-800",

      reviewed:
        "bg-blue-100 text-blue-800",

      accepted:
        "bg-emerald-100 text-emerald-800",

      rejected:
        "bg-rose-100 text-rose-800",
    };

    return (
      <span
        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
          styles[status] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {status || "unknown"}
      </span>
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <AdminLayout
      tab={tab}
      setTab={setTab}
      badges={{
        inquiries: newInquiries,
        applications: newApplications,
      }}
    >
      {/* ======================================================
          ERROR
      ====================================================== */}

      {loadError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}{" "}
          <button
            type="button"
            onClick={() => loadAll()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ======================================================
          OVERVIEW
      ====================================================== */}

      {tab === "Overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {loading ? (
              <>
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
              </>
            ) : (
              <>
                <div className="card">
                  <p className="text-sm text-navy-500">
                    New Inquiries
                  </p>

                  <p className="mt-1 text-3xl font-extrabold text-teal-600">
                    {newInquiries}
                  </p>
                </div>

                <div className="card">
                  <p className="text-sm text-navy-500">
                    New Applications
                  </p>

                  <p className="mt-1 text-3xl font-extrabold text-teal-600">
                    {newApplications}
                  </p>
                </div>

                <div className="card">
                  <p className="text-sm text-navy-500">
                    Active Services
                  </p>

                  <p className="mt-1 text-3xl font-extrabold text-teal-600">
                    {
                      services.filter(
                        (service) =>
                          service.isActive
                      ).length
                    }
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {loading ? (
              <>
                <SkeletonChartCard className="lg:col-span-2" />
                <SkeletonChartCard />
                <SkeletonChartCard />
              </>
            ) : (
              <>
                <InquiriesTrendChart
                  inquiries={inquiries}
                />

                <StatusBreakdownChart
                  title="Inquiries by status"
                  subtitle="Unread / read / responded"
                  items={inquiries}
                />

                <StatusBreakdownChart
                  title="Applications by status"
                  subtitle="New / reviewed / accepted / rejected"
                  items={applications}
                />

                <ServicesBySlotChart
                  services={services}
                />

                <ProgramSeatsChart
                  programs={programs}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* ======================================================
          INQUIRIES
      ====================================================== */}

      {tab === "Inquiries" && (
        <div className="w-full space-y-4">
          {/* SEARCH + FILTER */}

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-sm">
              <input
                type="text"
                placeholder="Search by name, phone, email, or service..."
                value={inquirySearchQuery}
                onChange={(e) =>
                  setInquirySearchQuery(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-navy-200 bg-navy-100 px-3 py-2.5 text-sm text-navy-800 outline-none transition placeholder:text-navy-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <label className="shrink-0 text-xs font-medium text-navy-600">
                Status:
              </label>

              <select
                value={inquiryStatusFilter}
                onChange={(e) =>
                  setInquiryStatusFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-navy-200 bg-navy-100 px-3 py-2.5 text-sm text-navy-800 outline-none focus:border-teal-500 sm:w-auto"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="unread">
                  Unread
                </option>

                <option value="read">
                  Read
                </option>

                <option value="responded">
                  Responded
                </option>
              </select>
            </div>
          </div>

          {/* DESKTOP TABLE */}

          <div className="hidden w-full overflow-hidden rounded-xl border border-navy-100 bg-white md:block">
            <div className="w-full overflow-x-auto">
              <table className="min-w-[1100px] w-full divide-y divide-navy-100 text-sm">
                <thead className="bg-navy-50 text-left text-navy-600">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3">
                      No
                    </th>

                    <th className="whitespace-nowrap px-4 py-3">
                      Date
                    </th>

                    <th className="whitespace-nowrap px-4 py-3">
                      Name
                    </th>

                    <th className="whitespace-nowrap px-4 py-3">
                      Phone
                    </th>

                    <th className="whitespace-nowrap px-4 py-3">
                      Service
                    </th>

                    <th className="px-4 py-3">
                      Message
                    </th>

                    <th className="whitespace-nowrap px-4 py-3">
                      Status
                    </th>

                    <th className="whitespace-nowrap px-4 py-3">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-navy-100">
                  {loading && (
                    <SkeletonTableRows
                      rows={5}
                      cols={8}
                    />
                  )}

                  {!loading &&
                    filteredInquiries.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-8 text-center text-navy-400"
                        >
                          No inquiries found.
                        </td>
                      </tr>
                    )}

                  {!loading &&
                    paginatedInquiries.map(
                      (inquiry, index) => (
                        <tr
                          key={inquiry._id}
                          className="transition-colors hover:bg-navy-50/50"
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-navy-500">
                            {index +
                              1 +
                              (inquiriesPage - 1) *
                                ITEMS_PER_PAGE}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-xs text-navy-500">
                            {inquiry.createdAt
                              ? new Date(
                                  inquiry.createdAt
                                ).toLocaleDateString()
                              : "—"}
                          </td>

                          <td className="max-w-[180px] px-4 py-3 font-medium text-navy-800">
                            <div className="truncate">
                              {inquiry.name ||
                                "—"}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            {inquiry.phone ? (
                              <a
                                href={`tel:${inquiry.phone}`}
                                className="text-teal-600 hover:underline"
                              >
                                {inquiry.phone}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="max-w-[180px] px-4 py-3">
                            <div className="truncate">
                              {inquiry.serviceInterest ||
                                "—"}
                            </div>
                          </td>

                          <td className="max-w-[220px] px-4 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedInquiry(
                                  inquiry
                                )
                              }
                              className="block w-full truncate text-left text-navy-700 transition hover:text-teal-600"
                              title="Click to view full message"
                            >
                              {inquiry.message ||
                                "—"}
                            </button>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            {renderBadge(
                              inquiry.status
                            )}
                          </td>

                          {/* CORRECT INQUIRY ACTION */}

                          <td className="whitespace-nowrap px-4 py-3">
                            <select
                              disabled={
                                updatingId ===
                                inquiry._id
                              }
                              value=""
                              onChange={async (e) => {
                                const action =
                                  e.target.value;

                                if (!action)
                                  return;

                                if (
                                  [
                                    "unread",
                                    "read",
                                    "responded",
                                  ].includes(action)
                                ) {
                                  await updateInquiryStatus(
                                    inquiry._id,
                                    action
                                  );
                                }

                                if (
                                  action ===
                                  "delete"
                                ) {
                                  await handleDeleteInquiry(
                                    inquiry._id
                                  );
                                }

                                e.target.value =
                                  "";
                              }}
                              className="min-w-[145px] rounded-lg border border-navy-200 bg-navy-100 px-2.5 py-2 text-xs font-medium text-navy-800 outline-none transition focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">
                                Action
                              </option>

                              <option value="unread">
                                Mark Unread
                              </option>

                              <option value="read">
                                Mark Read
                              </option>

                              <option value="responded">
                                Mark Responded
                              </option>

                              <option value="delete">
                                Delete
                              </option>
                            </select>
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={inquiriesPage}
              totalItems={
                filteredInquiries.length
              }
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setInquiriesPage}
            />
          </div>

          {/* MOBILE INQUIRIES */}

          <div className="w-full space-y-3 md:hidden">
            {loading &&
              Array.from({
                length: 5,
              }).map((_, index) => (
                <div
                  key={index}
                  className="w-full animate-pulse rounded-xl border border-navy-100 bg-white p-4"
                >
                  <div className="mb-4 flex justify-between gap-3">
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-navy-100" />
                      <div className="h-3 w-24 rounded bg-navy-100" />
                    </div>

                    <div className="h-6 w-20 rounded-full bg-navy-100" />
                  </div>

                  <div className="space-y-3">
                    <div className="h-3 w-full rounded bg-navy-100" />
                    <div className="h-3 w-3/4 rounded bg-navy-100" />
                    <div className="h-10 w-full rounded bg-navy-100" />
                  </div>
                </div>
              ))}

            {!loading &&
              filteredInquiries.length ===
                0 && (
                <div className="rounded-xl border border-navy-100 bg-white px-4 py-8 text-center text-sm text-navy-400">
                  No inquiries found.
                </div>
              )}

            {!loading &&
              paginatedInquiries.map(
                (inquiry, index) => (
                  <div
                    key={inquiry._id}
                    className="w-full overflow-hidden rounded-xl border border-navy-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-navy-800">
                          {inquiry.name ||
                            "—"}
                        </h3>

                        <p className="mt-1 text-xs text-navy-500">
                          #
                          {index +
                            1 +
                            (inquiriesPage - 1) *
                              ITEMS_PER_PAGE}
                          {" • "}
                          {inquiry.createdAt
                            ? new Date(
                                inquiry.createdAt
                              ).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {renderBadge(
                          inquiry.status
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-navy-400">
                          Phone
                        </p>

                        {inquiry.phone ? (
                          <a
                            href={`tel:${inquiry.phone}`}
                            className="block break-all text-sm font-medium text-teal-600 hover:underline"
                          >
                            {inquiry.phone}
                          </a>
                        ) : (
                          <p className="text-sm text-navy-700">
                            —
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-navy-400">
                          Service
                        </p>

                        <p className="break-words text-sm text-navy-700">
                          {inquiry.serviceInterest ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-navy-400">
                          Message
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedInquiry(
                              inquiry
                            )
                          }
                          className="line-clamp-3 w-full break-words text-left text-sm leading-5 text-navy-700 hover:text-teal-600"
                        >
                          {inquiry.message ||
                            "—"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-navy-100 pt-4">
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-navy-400">
                        Action
                      </label>

                      <select
                        disabled={
                          updatingId ===
                          inquiry._id
                        }
                        value=""
                        onChange={async (e) => {
                          const action =
                            e.target.value;

                          if (!action)
                            return;

                          if (
                            [
                              "unread",
                              "read",
                              "responded",
                            ].includes(action)
                          ) {
                            await updateInquiryStatus(
                              inquiry._id,
                              action
                            );
                          }

                          if (
                            action === "delete"
                          ) {
                            await handleDeleteInquiry(
                              inquiry._id
                            );
                          }

                          e.target.value =
                            "";
                        }}
                        className="w-full rounded-lg border border-navy-200 bg-navy-100 px-3 py-2.5 text-sm font-medium text-navy-800 outline-none transition focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">
                          Select Action
                        </option>

                        <option value="unread">
                          Mark Unread
                        </option>

                        <option value="read">
                          Mark Read
                        </option>

                        <option value="responded">
                          Mark Responded
                        </option>

                        <option value="delete">
                          Delete
                        </option>
                      </select>
                    </div>
                  </div>
                )
              )}

            <PaginationControls
              currentPage={inquiriesPage}
              totalItems={
                filteredInquiries.length
              }
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setInquiriesPage}
            />
          </div>
        </div>
      )}

      {/* ======================================================
          APPLICATIONS
      ====================================================== */}

      {tab === "Applications" && (
        <div className="w-full space-y-4">
          {/* SEARCH */}

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-sm">
              <input
                type="text"
                placeholder="Search applicant, phone, email, or program..."
                value={appSearchQuery}
                onChange={(e) =>
                  setAppSearchQuery(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-navy-200 bg-navy-100 px-3 py-2.5 text-sm text-navy-800 outline-none transition placeholder:text-navy-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <label className="shrink-0 text-xs font-medium text-navy-600">
                Status:
              </label>

              <select
                value={appStatusFilter}
                onChange={(e) =>
                  setAppStatusFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-navy-200 bg-navy-100 px-3 py-2.5 text-sm text-navy-800 outline-none focus:border-teal-500 sm:w-auto"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="new">
                  New
                </option>

                <option value="reviewed">
                  Reviewed
                </option>

                <option value="accepted">
                  Accepted
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>
            </div>
          </div>

          {/* DESKTOP APPLICATION TABLE */}

          <div className="hidden w-full overflow-hidden rounded-xl border border-navy-100 bg-white md:block">
            <div className="w-full overflow-x-auto">
              <table className="min-w-[1050px] w-full divide-y divide-navy-100 text-sm">
                <thead className="bg-navy-50 text-left text-navy-600">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3">
                      No
                    </th>

                    <th className="whitespace-nowrap px-4 py-3">
                      Date
                    </th>

                    <th className="whitespace-nowrap px-4 py-3">
                      Name
                    </th>

                    <th className="whitespace-nowrap px-4 py-3">
                      Phone
                    </th>

                    <th className="px-4 py-3">
                      Program
                    </th>

                    <th className="whitespace-nowrap px-4 py-3">
                      Status
                    </th>

                    <th className="whitespace-nowrap px-4 py-3">
                      Details
                    </th>

                    <th className="whitespace-nowrap px-4 py-3">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-navy-100">
                  {loading && (
                    <SkeletonTableRows
                      rows={5}
                      cols={8}
                    />
                  )}

                  {!loading &&
                    filteredApplications.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-8 text-center text-navy-400"
                        >
                          No applications found.
                        </td>
                      </tr>
                    )}

                  {!loading &&
                    paginatedApplications.map(
                      (application, index) => (
                        <tr
                          key={application._id}
                          className="transition-colors hover:bg-navy-50/50"
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-navy-500">
                            {index +
                              1 +
                              (applicationsPage -
                                1) *
                                ITEMS_PER_PAGE}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-xs text-navy-500">
                            {application.createdAt
                              ? new Date(
                                  application.createdAt
                                ).toLocaleDateString()
                              : "—"}
                          </td>

                          <td className="max-w-[180px] px-4 py-3 font-medium text-navy-800">
                            <div className="truncate">
                              {application.fullName ||
                                "—"}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            {application.phone ? (
                              <a
                                href={`tel:${application.phone}`}
                                className="text-teal-600 hover:underline"
                              >
                                {application.phone}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="max-w-[220px] px-4 py-3">
                            <div className="truncate">
                              {application.programId
                                ?.title ||
                                "—"}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            {renderBadge(
                              application.status
                            )}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedApplication(
                                  application
                                )
                              }
                              className="text-xs font-semibold text-teal-600 transition hover:underline"
                            >
                              View Details
                            </button>
                          </td>

                          {/* CORRECT APPLICATION ACTION */}

                          <td className="whitespace-nowrap px-4 py-3">
                            <select
                              disabled={
                                updatingId ===
                                application._id
                              }
                              value=""
                              onChange={async (e) => {
                                const action =
                                  e.target.value;

                                if (!action)
                                  return;

                                if (
                                  [
                                    "new",
                                    "reviewed",
                                    "accepted",
                                    "rejected",
                                  ].includes(action)
                                ) {
                                  await updateApplicationStatus(
                                    application._id,
                                    action
                                  );
                                }

                                if (
                                  action ===
                                  "delete"
                                ) {
                                  await handleDeleteApplication(
                                    application._id
                                  );
                                }

                                e.target.value =
                                  "";
                              }}
                              className="min-w-[155px] rounded-lg border border-navy-200 bg-navy-100 px-2.5 py-2 text-xs font-medium text-navy-800 outline-none transition focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">
                                Action
                              </option>

                              <option value="new">
                                Mark New
                              </option>

                              <option value="reviewed">
                                Mark Reviewed
                              </option>

                              <option value="accepted">
                                Accept
                              </option>

                              <option value="rejected">
                                Reject
                              </option>

                              <option value="delete">
                                Delete
                              </option>
                            </select>
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={
                applicationsPage
              }
              totalItems={
                filteredApplications.length
              }
              itemsPerPage={
                ITEMS_PER_PAGE
              }
              onPageChange={
                setApplicationsPage
              }
            />
          </div>

          {/* MOBILE APPLICATIONS */}

          <div className="w-full space-y-3 md:hidden">
            {loading &&
              Array.from({
                length: 5,
              }).map((_, index) => (
                <div
                  key={index}
                  className="w-full animate-pulse rounded-xl border border-navy-100 bg-white p-4"
                >
                  <div className="mb-4 flex justify-between gap-3">
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-navy-100" />
                      <div className="h-3 w-24 rounded bg-navy-100" />
                    </div>

                    <div className="h-6 w-20 rounded-full bg-navy-100" />
                  </div>

                  <div className="space-y-3">
                    <div className="h-3 w-full rounded bg-navy-100" />
                    <div className="h-3 w-3/4 rounded bg-navy-100" />
                    <div className="h-10 w-full rounded bg-navy-100" />
                  </div>
                </div>
              ))}

            {!loading &&
              filteredApplications.length ===
                0 && (
                <div className="rounded-xl border border-navy-100 bg-white px-4 py-8 text-center text-sm text-navy-400">
                  No applications found.
                </div>
              )}

            {!loading &&
              paginatedApplications.map(
                (application, index) => (
                  <div
                    key={application._id}
                    className="w-full overflow-hidden rounded-xl border border-navy-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-navy-800">
                          {application.fullName ||
                            "—"}
                        </h3>

                        <p className="mt-1 text-xs text-navy-500">
                          #
                          {index +
                            1 +
                            (applicationsPage -
                              1) *
                              ITEMS_PER_PAGE}
                          {" • "}
                          {application.createdAt
                            ? new Date(
                                application.createdAt
                              ).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {renderBadge(
                          application.status
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-navy-400">
                          Phone
                        </p>

                        {application.phone ? (
                          <a
                            href={`tel:${application.phone}`}
                            className="block break-all text-sm font-medium text-teal-600 hover:underline"
                          >
                            {application.phone}
                          </a>
                        ) : (
                          <p className="text-sm text-navy-700">
                            —
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-navy-400">
                          Program
                        </p>

                        <p className="break-words text-sm text-navy-700">
                          {application.programId
                            ?.title ||
                            "—"}
                        </p>
                      </div>

                      {application.email && (
                        <div>
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-navy-400">
                            Email
                          </p>

                          <a
                            href={`mailto:${application.email}`}
                            className="break-all text-sm text-teal-600 hover:underline"
                          >
                            {application.email}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 border-t border-navy-100 pt-4">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedApplication(
                              application
                            )
                          }
                          className="w-full rounded-lg border border-teal-200 px-3 py-2.5 text-sm font-semibold text-teal-600 transition hover:bg-teal-50"
                        >
                          View Details
                        </button>

                        {/* CORRECT MOBILE APPLICATION ACTION */}

                        <select
                          disabled={
                            updatingId ===
                            application._id
                          }
                          value=""
                          onChange={async (e) => {
                            const action =
                              e.target.value;

                            if (!action)
                              return;

                            if (
                              [
                                "new",
                                "reviewed",
                                "accepted",
                                "rejected",
                              ].includes(action)
                            ) {
                              await updateApplicationStatus(
                                application._id,
                                action
                              );
                            }

                            if (
                              action === "delete"
                            ) {
                              await handleDeleteApplication(
                                application._id
                              );
                            }

                            e.target.value =
                              "";
                          }}
                          className="w-full rounded-lg border border-navy-200 bg-navy-100 px-3 py-2.5 text-sm text-navy-800 outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">
                            Select Action
                          </option>

                          <option value="new">
                            Mark New
                          </option>

                          <option value="reviewed">
                            Mark Reviewed
                          </option>

                          <option value="accepted">
                            Accept
                          </option>

                          <option value="rejected">
                            Reject
                          </option>

                          <option value="delete">
                            Delete
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                )
              )}

            <PaginationControls
              currentPage={
                applicationsPage
              }
              totalItems={
                filteredApplications.length
              }
              itemsPerPage={
                ITEMS_PER_PAGE
              }
              onPageChange={
                setApplicationsPage
              }
            />
          </div>
        </div>
      )}

      {/* ======================================================
          OTHER TABS
      ====================================================== */}

      {tab === "Services" &&
        !loading && (
          <ServicesManager
            services={services}
            setServices={setServices}
          />
        )}

      {tab === "Gallery" &&
        !loading && (
          <GalleryManager
            items={galleryItems}
            setItems={setGalleryItems}
          />
        )}

      {tab === "Training" &&
        !loading && (
          <TrainingManager
            programs={programs}
            setPrograms={setPrograms}
          />
        )}

      {tab === "Users" && <UsersManager />}

      {/* ======================================================
          MODALS
      ====================================================== */}

      {selectedInquiry && (
        <InquiryModal
          inquiry={selectedInquiry}
          onClose={() =>
            setSelectedInquiry(null)
          }
        />
      )}

      {selectedApplication && (
        <ApplicationModal
          application={selectedApplication}
          onClose={() =>
            setSelectedApplication(null)
          }
        />
      )}
    </AdminLayout>
  );
}