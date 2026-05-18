import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardPage } from './pages/DashboardPage';
import { InsightPage } from './pages/InsightPage';
import { DataTablePage } from './pages/DataTablePage';
import { ChatbotDrawer } from './components/ai/ChatbotDrawer';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-cream overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-5 pb-24 md:pb-5 space-y-7">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/insight" element={<InsightPage />} />
              <Route path="/data-table" element={<DataTablePage />} />
            </Routes>
          </main>
        </div>
        <ChatbotDrawer />
      </div>
    </BrowserRouter>
  );
}

export default App;
