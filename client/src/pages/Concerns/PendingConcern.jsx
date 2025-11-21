import React from "react";

const PendingConcern = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md select-none">
      <h1 className="text-2xl font-montserrat font-semibold text-center text-gray-600 mb-4">
        Pending Concerns
      </h1>

      <div className="w-full max-w-full overflow-x-auto">
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-md mb-4 float-right">Add Concern</button>
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
            <tr className="hover:bg-slate-50 transition duration-300 text-center cursor-pointer">
              <td className="py-2 px-4">1</td>
              <td className="py-2 px-4">
                <img src="" alt="Concern Image" className="w-10 h-10 object-cover" />
              </td>
              <td className="py-2 px-4 max-w-[400px] truncate">
                Repair of toilet bowl at the 3F male CR sample text for testing purposes
              </td>
              <td className="py-2 px-4">
                3rd Floor
              </td>
              <td className="py-2 px-4">NDC</td>
              <td className="py-2 px-4">Wilson</td>
              <td className="py-2 px-4">
                Sarah
              </td>
              <td className="py-2 px-4">-</td>
              <td className="py-2 px-4">May 6, 2025</td>
              <td className="py-2 px-4">-</td>
              <td className="py-2 px-4">-</td>
              <td className="py-2 px-4">May 8, 2025</td>
              <td className="py-2 px-4">RMF2025-05-001</td>
              <td className="py-2 px-4">May 6, 2025 Asked Nilo what kind of fill valve to buy</td>
              <td className="py-2 px-4">Status</td>
            </tr>
           
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingConcern;
