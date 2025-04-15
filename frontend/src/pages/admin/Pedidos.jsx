import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { getPedidos, updatePedidoEstado } from '../../store/slices/pedidoSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const Pedidos = () => {
  const dispatch = useDispatch()
  const { pedidos, loading, error, success } = useSelector((state) => state.pedidos)
  const [filteredPedidos, setFilteredPedidos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  
  useEffect(() => {
    dispatch(getPedidos())
  }, [dispatch, success])
  
  useEffect(() => {
    if (pedidos) {
      // Filtrar pedidos por término de búsqueda y estado
      let filtered = [...pedidos]
      
      if (searchTerm) {
        filtered = filtered.filter(pedido => 
          pedido.id.toString().includes(searchTerm) ||
          (pedido.cliente?.nombre && pedido.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (pedido.cliente?.apellido && pedido.cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (pedido.actividad?.nombre && pedido.actividad.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }
      
      if (filterEstado) {
        filtered = filtered.filter(pedido => pedido.estado === filterEstado)
      }
      
      setFilteredPedidos(filtered)
    }
  }, [pedidos, searchTerm, filterEstado])

  const handleChangeEstado = (id, nuevoEstado) => {
    if (window.confirm(`¿Estás seguro de cambiar el estado del pedido a ${nuevoEstado}?`)) {
      dispatch(updatePedidoEstado({ id, estado: nuevoEstado }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Gestión de Pedidos</h2>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
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
            {searchTerm || filterEstado ? 
              `No se encontraron pedidos con los filtros aplicados.` : 
              'No hay pedidos disponibles.'}
          </p>
          {(searchTerm || filterEstado) && (
            <button 
              onClick={() => {
                setSearchTerm('')
                setFilterEstado('')
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{pedido.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pedido.cliente ? `${pedido.cliente.nombre} ${pedido.cliente.apellido}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pedido.actividad ? pedido.actividad.nombre : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pedido.fecha_pedido).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${pedido.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        pedido.estado === 'confirmado' ? 'bg-blue-100 text-blue-800' :
                        pedido.estado === 'completado' ? 'bg-green-100 text-green-800' :
                        pedido.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/admin/pedidos/${pedido.id}`} className="text-primary-600 hover:text-primary-900 mr-4">
                        Ver detalles
                      </Link>
                      <div className="relative inline-block text-left group">
                        <button className="text-gray-600 hover:text-gray-900">
                          Cambiar estado ▼
                        </button>
                        <div className="hidden group-hover:block absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            {pedido.estado !== 'pendiente' && (
                              <button
                                onClick={() => handleChangeEstado(pedido.id, 'pendiente')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Pendiente
                              </button>
                            )}
                            {pedido.estado !== 'confirmado' && (
                              <button
                                onClick={() => handleChangeEstado(pedido.id, 'confirmado')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Confirmado
                              </button>
                            )}
                            {pedido.estado !== 'completado' && (
                              <button
                                onClick={() => handleChangeEstado(pedido.id, 'completado')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Completado
                              </button>
                            )}
                            {pedido.estado !== 'cancelado' && (
                              <button
                                onClick={() => handleChangeEstado(pedido.id, 'cancelado')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Cancelado
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