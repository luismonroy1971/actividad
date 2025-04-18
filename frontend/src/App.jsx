import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Layouts
import AdminLayout from './layouts/AdminLayout'
import ClienteLayout from './layouts/ClienteLayout'
import PublicLayout from './layouts/PublicLayout'

// Páginas públicas
import Home from './pages/public/Home'
import Login from './pages/public/Login'
import Registro from './pages/public/Registro'
import ActividadDetalle from './pages/public/ActividadDetalle'

// Páginas de cliente
import ClienteDashboard from './pages/cliente/Dashboard'
import ClientePerfil from './pages/cliente/Perfil'
import ClientePedidos from './pages/cliente/Pedidos'
import ClientePedidoDetalle from './pages/cliente/PedidoDetalle'

// Páginas de administrador
import AdminDashboard from './pages/admin/Dashboard'
import Actividades from './pages/admin/Actividades'
import AdminActividadForm from './pages/admin/ActividadForm'
import AdminClientes from './pages/admin/Clientes'
import AdminClienteForm from './pages/admin/ClienteForm'
import AdminPedidos from './pages/admin/Pedidos'
import AdminPedidoDetalle from './pages/admin/PedidoDetalle'
import AdminOpciones from './pages/admin/Opciones'
import AdminOpcionForm from './pages/admin/OpcionForm'
import AdminUsuarios from './pages/admin/Usuarios'
import AdminUsuarioForm from './pages/admin/UsuarioForm'
import Grupos from './pages/admin/Grupos'
import GrupoForm from './pages/admin/GrupoForm'
import GastosActividad from './pages/admin/GastosActividad'

// Componentes
import NotFound from './components/NotFound'

function App() {
  const { userInfo } = useSelector((state) => state.auth)
  
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="actividades/:id" element={<ActividadDetalle />} />
      </Route>
      
      {/* Rutas de cliente */}
      <Route 
        path="/cliente" 
        element={
          userInfo && userInfo.rol === 'cliente' ? 
          <ClienteLayout /> : 
          <Navigate to="/login" replace />
        }
      >
        <Route index element={<ClienteDashboard />} />
        <Route path="perfil" element={<ClientePerfil />} />
        <Route path="pedidos" element={<ClientePedidos />} />
        <Route path="pedidos/:id" element={<ClientePedidoDetalle />} />
      </Route>
      
      {/* Rutas de administrador */}
      <Route 
        path="/admin" 
        element={
          userInfo && (userInfo.rol === 'admin' || userInfo.rol === 'superadmin' || userInfo.rol === 'admin_actividad') ? 
          <AdminLayout /> : 
          <Navigate to="/login" replace />
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="actividades" element={<Actividades />} />
        <Route path="actividades/crear" element={<AdminActividadForm />} />
        <Route path="actividades/editar/:id" element={<AdminActividadForm />} />
        <Route path="clientes" element={<AdminClientes />} />
        <Route path="clientes/crear" element={<AdminClienteForm />} />
        <Route path="clientes/editar/:id" element={<AdminClienteForm />} />
        <Route path="pedidos" element={<AdminPedidos />} />
        <Route path="pedidos/:id" element={<AdminPedidoDetalle />} />
        <Route path="opciones" element={<AdminOpciones />} />
        <Route path="opciones/crear" element={<AdminOpcionForm />} />
        <Route path="opciones/editar/:id" element={<AdminOpcionForm />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="usuarios/crear" element={<AdminUsuarioForm />} />
        <Route path="usuarios/editar/:id" element={<AdminUsuarioForm />} />
        <Route path="grupos" element={<Grupos />} />
        <Route path="grupos/crear" element={<GrupoForm />} />
        <Route path="grupos/editar/:id" element={<GrupoForm />} />
        <Route path="actividades/:id/gastos" element={<GastosActividad />} />
      </Route>
      
      {/* Ruta 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App