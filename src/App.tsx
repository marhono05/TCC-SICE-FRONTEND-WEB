import { Route, Routes } from 'react-router';
import LoginPage from './pages/LoginPage';
import EventosPage from './pages/EventosPage';
import ProtectedRoute from './routes/ProtectedRoute';
import LayoutPrincipal from './layouts/LayoutPrincipal';

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
        </Route>
      </Route>

    </Routes>
  )
}

export default App
