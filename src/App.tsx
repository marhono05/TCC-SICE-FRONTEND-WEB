import { Route, Routes } from 'react-router';
import EventosPage from './pages/eventos/Eventos/EventosPage';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import LayoutPrincipal from './layouts/LayoutPrincipal';
import LoginPage from './pages/auth/Login/LoginPage';
import AdminDashboard from './pages/admin/dashboard/DashBoardPage';

function App() {

  return (
    <Routes>

      <Route path='/' element={<LoginPage />} />
      <Route path='/login' element={<LoginPage />} />

      <Route element={<ProtectedRoute />} >
            <Route
              path='/eventos'
              element={<EventosPage />}
            />

        <Route element={<AdminRoute />} >

          <Route path='/admin' element={<LayoutPrincipal />}>
            
            <Route index element={<AdminDashboard/>} />
            
            <Route
              element={<EventosPage />}
            />

          </Route>
        </Route>
      </Route>

    </Routes>
  )
}

export default App
