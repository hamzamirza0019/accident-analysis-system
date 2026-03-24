import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import RouteAnalysisPage from "./pages/RouteAnalysisPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/route" element={<RouteAnalysisPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;