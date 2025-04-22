import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { getPedidos, updatePedidoEstado } from '../../store/slices/pedidoSlice'
import { getGrupos } from '../../store/slices/grupoSlice'
import { getActividades } from '../../store/slices/actividadSlice'
import { getClientes } from '../../store/slices/clienteSlice' // Añadido para cargar los datos de clientes
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const Pedidos = () => {
  const dispatch = useDispatch()
  const { pedidos = [], loading = false, error = null, success = false } = useSelector((state) => state.pedidos || {})
  const { grupos = [] } = useSelector((state) => state.grupos || {})
  const { actividades = [] } = useSelector((state) => state.actividades || {})
  const { clientes = [] } = useSelector((state) => state.clientes || {}) // Añadido para acceder a datos de clientes
  const [filteredPedidos, setFilteredPedidos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterGrupo, setFilterGrupo] = useState('')
  const [filterActividad, setFilterActividad] = useState('')
  
  // Cargar datos iniciales incluyendo clientes
  useEffect(() => {
    dispatch(getPedidos())
    dispatch(getGrupos())
    dispatch(getActividades())
    dispatch(getClientes()) // Añadido para cargar datos de clientes
  }, [dispatch, success])
  
  // Función para encontrar el grupo asociado a un cliente
  const getClienteGrupo = (clienteId) => {
    if (!clienteId || !clientes || !grupos) return null;
    
    // Buscar el cliente en la lista de clientes
    const cliente = clientes.find(c => c._id === clienteId || c.id === clienteId);
    if (!cliente) return null;
    
    // Si el cliente tiene grupo_id, buscar en los grupos
    if (cliente.grupo_id) {
      const grupoId = typeof cliente.grupo_id === 'object' ? cliente.grupo_id._id : cliente.grupo_id;
      return grupos.find(g => g._id === grupoId || g.id === grupoId);
    }
    
    return null;
  }
  
  // Función para encontrar el grupo asociado a una actividad
  const getActividadGrupo = (actividadId) => {
    if (!actividadId || !actividades || !grupos) return null;
    
    // Buscar la actividad en la lista de actividades
    const actividad = actividades.find(a => a._id === actividadId || a.id === actividadId);
    if (!actividad) return null;
    
    // Buscar grupos cuyo actividad_id coincide con esta actividad
    return grupos.find(g => g.actividad_id === actividad._id || g.actividad_id === actividad.id);
  }
  
  useEffect(() => {
    if (pedidos && Array.isArray(pedidos)) {
      // Filtrar pedidos por término de búsqueda, estado, grupo y actividad
      let filtered = [...pedidos]
      
      if (searchTerm) {
        filtered = filtered.filter(pedido => 
          (pedido.id && pedido.id.toString().includes(searchTerm)) ||
          (pedido._id && pedido._id.toString().includes(searchTerm)) ||
          (pedido.cliente_id?.nombre_completo && pedido.cliente_id.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (pedido.actividad_id?.titulo && pedido.actividad_id.titulo.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }
      
      if (filterEstado) {
        filtered = filtered.filter(pedido => pedido.estado_pago === filterEstado)
      }
      
      if (filterGrupo) {
        filtered = filtered.filter(pedido => {
          // 1. Verificar si el cliente del pedido pertenece al grupo filtrado
          if (pedido.cliente_id) {
            const clienteId = typeof pedido.cliente_id === 'object' ? pedido.cliente_id._id : pedido.cliente_id;
            const clienteGrupo = getClienteGrupo(clienteId);
            if (clienteGrupo && (clienteGrupo._id === filterGrupo || clienteGrupo.id === filterGrupo)) {
              return true;
            }
          }
          
          // 2. Verificar si la actividad del pedido está asociada al grupo filtrado
          if (pedido.actividad_id) {
            const actividadId = typeof pedido.actividad_id === 'object' ? pedido.actividad_id._id : pedido.actividad_id;
            const grupoActividad = getActividadGrupo(actividadId);
            if (grupoActividad && (grupoActividad._id === filterGrupo || grupoActividad.id === filterGrupo)) {
              return true;
            }
          }
          
          return false;
        })
      }
      
      if (filterActividad) {
        filtered = filtered.filter(pedido => {
          const actividadId = pedido.actividad_id?._id || (typeof pedido.actividad_id === 'string' ? pedido.actividad_id : null);
          return actividadId === filterActividad;
        })
      }
      
      setFilteredPedidos(filtered)
    } else {
      setFilteredPedidos([])
    }
  }, [pedidos, searchTerm, filterEstado, filterGrupo, filterActividad, clientes, grupos, actividades])

  const handleChangeEstado = (id, nuevoEstado) => {
    if (window.confirm(`¿Estás seguro de cambiar el estado del pedido a ${nuevoEstado}?`)) {
      dispatch(updatePedidoEstado({ id, estado: nuevoEstado }))
    }
  }

  // Función para formatear IDs para mostrar de forma más legible
  const formatId = (id) => {
    if (!id) return 'N/A';
    return typeof id === 'string' && id.length > 8 ? `${id.substring(0, 8)}...` : id;
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'N/A';
    }
  };

  // Función para obtener el nombre del grupo al que pertenece un cliente o actividad
  const getGrupoNombre = (pedido) => {
    if (!pedido) return 'N/A';
    
    // 1. Verificar si el cliente del pedido pertenece a un grupo
    if (pedido.cliente_id) {
      const clienteId = typeof pedido.cliente_id === 'object' ? pedido.cliente_id._id : pedido.cliente_id;
      const clienteGrupo = getClienteGrupo(clienteId);
      if (clienteGrupo) return clienteGrupo.nombre;
    }
    
    // 2. Verificar si la actividad del pedido está asociada a un grupo
    if (pedido.actividad_id) {
      const actividadId = typeof pedido.actividad_id === 'object' ? pedido.actividad_id._id : pedido.actividad_id;
      const grupoActividad = getActividadGrupo(actividadId);
      if (grupoActividad) return grupoActividad.nombre;
    }
    
    return 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Gestión de Pedidos</h2>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Buscador */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar pedidos..."
              className="pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filtro por estado */}
          <div>
            <select
              className="focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Pagado">Pagado</option>
            </select>
          </div>
          
          {/* Filtro por grupo */}
          <div>
            <select
              className="focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={filterGrupo}
              onChange={(e) => setFilterGrupo(e.target.value)}
            >
              <option value="">Todos los grupos</option>
              {grupos.map(grupo => (
                <option key={grupo._id || grupo.id} value={grupo._id || grupo.id}>
                  {grupo.nombre}
                </option>
              ))}
            </select>
          </div>
          
          {/* Filtro por actividad */}
          <div>
            <select
              className="focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={filterActividad}
              onChange={(e) => setFilterActividad(e.target.value)}
            >
              <option value="">Todas las actividades</option>
              {actividades.map(actividad => (
                <option key={actividad._id || actividad.id} value={actividad._id || actividad.id}>
                  {actividad.titulo}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : filteredPedidos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">
            {searchTerm || filterEstado || filterGrupo || filterActividad ? 
              `No se encontraron pedidos con los filtros aplicados.` : 
              'No hay pedidos disponibles.'}
          </p>
          {(searchTerm || filterEstado || filterGrupo || filterActividad) && (
            <button 
              onClick={() => {
                setSearchTerm('')
                setFilterEstado('')
                setFilterGrupo('')
                setFilterActividad('')
              }}
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPedidos.map((pedido) => (
                  <tr key={pedido._id || pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{formatId(pedido._id || pedido.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pedido.cliente_id?.nombre_completo || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getGrupoNombre(pedido)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pedido.actividad_id?.titulo || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pedido.opcion_id?.nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(pedido.fecha_pedido)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${pedido.costo_total ? Number(pedido.costo_total).toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pedido.estado_pago === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        pedido.estado_pago === 'Pagado' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {pedido.estado_pago || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/admin/pedidos/${pedido._id || pedido.id}`} className="text-primary-600 hover:text-primary-900 mr-4">
                        Ver detalles
                      </Link>
                      <div className="relative inline-block text-left group">
                        <button className="text-gray-600 hover:text-gray-900">
                          Cambiar estado ▼
                        </button>
                        <div className="hidden group-hover:block absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            {pedido.estado_pago !== 'Pendiente' && (
                              <button
                                onClick={() => handleChangeEstado(pedido._id || pedido.id, 'Pendiente')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Pendiente
                              </button>
                            )}
                            {pedido.estado_pago !== 'Pagado' && (
                              <button
                                onClick={() => handleChangeEstado(pedido._id || pedido.id, 'Pagado')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Pagado
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pedidos