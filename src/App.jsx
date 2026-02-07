import { Navigate, Route, Routes } from 'react-router-dom';
import TabBar from './components/TabBar';
import FriendsPage from './pages/FriendsPage';
import FamilyPage from './pages/FamilyPage';
import HouseholdPage from './pages/HouseholdPage';
import WifePage from './pages/WifePage';
import CreativePage from './pages/CreativePage';

export default function App() {
  return (
    <main>
      <TabBar />
      <Routes>
        <Route path="/" element={<Navigate to="/friends" replace />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/household" element={<HouseholdPage />} />
        <Route path="/wife" element={<WifePage />} />
        <Route path="/creative" element={<CreativePage />} />
      </Routes>
    </main>
  );
}
