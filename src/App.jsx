import { Routes, Route, Navigate } from "react-router-dom";
import ControlPage from "./pages/ControlPage";
import IndividualView from "./pages/IndividualView";
import ConsolidatedView from "./pages/ConsolidatedView";
import "reactflow/dist/style.css";
import "./index.css";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<ControlPage />} />
            <Route path="/editor/:fileId" element={<IndividualView />} />
            <Route path="/editor/merged/:fileId" element={<ConsolidatedView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
