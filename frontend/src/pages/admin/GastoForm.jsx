import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { createGasto, resetGastoState } from '../../store/slices/gastoSlice'
import { getActividadById } from '../../store/slices/actividadSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import formatDate from '../../utils/dateFormatter'

const GastoForm = () => {
  const { actividadId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { actividad, loading: actividadLoading } = useSelector((state) => state.actividades)
  const { loading, error, success } = useSelector((state) => state.gastos)
  
  const [formData, setFormData] = useState({
    concepto: '',
    monto: '',
    fecha_gasto: new Date().toISOString().split('T')[0],
    tipo: 'Variable',
    descripcion: ''
  })
  
  // Cargar datos de la actividad
  useEffect(() => {
    if (actividadId) {
      dispatch(getActividadById(actividadId))
    }
    
    // Limpiar estado al desmontar
    return () => {
      dispatch(resetGastoState())
    }
  }, [dispatch, actividadId])
  
  // Redireccionar después de guardar exitosamente
  useEffect(() => {
    if (success) {
      navigate(`/admin/actividades/${actividadId}/gastos`)
    }
  }, [success, navigate, actividadId])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validar campos requeridos
    if (!formData.concepto || !formData.monto || !formData.fecha_gasto) {
      return alert('Por favor completa todos los campos requeridos')
    }
    
    dispatch(createGasto({
      ...formData,
      actividad_id: actividadId,
      monto: parseFloat(formData.monto)
    }))
  }

  if (actividadLoading) return <Loader />
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Registrar Gasto para: {actividad?.titulo || 'Actividad'}
        </h2>
        <button
          onClick={() => navigate(`/admin/actividades/${actividadId}/gastos`)}
          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
        >
          ← Volver a gastos
        </button>
      </div>
      
      {error && <Message variant="error">{error}</Message>}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="concepto" className="block text-sm font-medium text-gray-700">
                Concepto <span className="text-red-500">*</span>
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
                Monto <span className="text-red-500">*</span>
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
                Fecha <span className="text-red-500">*</span>
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
                Tipo de gasto <span className="text-red-500">*</span>
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

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/admin/actividades/${actividadId}/gastos`)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GastoForm