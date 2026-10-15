import { Navigate, Route, Routes } from 'react-router';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import SecretariaRoute from './routes/SecretariaRoute';

import LayoutPrincipal from './layouts/LayoutPrincipal/LayoutPrincipal';

import LoginPage from './pages/auth/Login/LoginPage';
import AlterarSenhaPage from './pages/auth/AlterarSenha/AlterarSenhaPage';

import DashBoardPage from './pages/admin/dashboard/DashBoardPage';

import EventosPage from './pages/eventos/Eventos/EventosPage';
import ListarEventosPage from './pages/admin/eventos/ListarEventos/ListarEventosPage';
import CadastrarEventosPage from './pages/admin/eventos/CadastrarEventos/CadastrarEventosPage';
import EditarEventosPage from './pages/admin/eventos/EditarEventos/EditarEventosPage';
import DetalhesEventoPage from './pages/admin/eventos/DetalhesEvento/DetalhesEventoPage';


import ListarUsuariosPage from './pages/admin/usuarios/ListarUsuarios/ListarUsuarioPage';
import CadastrarUsuarioPage from './pages/admin/usuarios/CadastrarUsuario/CadastrarUsuarioPage';
import EditarUsuarioPage from './pages/admin/usuarios/EditarUsuario/EditarUsuariosPage';

import ListarCursosPage from './pages/admin/cursos/ListarCursos/ListarCursosPage';
import CadastrarCursosPage from './pages/admin/cursos/CadastrarCursos/CadastrarCursosPage';
import EditarCursosPage from './pages/admin/cursos/EditarCursos/EditarCursosPage';

import ListarTurmasPage from './pages/admin/turmas/ListarTurmas/ListarTurmasPage';
import CadastrarTurmasPage from './pages/admin/turmas/CadastrarTurmas/CadastrarTurmasPage';
import EditarTurmasPage from './pages/admin/turmas/EditarTurmas/EditarTurmasPage';

import CadastrarGrupoWhatsappPage from './pages/admin/grupos/CadastrarGrupos/CadastrarGrupoWhatsappPage';
import EditarGrupoWhatsappPage from './pages/admin/grupos/EditarGrupos/EditarGrupoWhatsappPage';
import ListarGruposWhatsappPage from './pages/admin/grupos/ListarGrupos/ListarGruposWhatsappPage';

function App() {

  return (
    <Routes>

      <Route path='/' element={<LoginPage />} />
      <Route path='/login' element={<LoginPage />} />

      <Route element={<ProtectedRoute />} >
        <Route path='/alterar-senha' element={<AlterarSenhaPage />} />
        <Route element={<LayoutPrincipal />}>


          <Route path='/dashboard' element={<DashBoardPage />} />

          <Route
            path='/eventos'
            element={<EventosPage />}
          />


          <Route element={<SecretariaRoute />}>


            <Route
              path='/gerenciarEventos'
              element={<ListarEventosPage />}
            />
            <Route
              path='/cadastrarEventos'
              element={<CadastrarEventosPage />}
            />
            <Route path='/eventos/:id' element={<DetalhesEventoPage />} />
            <Route
              path='/editarEventos/:id'
              element={<EditarEventosPage />}
            />


            <Route element={<AdminRoute />} >


              <Route
                path='/admin'
                element={<Navigate to='/dashboard' replace />}
              />


              <Route
                path='/gerenciarUsuarios/:perfil'
                element={<ListarUsuariosPage />}
              />
              <Route
                path='/cadastrarUsuario/:perfil'
                element={<CadastrarUsuarioPage />}
              />
              <Route
                path='/editarUsuario/:id'
                element={<EditarUsuarioPage />}
              />


              <Route
                path='/gerenciarCursos'
                element={<ListarCursosPage />}
              />
              <Route
                path='/cadastrarCursos'
                element={<CadastrarCursosPage />}
              />
              <Route
                path='/editarCursos/:id'
                element={<EditarCursosPage />}
              />


              <Route
                path='/gerenciarTurmas'
                element={<ListarTurmasPage />}
              />
              <Route
                path='/cadastrarTurmas'
                element={<CadastrarTurmasPage />}
              />
              <Route
                path='/editarTurmas/:id'
                element={<EditarTurmasPage />}
              />


              <Route
                path="/gerenciarGruposWhatsapp"
                element={<ListarGruposWhatsappPage />}
              />
              <Route
                path="/grupos-whatsapp/cadastrar"
                element={<CadastrarGrupoWhatsappPage />}
              />
              <Route
                path="/grupos-whatsapp/editar/:id"
                element={<EditarGrupoWhatsappPage />}
              />

            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
