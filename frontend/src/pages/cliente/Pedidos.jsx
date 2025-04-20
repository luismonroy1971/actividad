import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { getPedidos } from '../../store/slices/pedidoSlice'
import { getClientePedidos } from '../../store/slices/pedidoSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const Pedidos = () => {
  const dispatch = useDispatch()
  const { userInfo } = useSelector((state) => state.auth)
  const { pedidos = [], loading = false, error = null } = useSelector((state) => state.pedido || {})
  const [filteredPedidos, setFilteredPedidos] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('todos')
  
  useEffect(() => {
    dispatch(getClientePedidos())
  }, [dispatch])
  
  useEffect(() => {
    // Filtrar pedidos del cliente actual
    const clientePedidos = pedidos?.filter(pedido => {
      // Comparar como strings para mayor seguridad
      const pedidoClienteId = pedido.cliente_id?._id || pedido.cliente_id;
      const userClienteId = userInfo?.cliente_id;
      
      console.log('Pedido ID:', pedido.id, 'Cliente ID del pedido:', pedidoClienteId, 'Cliente ID del usuario:', userClienteId);
      
      return pedidoClienteId && userClienteId && 
             String(pedidoClienteId) === String(userClienteId);
    }) || []
    
    // Aplicar filtro por estado
    if (filtroEstado === 'todos') {
      setFilteredPedidos(clientePedidos)
    } else {
      setFilteredPedidos(clientePedidos.filter(pedido => pedido.estado === filtroEstado))
    }
  }, [pedidos, filtroEstado, userInfo])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Mis Pedidos</h2>
        
        {/* Filtros */}
        <div className="flex items-center space-x-2">
          <label htmlFor="filtroEstado" className="text-sm font-medium text-gray-700">Filtrar por:</label>
          <select
            id="filtroEstado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="completado">Completados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : filteredPedidos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">No tienes pedidos {filtroEstado !== 'todos' ? `con estado "${filtroEstado}"` : ''}</p>
          <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            Explorar actividades
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{pedido.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pedido.actividad?.nombre || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pedido.fecha_pedido).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        pedido.estado === 'completado' ? 'bg-green-100 text-green-800' :
                        pedido.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${pedido.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/cliente/pedidos/${pedido.id}`} className="text-primary-600 hover:text-primary-900">
                        Ver detalles
                      </Link>
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