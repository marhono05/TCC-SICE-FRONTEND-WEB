import { Route, Routes } from 'react-router';
import EventosPage from './pages/eventos/Eventos/EventosPage';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import LayoutPrincipal from './layouts/LayoutPrincipal/LayoutPrincipal';
import LoginPage from './pages/auth/Login/LoginPage';
import AdminDashboard from './pages/admin/dashboard/DashBoardPage';
import ListarUsuariosPage from './pages/admin/usuarios/ListarUsuarios/ListarUsuarioPage';
import CadastrarUsuarioPage from './pages/admin/usuarios/CadastrarUsuario/CadastrarUsuarioPage';
import ListarCursosPage from './pages/admin/cursos/ListarCursos/ListarCursosPage';
import CadastrarCursosPage from './pages/admin/cursos/CadastrarCursos/CadastrarCursosPage';
import EditarCursosPage from './pages/admin/cursos/EditarCursos/EditarCursosPage';
import ListarTurmasPage from './pages/admin/turmas/ListarTurmas/ListarTurmasPage';
import CadastrarTurmasPage from './pages/admin/turmas/CadastrarTurmas/CadastrarTurmasPage';

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
              path="/gerenciarUsuarios/:perfil"
              element={<ListarUsuariosPage />}
            />
            <Route
              path="/cadastrarUsuario/:perfil"
              element={<CadastrarUsuarioPage />}
            />

            <Route
              path='/gerenciarCursos'
              element={<ListarCursosPage/>}
            />
            <Route
              path='/cadastrarCursos'
              element={<CadastrarCursosPage/>}
            />
            <Route
              path='/editarCursos/:id'
              element={<EditarCursosPage/>}
            />

            <Route
              path='/gerenciarTurmas'
              element={<ListarTurmasPage/>}
            />
            <Route
              path='/cadastrarTurmas'
              element={<CadastrarTurmasPage/>}
            />

          </Route>

        </Route>
      </Route>

    </Routes>
  )
}

export default App
