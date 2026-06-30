import { BrowserRouter, Routes, Route } from "react-router-dom";
import PatrimonioTable from "@/pages/PatrimonioTable";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PatrimonioTable />} />
        <Route path="*" element={<PatrimonioTable />} />
      </Routes>
    </BrowserRouter>
  );
}
