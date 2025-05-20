import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Logo from "../../assets/bg.png";
import NDC from "../../assets/NDC.png";

const Request = () => {
  const [groups, setGroups] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [formData, setFormData] = useState({
    workgroup: "",
    requestedby: "",
    issue: "",
  });
  const [customIssue, setCustomIssue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchConcerns();
  }, []);

  //------------FETCH WORKGROUPS------------
  const fetchGroups = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/group/get");
      setGroups(res.data);
    } catch (error) {
      Swal.fire({
        title: "Error Fetching the Workgroups!",
        text: "Please Check Xampp/MySQL OPEN",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  //------------FETCH CONCERN------------
  const fetchConcerns = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/concern/get");
      setConcerns(res.data);
    } catch (error) {
      Swal.fire({
        title: "Error Fetching the Technical Issues!",
        text: "Please Check Xampp/MySQL OPEN",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === "issue" && value !== "Other") {
      setCustomIssue("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        workgroup: formData.workgroup,
        requestedby: formData.requestedby,
        issue: formData.issue === "Other" ? customIssue : formData.issue,
      };

      await axios.post(
        "http://localhost:5000/api/year/create-request",
        requestData
      );

      Swal.fire({
        title: "Success!",
        text: "Service request submitted successfully",
        icon: "success",
        confirmButtonText: "Ok",
      });

      setFormData({ workgroup: "", requestedby: "", issue: "" });
      setCustomIssue("");
    } catch (error) {
      Swal.fire({
        title: "Error Submitting Request!",
        text: error.response?.data?.message || "An unknown error occurred",
        icon: "error",
        confirmButtonText: "Ok",
      });
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-36 bg-center bg-cover min-h-screen px-4 py-8 select-none"
      style={{ backgroundImage: `url(${Logo})` }}
    >
      <img className="w-60 sm:w-60 lg:h-[25rem] lg:w-[20rem]" src={NDC} alt="NDC-Logo" />

      <div className="w-full lg:max-w-[60%]">
        <h1 className="mb-5 font-montserrat font-semibold text-2xl sm:text-3xl lg:text-4xl text-center lg:text-left">
          IT Service Request Form
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-600 font-montserrat">Workgroup</label>
            <select
              name="workgroup"
              value={formData.workgroup}
              onChange={handleChange}
              className="border p-2 w-full text-gray-600 font-montserrat"
              required
            >
              <option value="">--Please choose an option--</option>
              {groups.map((group) => (
                <option key={group.id} value={group.groupworks}>
                  {group.workgroups}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-600 font-montserrat">
              Requested by
            </label>
            <input
              type="text"
              name="requestedby"
              value={formData.requestedby}
              onChange={handleChange}
              placeholder="Enter your name"
              className="border p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="text-gray-600 font-montserrat">Issue</label>
            <select
              name="issue"
              value={formData.issue}
              onChange={handleChange}
              className="border p-2 w-full text-gray-600 font-montserrat"
              required
            >
              <option value="">--Please choose an option--</option>
              {concerns.map((concern) => (
                <option key={concern.id} value={concern.concerns}>
                  {concern.concerns}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>

          {formData.issue === "Other" && (
            <input
              type="text"
              placeholder="Please describe the issue"
              value={customIssue}
              onChange={(e) => setCustomIssue(e.target.value)}
              className="border p-2 w-full"
              required
            />
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Request;
