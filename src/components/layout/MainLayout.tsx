import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function MainLayout() {
  return (
    <>
      <div className="min-h-screen pb-[calc(68px+env(safe-area-inset-bottom)+8px)]">
        <Outlet />
      </div>
      <BottomNav />
    </>
  );
}
