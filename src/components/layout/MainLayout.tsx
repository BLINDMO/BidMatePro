import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function MainLayout() {
  return (
    <>
      <div className="min-h-screen pb-[calc(74px+env(safe-area-inset-bottom)+12px)]">
        <Outlet />
      </div>
      <BottomNav />
    </>
  );
}
