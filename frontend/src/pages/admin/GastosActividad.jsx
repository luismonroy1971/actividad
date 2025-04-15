import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const GastosActividad = () => {
  const { actividadId } = useParams()
  const { userInfo } = useSelector((state) => state.auth)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [actividad, setActividad] = useState(null)
  const [gastos, setGastos] = useState([])
  const [resumenFinanciero, setResumenFinanciero] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    concepto: '',
    monto: '',
    fecha_gasto: new Date().toISOString().split('T')[0],
    tipo: 'Variable',
    descripcion: ''
  })

  useEffect(() => {
    fetchActividad()
    fetchGastos()
    fetchResumenFinanciero()
  }, [actividadId])

  const fetchActividad = async () => {
    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      
      const { data } = await axios.get(`/api/actividades/${actividadId}`, config)
      setActividad(data)
      setLoading(false)
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
      setLoading(false)
    }
  }

  const fetchGastos = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      
      const { data } = await axios.get(`/api/gastos/actividad/${actividadId}`, config)
      setGastos(data.data || [])
    } catch (error) {
      console.error('Error al cargar gastos:', error)
    }
  }

  const fetchResumenFinanciero = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      
      const { data } = await axios.get(`/api/gastos/resumen/${actividadId}`, config)
      setResumenFinanciero(data)
    } catch (error) {
      console.error('Error al cargar resumen financiero:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      
      await axios.post('/api/gastos', {
        ...formData,
        actividad_id: actividadId,
        monto: parseFloat(formData.monto)
      }, config)
      
      // Resetear formulario y actualizar datos
      setFormData({
        concepto: '',
        monto: '',
        fecha_gasto: new Date().toISOString().split('T')[0],
        tipo: 'Variable',
        descripcion: ''
      })
      setShowForm(false)
      fetchGastos()
      fetchResumenFinanciero()
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Gestión Financiera: {actividad?.titulo}
          </h2>
          <p className="text-sm text-gray-500">
            Administre los gastos y revise el punto de equilibrio de esta actividad
          </p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {showForm ? 'Cancelar' : 'Registrar Gasto'}
        </button>
      </div>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <>
          {/* Formulario de registro de gastos */}
          {showForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Registrar nuevo gasto</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="concepto" className="block text-sm font-medium text-gray-700">
                      Concepto
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="concepto"
                        id="concepto"
                        required
                        value={formData.concepto}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
                      Monto
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="monto"
                        id="monto"
                        required
                        min="0"
                        step="1000"
                        value={formData.monto}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="fecha_gasto" className="block text-sm font-medium text-gray-700">
                      Fecha
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="fecha_gasto"
                        id="fecha_gasto"
                        required
                        value={formData.fecha_gasto}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                      Tipo de gasto
                    </label>
                    <div className="mt-1">
                      <select
                        id="tipo"
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="Fijo">Fijo</option>
                        <option value="Variable">Variable</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="descripcion"
                        name="descripcion"
                        rows="3"
                        value={formData.descripcion}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Resumen financiero */}
          {resumenFinanciero && (
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Resumen Financiero</h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Ingresos Totales</dt>
                    <dd className="mt-1 text-lg font-semibold text-green-600">
                      {formatCurrency(resumenFinanciero.ingresos_totales)}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Gastos Totales</dt>
                    <dd className="mt-1 text-lg font-semibold text-red-600">
                      {formatCurrency(resumenFinanciero.gastos_totales)}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Balance</dt>
                    <dd className={`mt-1 text-lg font-semibold ${resumenFinanciero.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(resumenFinanciero.balance)}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Gastos Fijos</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-700">
                      {formatCurrency(resumenFinanciero.gastos_fijos)}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Gastos Variables</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-700">
                      {formatCurrency(resumenFinanciero.gastos_variables)}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Punto de Equilibrio</dt>
                    <dd className="mt-1 text-lg font-semibold text-indigo-600">
                      {formatCurrency(resumenFinanciero.punto_equilibrio)}
                    </dd>
                  </div>
                  <div className="sm:col-span-3">
                    <dt className="text-sm font-medium text-gray-500">Rentabilidad</dt>
                    <dd className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${resumenFinanciero.rentabilidad_porcentaje >= 0 ? 'bg-green-600' : 'bg-red-600'}`}
                          style={{ width: `${Math.abs(Math.min(Math.max(resumenFinanciero.rentabilidad_porcentaje, -100), 100))}%` }}
                        ></div>
                      </div>
                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {resumenFinanciero.rentabilidad_porcentaje >= 0 
                          ? `Rentabilidad: ${resumenFinanciero.rentabilidad_porcentaje.toFixed(2)}%` 
                          : `Pérdida: ${Math.abs(resumenFinanciero.rentabilidad_porcentaje).toFixed(2)}%`}
                      </p>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* Lista de gastos */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Registro de Gastos</h3>
              <span className="text-sm text-gray-500">{gastos.length} gastos registrados</span>
            </div>
            
            {gastos.length === 0 ? (
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                No hay gastos registrados para esta actividad.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Concepto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registrado por
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {gastos.map((gasto) => (
                      <tr key={gasto._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {gasto.concepto}
                          {gasto.descripcion && (
                            <p className="text-xs text-gray-500 mt-1">{gasto.descripcion}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(gasto.monto)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(gasto.fecha_gasto).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${gasto.tipo === 'Fijo' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {gasto.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {gasto.registrado_por?.nombre_usuario || 'Sistema'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default GastosActividad