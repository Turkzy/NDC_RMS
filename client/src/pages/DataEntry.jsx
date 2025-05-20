import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const DataEntry = () => {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [records, setRecords] = useState([
    {
      workgroup: "",
      requestedby: "",
      issue: "",
      customIssue: "",
      serviceby: "",
      status: "Completed",
      repairDone: "",
      controlno: "",
      dateRequested: "",
      dateAccomplished: "",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({ success: 0, failed: 0 });
  const [groups, setGroups] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [personnel, setPersonnel] = useState([]);

  //------------FETCH YEAR & MONTHS------------
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/year/get-year"
        );
        setYears(response.data);

        // If there are years, set the first one as default
        if (response.data.length > 0) {
          setSelectedYear(response.data[0]);

          // If the selected year has months, set the first month as default
          if (response.data[0].Months && response.data[0].Months.length > 0) {
            setSelectedMonth(response.data[0].Months[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching years:", err);
        setError("Failed to load years data");
      }
    };

    fetchYears();
    fetchGroups();
    fetchConcerns();
    fetchPersonnel();
  }, []);

  // Handle year change
  const handleYearChange = (e) => {
    const yearId = parseInt(e.target.value);
    const year = years.find((y) => y.id === yearId);
    setSelectedYear(year);

    // When year changes, reset the selected month to the first month of the new year
    if (year.Months && year.Months.length > 0) {
      setSelectedMonth(year.Months[0]);
    } else {
      setSelectedMonth(null);
    }
  };

  // Handle month change
  const handleMonthChange = (e) => {
    const monthId = parseInt(e.target.value);
    const month = selectedYear.Months.find((m) => m.id === monthId);
    setSelectedMonth(month);
  };

  // Handle adding a new empty record
  const addEmptyRecord = () => {
    setRecords([
      ...records,
      {
        workgroup: "",
        requestedby: "",
        issue: "",
        customIssue: "",
        serviceby: "",
        status: "Completed",
        repairDone: "",
        controlno: "",
        dateRequested: "",
        dateAccomplished: "",
      },
    ]);
  };

  // Handle removing a record
  const removeRecord = (index) => {
    const newRecords = [...records];
    newRecords.splice(index, 1);
    setRecords(newRecords);
  };

  // Handle input change for a specific record
  const handleRecordChange = (index, name, value) => {
    const newRecords = [...records];

    // Special handling for issue field
    if (name === "issue" && value !== "Other") {
      newRecords[index] = {
        ...newRecords[index],
        [name]: value,
        customIssue: "", // Clear custom issue when a predefined issue is selected
      };
    } else {
      newRecords[index] = {
        ...newRecords[index],
        [name]: value,
      };
    }

    setRecords(newRecords);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Are you sure you want to submit the records",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Submit!",
    }).then(async (result) => {
      if (!result.isConfirmed) {
        return;
      }

      if (!selectedMonth) {
        setError("Please select a month");
        return;
      }

      if (records.length === 0) {
        setError("Please add at least one record");
        return;
      }

      // Validate all records
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        if (!record.workgroup) {
          setError(`Record #${i + 1}: Please select a workgroup`);
          return;
        }
        if (!record.requestedby) {
          setError(`Record #${i + 1}: Please enter a requester name`);
          return;
        }
        if (!record.issue) {
          setError(`Record #${i + 1}: Please select an issue`);
          return;
        }
        if (record.issue === "Other" && !record.customIssue) {
          setError(`Record #${i + 1}: Please enter a custom issue description`);
          return;
        }
        if (!record.dateRequested) {
          setError(`Record #${i + 1}: Please enter a requested date and time`);
          return;
        }
        if (!record.dateAccomplished) {
          setError(
            `Record #${i + 1}: Please enter an accomplished date and time`
          );
          return;
        }
      }

      setLoading(true);
      setError(null);
      setSuccess(false);

      let successCount = 0;
      let failedCount = 0;

      try {
        for (const record of records) {
          const dateRequested = record.dateRequested
            ? new Date(record.dateRequested).toISOString()
            : undefined;
          const dateAccomplished = record.dateAccomplished
            ? new Date(record.dateAccomplished).toISOString()
            : undefined;

          const payload = {
            workgroup: record.workgroup,
            requestedby: record.requestedby,
            issue: record.issue === "Other" ? record.customIssue : record.issue,
            serviceby: record.serviceby,
            status: record.status,
            repairDone: record.repairDone,
            monthId: selectedMonth.id,
            customControlNo: record.controlno || undefined,
            dateRequested,
            dateAccomplished,
          };

          console.log("Sending payload:", JSON.stringify(payload, null, 2));

          try {
            await axios.post(
              "http://localhost:5000/api/year/create-manual-request",
              payload
            );
            successCount++;
          } catch (err) {
            if (err.response && err.response.status === 409) {
              setError(
                `Record with Control No. "${record.controlno}" already exists.`
              );
            } else {
              setError("An error occurred while submitting a record.");
            }
            console.error("Error submitting record:", err);
            failedCount++;
          }
        }

        if (successCount > 0) {
          setSuccess(true);
          setRecords([
            {
              workgroup: "",
              requestedby: "",
              issue: "",
              customIssue: "",
              serviceby: "",
              status: "Completed",
              repairDone: "",
              controlno: "",
              dateRequested: "",
              dateAccomplished: "",
            },
          ]);
        }

        //LOGS ACTION
        await logAction("CREATE", `Created New Data Entries`);

        setResults({ success: successCount, failed: failedCount });

        

        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } catch (err) {
        console.error("Error submitting data:", err);
        setError("Failed to submit data");
      } finally {
        setLoading(false);
      }
    });
  };

  //------------FETCH WORKGROUPS------------
  const fetchGroups = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/group/get");
      setGroups(res.data);
    } catch (error) {
      console.error("Error Fetching Workgroup", error);
    }
  };

  //------------FETCH ISSUE------------
  const fetchConcerns = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/concern/get");
      setConcerns(res.data);
    } catch (error) {
      console.error("Error Fetching Issues", error);
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

  //-----LOGS ACTION-----
  const logAction = async (action, details) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const loggedInUser = user ? user.username : "Unknown User";

    try {
      await axios.post("http://localhost:5000/api/logs/create", {
        action,
        details,
        user: loggedInUser,
      });
    } catch (error) {
      console.error("failed to Logs Action", error);
    }
  };

  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-md select-none">
      <h1 className="text-2xl font-seminbold font-montserrat mb-6">
        Data Entry
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Records processed: {results.success} successful, {results.failed}{" "}
          failed
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Year Selection */}
          <div>
            <label className="block text-gray-700 mb-2">Year</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={selectedYear?.id || ""}
              onChange={handleYearChange}
              required
            >
              <option value="" disabled>
                Select Year
              </option>
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.year}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selection */}
          <div>
            <label className="block text-gray-700 mb-2">Month</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={selectedMonth?.id || ""}
              onChange={handleMonthChange}
              required
              disabled={!selectedYear}
            >
              <option value="" disabled>
                Select Month
              </option>
              {selectedYear?.Months?.map((month) => (
                <option key={month.id} value={month.id}>
                  {month.month}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs font-montserrat text-gray-500">
            “Note: Select a year and a specific month where the data will be
            input.”
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold font-montserrat mb-2">
            Records
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto rounded-xl overflow-hidden text-center text-sm">
              <thead className="bg-gray-100">
                <tr className="bg-slate-300 font-montserrat text-xs text-gray-800">
                  <th className="px-4 py-2">Control No</th>
                  <th className="px-4 py-2">Workgroup</th>
                  <th className="px-4 py-2">Requested By</th>
                  <th className="px-4 py-2">Issue</th>
                  <th className="px-4 py-2">Service By</th>
                  <th className="px-4 py-2">Repair Done</th>
                  <th className="px-4 py-2">Date Requested</th>
                  <th className="px-4 py-2">Date Accomplished</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="font-montserrat text-xs">
                {records.map((record, index) => (
                  <tr
                    key={index}
                    className="even:bg-slate-100 border-t  text-center"
                  >
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        placeholder="Eg. 2025-001"
                        value={record.controlno}
                        onChange={(e) =>
                          handleRecordChange(index, "controlno", e.target.value)
                        }
                        className="w-full px-2 py-1 border rounded-md"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <select
                        value={record.workgroup}
                        onChange={(e) =>
                          handleRecordChange(index, "workgroup", e.target.value)
                        }
                        className="w-full px-2 py-1 border rounded-md"
                        required
                      >
                        <option value="">Select Workgroup</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.groupworks}>
                            {group.workgroups}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={record.requestedby}
                        onChange={(e) =>
                          handleRecordChange(
                            index,
                            "requestedby",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border rounded-md"
                        required
                      />
                    </td>
                    <td className="px-2 py-1">
                      <div>
                        <select
                          value={record.issue}
                          onChange={(e) =>
                            handleRecordChange(index, "issue", e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded-md mb-1"
                          required
                        >
                          <option value="">Select Issue</option>
                          {concerns.map((concern) => (
                            <option key={concern.id} value={concern.concerns}>
                              {concern.concerns}
                            </option>
                          ))}
                          <option value="Other">Other</option>
                        </select>

                        {record.issue === "Other" && (
                          <input
                            type="text"
                            placeholder="Specify issue"
                            value={record.customIssue}
                            onChange={(e) =>
                              handleRecordChange(
                                index,
                                "customIssue",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border rounded-md mt-1"
                            required
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-1">
                      <select
                        className="w-full px-2 py-1 border rounded"
                        value={record.serviceby}
                        onChange={(e) =>
                          handleRecordChange(index, "serviceby", e.target.value)
                        }
                      >
                        <option value="">Select Personnel</option>
                        {personnel.map((person) => (
                          <option key={person.id} value={person.personnels}>
                            {person.personnels}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={record.repairDone}
                        onChange={(e) =>
                          handleRecordChange(
                            index,
                            "repairDone",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border rounded-md"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="datetime-local"
                        value={record.dateRequested}
                        onChange={(e) =>
                          handleRecordChange(
                            index,
                            "dateRequested",
                            e.target.value
                          )
                        }
                        className="w-28 px-2 py-1 border rounded-md"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="datetime-local"
                        value={record.dateAccomplished}
                        onChange={(e) =>
                          handleRecordChange(
                            index,
                            "dateAccomplished",
                            e.target.value
                          )
                        }
                        className="w-28 px-2 py-1 border rounded-md"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <button
                        type="button"
                        onClick={() => removeRecord(index)}
                        className="px-2 py-1 bg-red-500 text-white rounded-md"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-row gap-2 mt-4">
            <button
              type="button"
              onClick={addEmptyRecord}
              className="bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded-md"
            >
              Add Record
            </button>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit All Records"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DataEntry;
