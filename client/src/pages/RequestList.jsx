import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { ArrowDownUp, Search, FileType } from "lucide-react";
import axios from "axios";

const RequestList = () => {
  const [monitoring, setMonitoring] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  //---SORTING---
  const [sortControl, setSortControl] = useState(null);

  //---FILTER---
  const [serviceByFilter, setServiceByFilter] = useState("");
  const [issueByFilter, setIssueByFilter] = useState("");
  const [workgroupByFilter, setIsWorkgroupByFilter] = useState("");

  useEffect(() => {
    fetchMonitoring();
    fetchPersonnel();
  }, []);

  const sortControls = () => {
    let newControls = sortControl === "asc" ? "desc" : "asc";
    const sorted = [...monitoring].sort((a, b) => {
      if (newControls === "asc") {
        return a.controlno.localeCompare(b.controlno);
      } else {
        return b.controlno.localeCompare(a.controlno);
      }
    });
    setMonitoring(sorted);
    setSortControl(newControls);
  };

  //------------FETCH REQUEST------------
  const fetchMonitoring = async () => {
    try {
      const limit = 100;
      const offset = 0;

      const res = await axios.get(
        "http://localhost:5000/api/year/get-all-softrequest",
        {
          params: { limit, offset },
        }
      );

      setMonitoring(
        res.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch (error) {
      console.error("Error Fetching Request:", error);
    }
  };

  //------------FETCH IT PERSONNEL------------
  const fetchPersonnel = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/personnel/get");
      setPersonnel(res.data);
    } catch (error) {
      console.error("Error Fetching Personnels", error);
    }
  };

  return (
    <div className="select-none ">
      <ToastContainer />
      <div className="bg-slate-50 p-6 rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-semibold font-montserrat mb-10">
          Request List
        </h1>
        <div className="overflow-x-auto">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-4">
              <select
                value={workgroupByFilter}
                onChange={(e) => setIsWorkgroupByFilter(e.target.value)}
                className="w-60 border border-gray-300 p-2 rounded-md shadow-sm"
              >
                <option value="">---Workgroup---</option>
                {[...new Set(monitoring.map((item) => item.workgroup))]
                  .filter(Boolean) // remove undefined/null
                  .map((workgroup, index) => (
                    <option key={index} value={workgroup}>
                      {workgroup}
                    </option>
                  ))}
              </select>

              <select
                value={serviceByFilter}
                onChange={(e) => setServiceByFilter(e.target.value)}
                className="w-60 border border-gray-300 p-2 rounded-md shadow-sm"
              >
                <option value="">---Service By---</option>
                {[...new Set(personnel.map((item) => item.personnels))]
                  .filter(Boolean)
                  .map((name, index) => (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  ))}
              </select>

              <select
                value={issueByFilter}
                onChange={(e) => setIssueByFilter(e.target.value)}
                className="w-60 border border-gray-300 p-2 rounded-md shadow-sm "
              >
                {" "}
                <option value="">---Issue---</option>
                {[...new Set(monitoring.map((item) => item.issue))]
                  .filter(Boolean)
                  .map((issue, index) => (
                    <option key={index} value={issue}>
                      {issue}
                    </option>
                  ))}
              </select>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-2">
              <Search size={22} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 border border-gray-300 p-2 rounded-md shadow-sm "
              />
            </div>
          </div>

          <table className="min-w-full table-auto rounded-xl overflow-hidden text-center text-sm">
            <thead>
              <tr className="bg-slate-300 font-montserrat text-sm text-gray-800">
                <th
                  className="border py-2 px-4 flex items-center gap-2 cursor-pointer"
                  onClick={sortControls}
                >
                  Control No{" "}
                  <div>
                    <ArrowDownUp
                      className=" hover:text-blue-700 hover:animate-pulse transition duration-300"
                      size={16}
                    />
                  </div>
                </th>
                <th className="border py-2 px-4">Issue</th>
                <th className="border py-2 px-4">Workgroup</th>
                <th className="border py-2 px-4">Requested By</th>

                <th className="border py-2 px-4">Repair Done</th>
                <th className="border py-2 px-4">Service By</th>
                <th className="border py-2 px-4">File</th>
                <th className="border py-2 px-4">Date Requested</th>
                <th className="border py-2 px-4">Date Accomplished</th>
              </tr>
            </thead>
            <tbody className="font-montserrat">
              {monitoring
                .filter((item) => {
                  const search = searchTerm.toLowerCase();
                  const matchesSearch =
                    !searchTerm ||
                    item.controlno?.toLowerCase().includes(search) ||
                    item.issue?.toLowerCase().includes(search) ||
                    item.workgroup?.toLowerCase().includes(search) ||
                    item.requestedby?.toLowerCase().includes(search) ||
                    item.repairDone?.toLowerCase().includes(search) ||
                    item.serviceby?.toLowerCase().includes(search);

                  const matchesServiceBy =
                    !serviceByFilter || item.serviceby === serviceByFilter;

                  const matchesIssue =
                    !issueByFilter || item.issue === issueByFilter;

                  const matchesWorkgroup =
                    !workgroupByFilter || item.workgroup === workgroupByFilter;

                  return (
                    matchesSearch &&
                    matchesServiceBy &&
                    matchesIssue &&
                    matchesWorkgroup
                  );
                })
                .map((item) => (
                  <tr
                    key={item.id}
                    className="even:bg-slate-100 hover:bg-gray-200 transition"
                  >
                    <td className="px-2 py-1">{item.controlno}</td>
                    <td className="px-2 py-1">{item.issue}</td>
                    <td className="px-2 py-1">{item.workgroup}</td>
                    <td className="px-2 py-1">{item.requestedby}</td>

                    <td className="px-2 py-1">{item.repairDone}</td>
                    <td className="px-2 py-1">{item.serviceby}</td>
                    <td className="px-2 py-1">
                      {item.fileUrl ? (
                        <a
                          href={`http://localhost:5000/files/${item.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 flex gap-2 items-center bg-blue-100 p-1 rounded-xl hover:text-blue-800 hover:bg-blue-300 hover:animate-pulse transition duration-300"
                        >
                          <FileType size={16}/>View File
                        </a>
                      ) : (
                        "No File"
                      )}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      })}

                      <br />
                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      {new Date(item.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      })}
                      <br />
                      <span className="text-xs text-gray-500">
                        {new Date(item.updatedAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RequestList;
