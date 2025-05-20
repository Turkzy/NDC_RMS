import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LOGO from "../assets/NDC.png";
import { Printer } from "lucide-react";

const ITServiceRequestForm1 = () => {
  const location = useLocation();
  const [requestData, setRequestData] = useState(null);
  
  // Get the specific request data from location state
  useEffect(() => {
    if (location.state && location.state.requestData) {
      setRequestData(location.state.requestData);
    }
  }, [location]);

  // Format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
    const timePart = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    // Return date and time with more prominent spacing
    return datePart + "  |  " + timePart;
  };
  
  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  // Determine which checkbox should be checked based on issue type
  const getIssueType = (issue) => {
    const issueMap = {
      "Hardware": "hardware",
      "Software": "software",
      "Network": "network",
      "Format": "format",
      "Virus": "virus",
      "File Recovery": "fileRecovery",
      "Printer": "printer",
      "Email": "email",
      "Cabling": "cabling",
      "Coaching": "coaching",
      "Others": "others"
    };
    
    // Check if the issue contains any of our keywords
    for (const [key, value] of Object.entries(issueMap)) {
      if (issue && issue.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    // Default to others if no match found
    return "others";
  };
  
  // Determine which status checkbox should be checked
  const getStatusCheckbox = (status) => {
    if (!status) return { resolved: false, forTroubleshooting: false};
    
    const statusLower = status.toLowerCase();
    return {
      resolved: statusLower === "completed",
      forTroubleshooting: statusLower === "in progress",
    };
  };

  const statusCheckboxes = requestData ? getStatusCheckbox(requestData.status) : {
    resolved: false, 
    forTroubleshooting: false, 
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="print:hidden mb-4 flex justify-end">
        <button
          onClick={handlePrint}
          className="bg-gray-800 text-white rounded px-4 py-2 font-montserrat flex gap-2 items-center hover:bg-gray-700 transition duration-300"
        >
          <Printer size={16} />
          Print Form
        </button>
      </div>
    
      <div className="max-w-4xl mx-auto border border-gray-300 shadow-md print:shadow-none">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-300 bg-gray-100 px-4 font-montserrat">
          <div className="text-xs">
            <p className="font-semibold">IT-DI-FORM-01</p>
            <p className="font-semibold">EFFECTIVE AS OF:</p>
            <p className="font-semibold">FEBRUARY 18, 2020</p>
          </div>
          <div className="text-center font-semibold text-lg font-montserrat">
            IT SERVICE REQUEST FORM
          </div>
          <div className="flex justify-end w-24">
            <div className="p-1 flex items-center justify-center">
              <div className="flex flex-col items-end">
                <img src={LOGO} alt="NDC" className="h-16"/>
              </div>
            </div>
          </div>
        </div>

        {/* Top Information Section */}
        <div className="grid grid-cols-2 text-sm border-b border-gray-300 font-montserrat">
          <div className="border-r border-gray-300">
            <div className="grid grid-cols-2 border-b border-gray-300">
              <div className="border-r border-gray-300 pl-2 font-semibold flex items-center">
                Date & Time
              </div>
              <div className="p-2">
                {requestData && formatDate(requestData.createdAt)}
              </div>
            </div>
            <div className="grid grid-cols-2 border-b border-gray-300">
              <div className="border-r border-gray-300 pl-2 font-semibold flex items-center">
                Requested By
              </div>
              <div className="p-2">
                {requestData && requestData.requestedby}
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="border-r border-gray-300 pl-2 font-semibold flex items-center">
                Workgroup
              </div>
              <div className="p-2">
                {requestData && requestData.workgroup}
              </div>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-2 border-b border-gray-300">
              <div className="border-r border-gray-300 pl-2 font-semibold flex items-center">
                Control No.
              </div>
              <div className="p-2">
                {requestData && requestData.controlno}
              </div>
            </div>
            <div className="grid grid-cols-2 border-b border-gray-300">
              <div className="border-r border-gray-300 pl-2 font-semibold flex items-center">
                Serviced By:
              </div>
              <div className="p-2">
                {requestData && requestData.serviceby}
              </div>
            </div>
            
          </div>
        </div>

        {/* Problem Details Section */}
        <div className="border-b border-gray-300">
          <div className="bg-gray-300 text-gray-600 text-center font-semibold border-[1px] border-gray-400">
            I. PROBLEM DETAILS
          </div>
          <div className="grid grid-cols-3 px-4 py-2 gap-y-2 text-sm">
            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                className="mt-1" 
                checked={requestData && getIssueType(requestData.issue) === "hardware"}
                readOnly
              />
              <label className="text-[13px]">Hardware</label>
            </div>
            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                className="mt-1" 
                checked={requestData && getIssueType(requestData.issue) === "virus"}
                readOnly
              />
              <label className="text-[13px]">Virus Detection</label>
            </div>
            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                className="mt-1" 
                checked={requestData && getIssueType(requestData.issue) === "cabling"}
                readOnly
              />
              <label className="text-[13px]">Cabling</label>
            </div>

            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                className="mt-1" 
                checked={requestData && getIssueType(requestData.issue) === "software"}
                readOnly
              />
              <label className="text-[13px]">Software problem/Installation</label>
            </div>
            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                className="mt-1" 
                checked={requestData && getIssueType(requestData.issue) === "fileRecovery"}
                readOnly
              />
              <label className="text-[13px]">File Recovery/Sharing</label>
            </div>
            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                className="mt-1" 
                checked={requestData && getIssueType(requestData.issue) === "coaching"}
                readOnly
              />
              <label className="text-[13px]">Coaching</label>
            </div>

            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                className="mt-1" 
                checked={requestData && getIssueType(requestData.issue) === "network"}
                readOnly
              />
              <label className="text-[13px]">Network/Internet Connection</label>
            </div>
            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                className="mt-1" 
                checked={requestData && getIssueType(requestData.issue) === "printer"}
                readOnly
              />
              <label className="text-[13px]">Printer Problem</label>
            </div>
            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                className="mt-1" 
                checked={requestData && getIssueType(requestData.issue) === "others"}
                readOnly
              />
              <label className="text-[13px]">Others</label>
            </div>

            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                className="mt-1" 
                checked={requestData && getIssueType(requestData.issue) === "format"}
                readOnly
              />
              <label className="text-[13px]">Format PC/Back-up Files</label>
            </div>
            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                className="mt-1" 
                checked={requestData && getIssueType(requestData.issue) === "email"}
                readOnly
              />
              <label className="text-[13px]">Email Problem</label>
            </div>
          </div>
        </div>

        {/* Diagnosis Report Section */}
        <div className="border-b border-gray-300">
          <div className="bg-gray-300 text-gray-600 text-center font-semibold border border-gray-400">
            II. DIAGNOSIS REPORT
          </div>
          <div className="p-4 text-sm">
            
            
            <div className="flex items-center gap-6 mb-2 justify-between">
              <div className="flex items-center">
                <div className="flex flex-col">
                <span className="font-semibold mr-2 text-[13px]">Date & Time:</span>
                <span className="underline">{requestData && formatDate(requestData.updatedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={statusCheckboxes.resolved} 
                  readOnly 
                />
                <label className="text-[13px]">Resolved</label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={statusCheckboxes.forTroubleshooting} 
                  readOnly 
                />
                <label className="text-[13px]">For Further Troubleshooting</label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={statusCheckboxes.forOutsideRepair} 
                  readOnly 
                />
                <label className="text-[13px]">For Outside Repair</label>
              </div>
            </div>
            <div className="flex items-center mt-8 justify-between">
              <div className="flex gap-2">
                <p className="font-semibold mb-0 text-[13px]">Cleared by:</p>
                <span className="underline">________________________</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ITServiceRequestForm1;