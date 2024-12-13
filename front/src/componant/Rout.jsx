import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ROSLogViewer from "./ROSLogViewer";

export default function Rout() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ROSLogViewer />} />
      </Routes>
    </BrowserRouter>
  );
}
