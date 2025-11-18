import React, { useEffect, useMemo, useState } from "react";
import api, { buildFileUrl, endpoints } from "../../config/api";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

const PendingConcern = () => {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConcerns = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get(endpoints.concern.list, {
          params: { status: "Pending" },
        });
        setConcerns(data.concerns || []);
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to load pending concerns";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchConcerns();
  }, []);

  const rows = useMemo(() => {
    if (!concerns.length) {
      return (
        <tr>
          <td
            className="py-6 px-4 text-center text-gray-500"
            colSpan={15}
          >
            {loading ? "Loading concerns..." : "No pending concerns found"}
          </td>
        </tr>
      );
    }

    return concerns.map((concern, index) => {
      const {
        id,
        description,
        location,
        endUser,
        reportedBy,
        reportReceivedBy,
        levelOfRepair,
        dateReceived,
        deliveryDays,
        targetDate,
        dateCompleted,
        controlNumber,
        remarks,
        status,
        fileUrl,
      } = concern;

      const renderDate = (value) =>
        value ? dateFormatter.format(new Date(value)) : "—";

      return (
        <tr
          key={id || index}
          className="hover:bg-slate-50 transition duration-300 text-center cursor-pointer"
        >
          <td className="py-2 px-4">{index + 1}</td>
          <td className="py-2 px-4">
            {fileUrl ? (
              <img
                src={buildFileUrl(fileUrl)}
                alt="Concern"
                className="w-10 h-10 object-cover rounded"
                loading="lazy"
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center bg-slate-100 text-xs text-slate-500 rounded">
                N/A
              </div>
            )}
          </td>
          <td className="py-2 px-4 max-w-[400px] text-left truncate">
            {description || "—"}
          </td>
          <td className="py-2 px-4">{location || "—"}</td>
          <td className="py-2 px-4">{endUser || "—"}</td>
          <td className="py-2 px-4">{reportedBy || "—"}</td>
          <td className="py-2 px-4">{reportReceivedBy || "—"}</td>
          <td className="py-2 px-4">{levelOfRepair || "—"}</td>
          <td className="py-2 px-4">{renderDate(dateReceived)}</td>
          <td className="py-2 px-4">{deliveryDays ?? "—"}</td>
          <td className="py-2 px-4">{renderDate(targetDate)}</td>
          <td className="py-2 px-4">{renderDate(dateCompleted)}</td>
          <td className="py-2 px-4">{controlNumber || "—"}</td>
          <td className="py-2 px-4 max-w-[400px] text-left truncate">
            {remarks || "—"}
          </td>
          <td className="py-2 px-4">{status || "—"}</td>
        </tr>
      );
    });
  }, [concerns, loading]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h1 className="text-2xl font-montserrat font-semibold text-gray-600">
          Pending Concerns
        </h1>
        {error && (
          <span className="text-sm text-red-500 font-medium">{error}</span>
        )}
      </div>

      <div className="w-full max-w-full overflow-x-auto">
        <table className="w-full min-w-[1200px] border-collapse rounded-md overflow-hidden text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-slate-100 font-montserrat text-sm text-gray-800 sticky top-0 z-10">
              <th className="py-2 px-8">No.</th>
              <th className="py-2 px-8">Image</th>
              <th className="py-2 px-8">Description</th>
              <th className="py-2 px-8">Location</th>
              <th className="py-2 px-8">End User</th>
              <th className="py-2 px-8">Reported By</th>
              <th className="py-2 px-8">Report Received By</th>
              <th className="py-2 px-8">Level of Repair</th>
              <th className="py-2 px-8">Date Received</th>
              <th className="py-2 px-8">Delivery Days</th>
              <th className="py-2 px-8">Target Date</th>
              <th className="py-2 px-8">Date Completed</th>
              <th className="py-2 px-8">Control Number</th>
              <th className="py-2 px-8">Remarks</th>
              <th className="py-2 px-8">Status</th>
            </tr>
          </thead>
          <tbody className="font-montserrat text-sm text-gray-800">
            {rows}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingConcern;