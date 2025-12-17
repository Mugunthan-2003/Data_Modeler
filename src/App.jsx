import { Routes, Route, Navigate } from "react-router-dom";
import FileListPage from "./pages/FileListPage";
import FlowEditor from "./pages/FlowEditor";
import LineageViewer from "./pages/LineageViewer";
import DataProductPage from "./pages/DataProductPage";
import "reactflow/dist/style.css";
import "./index.css";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<FileListPage />} />
            <Route path="/editor/:fileId" element={<FlowEditor />} />
            <Route path="/editor/merged/:fileId" element={<LineageViewer />} />
            <Route path="/data-product" element={<DataProductPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
