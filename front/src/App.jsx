import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [code, setCode] = useState(`function add(a, b) {\n  return a + b;\n}`);
  const [testCase, setTestCase] = useState("");
  const [testCode, setTestCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("code");

  const LANGUAGES = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
  ];

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert("Please enter some code");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        code: btoa(code),
        language,
        testCase: testCase || undefined,
        testCode: testCode || undefined,
      };

      const response = await axios.post("http://localhost:3000/", payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: false,
      });

      setOutput(response.data);
    } catch (error) {
      console.error(error);
      setOutput("Error executing code");
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl + Enter to run code
      if (event.ctrlKey && event.key === "Enter") {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, testCase, testCode]);

  // Sample code templates
  const CODE_TEMPLATES = {
    javascript: `function solution() {\n  // Your code here\n}`,
    python: `def solution():\n    # Your code here\n    pass`,
    java: `public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`,
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex space-x-4 h-screen">
        {/* Left Side - Input */}
        <div className="w-1/2 bg-white shadow-md rounded-lg overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gray-100 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Code Input</h2>
            <div className="flex items-center space-x-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-2 py-1 border rounded"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setCode(CODE_TEMPLATES[language])}
                className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                Template
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            {["code", "testcase", "testcode"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 flex-1 ${
                  activeTab === tab
                    ? "bg-blue-100 border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 flex-grow overflow-auto">
            {activeTab === "code" && (
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your code here..."
                className="w-full h-full p-2 border rounded font-mono resize-none"
              />
            )}
            {activeTab === "testcase" && (
              <textarea
                value={testCase}
                onChange={(e) => setTestCase(e.target.value)}
                placeholder="Enter test cases..."
                className="w-full h-full p-2 border rounded resize-none"
              />
            )}
            {activeTab === "testcode" && (
              <textarea
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
                placeholder="Write test code here..."
                className="w-full h-full p-2 border rounded font-mono resize-none"
              />
            )}
          </div>

          {/* Run Button */}
          <div className="p-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? "Running..." : "Run Code"}
            </button>
          </div>
        </div>

        {/* Right Side - Output */}
        <div className="w-1/2 bg-white shadow-md rounded-lg overflow-hidden flex flex-col">
          <div className="bg-gray-100 p-4">
            <h2 className="text-xl font-bold text-gray-800">Output</h2>
          </div>
          <div className="p-4 flex-grow overflow-auto">
            <textarea
              value={output}
              readOnly
              placeholder="Output will appear here..."
              className="w-full h-full p-2 border rounded bg-gray-50 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
