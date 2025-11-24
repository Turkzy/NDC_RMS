import React, { useState } from "react";
import { Search, Plus, Pencil, Trash } from "lucide-react";

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
            <option value="3">Critical/Urgent</option>
          </select>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 bg-blue-200 text-blue-600 px-4 py-2 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300">
            <Plus size={16} className="h-4 w-4" />
            Add Item
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto rounded-md overflow-hidden text-sm">
          <thead>
            <tr className="bg-slate-100 font-montserrat text-sm text-gray-800">
              <th className="px-2 py-1 text-center">No.</th>
              <th className="px-2 py-1 text-center">Description</th>
              <th className="px-2 py-1 text-center">Control Number</th>
              <th className="px-2 py-1 text-center">Location</th>
              <th className="px-2 py-1 text-center">Level of Repair</th>
              <th className="px-2 py-1 text-center">Remarks</th>
              <th className="px-2 py-1 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            <tr className="hover:bg-slate-50 transition">
              <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                No pending concerns found
              </td>
              <td className="px-2 py-1 text-center flex items-center gap-2 justify-center">
                <button className="bg-blue-100 text-blue-500 px-2 py-1 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300">
                  <Pencil size={16} className="h-4 w-4" />
                </button>
                <button className="bg-red-100 text-red-500 px-2 py-1 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300">
                  <Trash size={16} className="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingConcern;
