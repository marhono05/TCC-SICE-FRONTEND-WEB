import { Route, Routes } from 'react-router'
import './App.css'
import LoginPage  from './pages/LoginPage'
import EventosPage  from './pages/EventosPage'

function App() {

  return (
    <Routes>

      <Route path='/' element={<LoginPage/>} />
      <Route path='/login' element={<LoginPage/>} />
      <Route path='/eventos' element={<EventosPage/>} />

    </Routes>
  )
}

export default App
