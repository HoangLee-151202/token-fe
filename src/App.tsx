import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { lazy } from "react";

const Login = lazy(() => import("./pages/Login"));
const List = lazy(() => import("./pages/List"));

function App() {
  return (
    // Khai báo router
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/list" element={<List />} />
        {/* Nếu router khác router được khai báo chuyển về list */}
        <Route path="*" element={<Navigate to="/list" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
