import React, { useState } from "react";
import axios from "axios";

const severityColors = {
  ERROR: "bg-red-100",
  WARN: "bg-yellow-100",
  INFO: "bg-green-100",
  DEBUG: "bg-blue-100",
};

function ROSLogViewer() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedSeverities, setSelectedSeverities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    console.log(file);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/upload-log",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      console.log(response.data);
      setLogs(response.data.logs);
      setFilteredLogs(response.data.logs);
    } catch (error) {
      console.error("Error uploading log file:", error);
    }
  };

  const handleFilterLogs = async () => {
    try {
      const response = await axios.post("http://localhost:8000/filter-logs", {
        logs,
        severity_levels: selectedSeverities,
        search_term: searchTerm,
      });

      setFilteredLogs(response.data.filtered_logs);
    } catch (error) {
      console.error("Error filtering logs:", error);
    }
  };

  const handleDownloadLogs = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/download-logs",
        { logs: filteredLogs },
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/plain",
          },
        }
      );

      // Create a blob and download link
      const blob = new Blob([response.data], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "filtered_ros_logs.txt");
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading logs:", error);
      // Improved error handling
      if (error.response) {
        console.error("Response error:", error.response.data);
      } else if (error.request) {
        console.error("Request error:", error.request);
      } else {
        console.error("Error details:", error.message);
      }
    }
  };

  const toggleSeverity = (severity) => {
    setSelectedSeverities((prev) =>
      prev.includes(severity)
        ? prev.filter((s) => s !== severity)
        : [...prev, severity]
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ROS Log Viewer</h1>

      <div className="mb-4">
        <input
          type="file"
          accept=".log , .txt"
          onChange={handleFileUpload}
          className="mb-2"
        />
      </div>

      <div className="flex mb-4 space-x-2">
        {["DEBUG", "INFO", "WARN", "ERROR"].map((severity) => (
          <button
            key={severity}
            onClick={() => toggleSeverity(severity)}
            className={`px-2 py-1 rounded ${
              selectedSeverities.includes(severity)
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {severity}
          </button>
        ))}
      </div>

      <div className="flex mb-4 space-x-2">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-2 py-1 border rounded"
        />
        <button
          onClick={handleFilterLogs}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Filter Logs
        </button>
        <button
          onClick={handleDownloadLogs}
          className="bg-green-500 text-white px-4 py-1 rounded"
        >
          Download Logs
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Severity</th>
            <th className="border p-2">Timestamp</th>
            <th className="border p-2">Node Name</th>
            <th className="border p-2">Message</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log, index) => (
            <tr
              key={index}
              className={`${severityColors[log.severity] || "bg-white"}`}
            >
              <td className="border p-2">{log.severity}</td>
              <td className="border p-2">{log.timestamp}</td>
              <td className="border p-2">{log.node_name}</td>
              <td className="border p-2">{log.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ROSLogViewer;
