import React, { useState } from "react";
import { Search, Plus } from "lucide-react";

const PendingConcern = () => {
  const [maintenanceType, setMaintenanceType] = useState("");
  const [levelOfRepair, setLevelOfRepair] = useState("");

  return (
    <div className="bg-white p-4 rounded-lg shadow-md select-none">
      <h1 className="text-3xl font-semibold text-gray-600 font-montserrat text-center mb-8">
        Pending Concerns
      </h1>
      <div className="mb-6 p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex gap-2 items-center w-full md:w-auto">
          <div className="relative w-full md:w-60">
            <input
              type="text"
              placeholder="Search by Control Number"
              className="border p-2 pl-10 rounded-lg w-full"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
          </div>
          <select
            value={maintenanceType}
            onChange={(e) => setMaintenanceType(e.target.value)}
            className="w-48 border p-2 rounded-lg text-slate-600"
          >
            <option value="">--Maintenance Type--</option>
            <option value="1">Electrical</option>
            <option value="2">Mechanical</option>
            <option value="3">Carpentry</option>
            <option value="4">Painting</option>
            <option value="5">Plumbing</option>
            <option value="6">Other</option>
          </select>
          <select
            value={levelOfRepair}
            onChange={(e) => setLevelOfRepair(e.target.value)}
            className="w-48 border p-2 rounded-lg text-slate-600"
          >
            <option value="">--Level of Repair--</option>
            <option value="1">Minor</option>
            <option value="2">Major</option>
            <option value="3">Critical</option>
          </select>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-montserrat transition duration-300 rounded-lg hover:bg-blue-700">
            <Plus size={20} className="h-4 w-4" />
            Add Concern
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto rounded-md overflow-hidden text-sm">
          <thead>
            <tr className="bg-slate-300 font-montserrat text-sm text-gray-800">
              <th className="px-6 py-3 text-center">No.</th>
              <th className="px-6 py-3 text-center">Description</th>
              <th className="px-6 py-3 text-center">Control Number</th>
              <th className="px-6 py-3 text-center">Location</th>
              <th className="px-6 py-3 text-center">Level of Repair</th>
              <th className="px-6 py-3 text-center">Remarks</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            <tr className="hover:bg-slate-50 transition">
              <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                No pending concerns found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default PendingConcern;
