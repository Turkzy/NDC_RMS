import React from "react";
import bgrequest from "../../assets/bg2.png";
import logo from "../../assets/ndc_logo.png";

const RequestConcern = () => {
  return (
    <div
      className="relative min-h-screen bg-center bg-cover flex flex-col md:flex-row select-none"
      style={{ backgroundImage: `url(${bgrequest})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/80 via-white/70 to-emerald-100/60 backdrop-blur-[2px]"></div>

      <div className="relative flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-3xl">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="logo" className="h-20 drop-shadow-lg" />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">
                  NDC RMS
                </p>
                <h1 className="text-3xl md:text-4xl font-semibold text-slate-800 font-montserrat">
                  Report a Concern
                </h1>
                <p className="text-sm md:text-base text-slate-500">
                  Please fill out the form below.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-[32px] border border-white/80 p-8">

            <form className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="reportedBy"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Reported By
                  </label>
                  <input
                    type="text"
                    id="reportedBy"
                    name="reportedBy"
                    placeholder="Enter your name"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="location"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Location
                  </label>
                  <select
                    id="location"
                    name="location"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                  >
                    <option value="">Select a location</option>
                    <option value="1">Ground Floor</option>
                    <option value="2">2nd Floor</option>
                    <option value="3">3rd Floor</option>
                    <option value="4">4th Floor</option>
                    <option value="5">5th Floor</option>
                    <option value="6">6th Floor</option>
                    <option value="7">7th Floor</option>
                    <option value="8">8th Floor</option>
                    <option value="9">9th Floor</option>
                    <option value="10">10th Floor</option>
                    <option value="11">11th Floor</option>
                    <option value="12">12th Floor</option>
                    <option value="13">Penthouse</option>
                    <option value="14">NDC Elevator No.1</option>
                    <option value="15">NDC Elevator No.2</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm font-semibold text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Describe the issue with relevant details..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="image"
                  className="text-sm font-semibold text-slate-700"
                >
                  Image
                </label>
                <label
                  htmlFor="image"
                  className="flex items-center justify-between rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/70 px-5 py-4 text-sm text-emerald-600 cursor-pointer hover:border-emerald-400 transition"
                >
                 
                    
                    <span className="font-semibold">Upload Image</span>
                 
                  <span className="text-xs text-emerald-500">
                    PNG, JPG up to 5MB
                  </span>
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  className="hidden"
                  accept="image/jpeg, image/png, image/jpg"
                />
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-500">
                  Reports are securely logged and tracked in real time.
                </p>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-white font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition focus:outline-none focus:ring-4 focus:ring-emerald-200"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="relative flex-1 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white overflow-hidden">
       
        <div className="absolute -top-10 -left-6 w-48 h-48 bg-white/10 rotate-12 rounded-2xl"></div>
        <div className="absolute -bottom-16 -right-10 w-56 h-56 bg-white/5 -rotate-12 rounded-3xl"></div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-10 py-20 space-y-8">
        <p className="uppercase tracking-[0.7em] text-white/70 text-sm">
            NDC RMS
          </p>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Repair & Maintenance System
          </h2>
          <p className="text-lg text-white/90 max-w-xl">
          Streamline facility upkeep, monitor equipment status, and keep
            maintenance schedules on track with powerful workflow tools designed
            for National Development Company.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestConcern;
