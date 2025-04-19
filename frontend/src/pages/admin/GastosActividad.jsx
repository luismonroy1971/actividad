import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import { getActividadById } from '../../store/slices/actividadSlice'
import { getGastosPorActividad, getResumenFinanciero, createGasto, updateGasto, deleteGasto, resetGastoState } from '../../store/slices/gastoSlice'

const GastosActividad = () => {
  const dispatch = useDispatch()
  const { actividadId } = useParams()
  const { userInfo } = useSelector((state) => state.auth)
  const { actividad } = useSelector((state) => state.actividades)
  const { gastos, resumenFinanciero, loading, error, success } = useSelector((state) => state.gastos)
  const [editMode, setEditMode] = useState(false)
  const [selectedGasto, setSelectedGasto] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [sortField, setSortField] = useState('fecha_gasto')
  const [sortDirection, setSortDirection] = useState('desc')
  const formRef = useRef(null)

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    concepto: '',
    monto: '',
    fecha_gasto: new Date().toISOString().split('T')[0],
    tipo: 'Variable',
    descripcion: ''
  })

  useEffect(() => {
    dispatch(getActividadById(actividadId))
    dispatch(getGastosPorActividad(actividadId))
    dispatch(getResumenFinanciero(actividadId))
    
    // Limpiar el estado cuando el componente se desmonte
    return () => {
      dispatch(resetGastoState())
    }
  }, [dispatch, actividadId])

  // Efecto para limpiar el formulario y actualizar datos cuando se crea un gasto exitosamente
  useEffect(() => {
    if (success) {
      setFormData({
        concepto: '',
        monto: '',
        fecha_gasto: new Date().toISOString().split('T')[0],
        tipo: 'Variable',
        descripcion: ''
      })
      setShowForm(false)
      dispatch(resetGastoState())
    }
  }, [success, dispatch])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const resetForm = () => {
    setFormData({
      concepto: '',
      monto: '',
      fecha_gasto: new Date().toISOString().split('T')[0],
      tipo: 'Variable',
      descripcion: ''
    })
    setSelectedGasto(null)
    setEditMode(false)
    setShowForm(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validar campos requeridos
    if (!formData.concepto || !formData.monto) {
      return alert('Por favor completa todos los campos requeridos')
    }
    
    const gastoData = {
      ...formData,
      actividad_id: actividadId,
      monto: parseFloat(formData.monto)
    }
    
    if (editMode && selectedGasto) {
      dispatch(updateGasto({ id: selectedGasto._id, gastoData }))
        .unwrap()
        .then(() => {
          resetForm()
        })
        .catch((error) => {
          console.error('Error al actualizar gasto:', error)
        })
    } else {
      dispatch(createGasto(gastoData))
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleEditGasto = (gasto) => {
    setSelectedGasto(gasto)
    setFormData({
      concepto: gasto.concepto,
      monto: gasto.monto,
      fecha_gasto: new Date(gasto.fecha_gasto).toISOString().split('T')[0],
      tipo: gasto.tipo,
      descripcion: gasto.descripcion || ''
    })
    setEditMode(true)
    setShowForm(true)
    
    // Desplazar la pantalla al formulario después de un breve retraso para asegurar que el formulario esté visible
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }
  
  const handleDeleteGasto = (gastoId) => {
    if (confirmDelete === gastoId) {
      dispatch(deleteGasto(gastoId))
        .unwrap()
        .then(() => {
          dispatch(getGastosPorActividad(actividadId))
          dispatch(getResumenFinanciero(actividadId))
          setConfirmDelete(null)
        })
        .catch((error) => {
          console.error('Error al eliminar gasto:', error)
        })
    } else {
      setConfirmDelete(gastoId)
    }
  }

  // Calcular la suma total de los gastos
  const totalGastos = gastos && gastos.length > 0 
    ? gastos.reduce((sum, gasto) => sum + (parseFloat(gasto.monto) || 0), 0)
    : 0
    
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Gestión Financiera: {actividad?.titulo}
            {gastos && gastos.length > 0 && (
              <span className="ml-2 text-lg font-medium text-gray-600">
                (Total: {formatCurrency(totalGastos)})
              </span>
            )}
          </h2>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editMode ? 'Editar gasto' : 'Registrar nuevo gasto'}
          </h3>
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
            <div className="bg-white rounded-lg shadow p-6 mb-6" ref={formRef}>
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

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : editMode ? 'Actualizar' : 'Guardar'}
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
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => {
                          setSortDirection(sortField === 'concepto' && sortDirection === 'asc' ? 'desc' : 'asc');
                          setSortField('concepto');
                        }}
                      >
                        Concepto
                        {sortField === 'concepto' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => {
                          setSortDirection(sortField === 'fecha_gasto' && sortDirection === 'asc' ? 'desc' : 'asc');
                          setSortField('fecha_gasto');
                        }}
                      >
                        Fecha
                        {sortField === 'fecha_gasto' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => {
                          setSortDirection(sortField === 'descripcion' && sortDirection === 'asc' ? 'desc' : 'asc');
                          setSortField('descripcion');
                        }}
                      >
                        Descripción
                        {sortField === 'descripcion' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...gastos].sort((a, b) => {
                      if (sortField === 'concepto') {
                        return sortDirection === 'asc' 
                          ? a.concepto.localeCompare(b.concepto) 
                          : b.concepto.localeCompare(a.concepto);
                      } else if (sortField === 'fecha_gasto') {
                        return sortDirection === 'asc' 
                          ? new Date(a.fecha_gasto) - new Date(b.fecha_gasto) 
                          : new Date(b.fecha_gasto) - new Date(a.fecha_gasto);
                      } else if (sortField === 'descripcion') {
                        const descA = a.descripcion || '';
                        const descB = b.descripcion || '';
                        return sortDirection === 'asc' 
                          ? descA.localeCompare(descB) 
                          : descB.localeCompare(descA);
                      }
                      return 0;
                    }).map((gasto) => (
                      <tr key={gasto._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {gasto.concepto}
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
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {gasto.descripcion || '-'}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditGasto(gasto)}
                      className="text-primary-600 hover:text-primary-900 flex items-center"
                      title="Editar gasto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="sr-only">Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteGasto(gasto._id)}
                      className="text-red-600 hover:text-red-900 flex items-center"
                      title={confirmDelete === gasto._id ? "Confirmar eliminación" : "Eliminar gasto"}
                    >
                      {confirmDelete === gasto._id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                      <span className="sr-only">{confirmDelete === gasto._id ? "Confirmar" : "Eliminar"}</span>
                    </button>
                  </div>
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