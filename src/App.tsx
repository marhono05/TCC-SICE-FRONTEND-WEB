import { Route, Routes } from 'react-router';
import EventosPage from './pages/eventos/Eventos/EventosPage';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import LayoutPrincipal from './layouts/LayoutPrincipal/LayoutPrincipal';
import LoginPage from './pages/auth/Login/LoginPage';
import AdminDashboard from './pages/admin/dashboard/DashBoardPage';
import ListarUsuariosPage from './pages/admin/usuarios/ListarUsuarios/ListarUsuarioPage';
import LayoutUsuarios from './layouts/LayoutUsuarios/LayoutUsuarios';

function App() {

  return (
    <Routes>

      <Route path='/' element={<LoginPage />} />
      <Route path='/login' element={<LoginPage />} />

      <Route element={<ProtectedRoute />} >

        <Route element={<LayoutPrincipal />}>

          <Route
            path='/eventos'
            element={<EventosPage />}
          />

          <Route element={<AdminRoute />} >

            <Route
              path='/admin'
              element={<AdminDashboard />}
            />

            <Route
              path='/gerenciarUsuarios'
              element={<LayoutUsuarios />}
            >

              <Route
                path=':perfil'
                element={<ListarUsuariosPage />}
              />

            </Route>


          </Route>

        </Route>
      </Route>

    </Routes>
  )
}

export default App
