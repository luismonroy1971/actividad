import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { getActividadById, createActividad, updateActividad, resetActividadSuccess, uploadActividadImage } from '../../store/slices/actividadSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const ActividadForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { actividad, loading, error, success } = useSelector((state) => state.actividades)
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_actividad: '',
    lugar: '',
    precio: 0,
    imagen_promocional: ''
  })
  
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef(null)
  
  // Cargar datos de la actividad si estamos en modo edición
  useEffect(() => {
    if (id) {
      dispatch(getActividadById(id))
    } else {
      // Limpiar el estado si estamos creando una nueva actividad
      setFormData({
        titulo: '',
        descripcion: '',
        fecha_actividad: '',
        lugar: '',
        precio: 0,
        imagen_promocional: ''
      })
      setImagePreview('')
      setImageFile(null)
    }
  }, [dispatch, id])
  
  // Llenar el formulario con los datos de la actividad cuando se carga
  useEffect(() => {
    if (id && actividad) {
      console.log('Actividad cargada para edición:', actividad);
      
      // Obtener los datos de la actividad, ya sea de actividad directamente o de actividad.data
      const actividadData = actividad.data ? actividad.data : actividad;
      
      setFormData({
        titulo: actividadData.titulo || '',
        descripcion: actividadData.descripcion || '',
        fecha_actividad: actividadData.fecha_actividad ? new Date(actividadData.fecha_actividad).toISOString().split('T')[0] : '',
        lugar: actividadData.lugar || '',
        precio: Number(actividadData.precio) || 0,  // Convertir explícitamente a número
        imagen_promocional: actividadData.imagen_promocional || ''
      })
      
      if (actividadData.imagen_promocional) {
        setImagePreview(actividadData.imagen_promocional)
      }
    }
  }, [id, actividad])

  // Redireccionar después de guardar exitosamente
  useEffect(() => {
    if (submitted && success) {
      navigate('/admin/actividades')
      // Resetear el estado después de la redirección
      dispatch(resetActividadSuccess())
      setSubmitted(false)
    }
  }, [success, submitted, navigate, dispatch])
  
  // Resetear el estado de éxito cuando se desmonte el componente
  useEffect(() => {
    return () => {
      if (success) {
        dispatch(resetActividadSuccess())
      }
    }
  }, [dispatch, success])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Para el campo de precio, asegúrate de que siempre sea un número
    if (name === 'precio') {
      // Si el valor está vacío, usa 0, de lo contrario conviértelo a número
      const numberValue = value === '' ? 0 : Number(value)
      setFormData({
        ...formData,
        [name]: numberValue
      })
    } else {
      // Para otros campos, usa el valor normal
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.match('image.*')) {
      setUploadError('Por favor selecciona una imagen válida')
      return
    }
    
    setImageFile(file)
    setUploadError(null)
    
    // Mostrar vista previa de la imagen
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar campos requeridos
    if (!formData.titulo || !formData.descripcion || !formData.fecha_actividad || !formData.lugar) {
      return alert('Por favor completa todos los campos requeridos')
    }
    
    // Preparar datos para enviar
    const actividadData = {
      ...formData,
      precio: Number(formData.precio) || 0  // Asegurarse de que sea un número
    }
    
    try {
      if (id) {
        // Si estamos editando una actividad existente
        await dispatch(updateActividad({ id, actividadData })).unwrap()
        
        // Si hay una nueva imagen para subir, hacerlo después de actualizar los datos
        if (imageFile) {
          const formDataImg = new FormData()
          formDataImg.append('file', imageFile)
          setUploading(true)
          
          try {
            await dispatch(uploadActividadImage({ id, formData: formDataImg })).unwrap()
          } catch (error) {
            setUploadError(error || 'Error al subir la imagen')
          } finally {
            setUploading(false)
          }
        }
      } else {
        // Si estamos creando una nueva actividad
        // Para nuevas actividades, primero creamos sin imagen
        const newActividad = await dispatch(createActividad({
          ...actividadData,
          imagen_promocional: 'no-photo.jpg' // Valor predeterminado
        })).unwrap()
        
        // Luego, si hay una imagen para subir, la subimos para la actividad creada
        if (imageFile && newActividad.data && newActividad.data._id) {
          const newId = newActividad.data._id
          const formDataImg = new FormData()
          formDataImg.append('file', imageFile)
          setUploading(true)
          
          try {
            await dispatch(uploadActividadImage({ id: newId, formData: formDataImg })).unwrap()
          } catch (error) {
            setUploadError(error || 'Error al subir la imagen')
          } finally {
            setUploading(false)
          }
        }
      }
      
      setSubmitted(true)
    } catch (error) {
      console.error('Error al guardar actividad:', error)
      alert('Hubo un error al guardar la actividad')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {id ? 'Editar Actividad' : 'Crear Nueva Actividad'}
        </h2>
        <button
          onClick={() => navigate('/admin/actividades')}
          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
        >
          ← Volver a actividades
        </button>
      </div>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              
              {/* Fecha */}
              <div>
                <label htmlFor="fecha_actividad" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="fecha_actividad"
                  name="fecha_actividad"
                  value={formData.fecha_actividad}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              
              {/* Lugar */}
              <div>
                <label htmlFor="lugar" className="block text-sm font-medium text-gray-700 mb-1">
                  Lugar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lugar"
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              
              {/* Precio */}
              <div>
                <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="precio"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    className="pl-7 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              ></textarea>
            </div>
            
            {/* Subida de imagen */}
            <div>
              <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 mb-1">
                Imagen promocional
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  id="imagen"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 -ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                  Subir imagen
                </button>
                {imageFile && (
                  <span className="ml-3 text-sm text-gray-500">
                    {imageFile.name}
                  </span>
                )}
              </div>
              
              {uploading && <p className="mt-2 text-sm text-gray-500">Subiendo imagen...</p>}
              {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
              
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-1">Vista previa:</p>
                  <img 
                    src={
                      // Si es una URL de datos (Data URL), usarla directamente
                      imagePreview.startsWith('data:') 
                        ? imagePreview 
                        // Si no, construir la ruta al archivo en el servidor usando la URL base
                        : `${window.UPLOADS_URL}/uploads/actividades/${imagePreview}`
                    } 
                    alt="Vista previa" 
                    className="h-40 w-auto object-cover rounded-md border border-gray-300"
                    onError={(e) => {
                      console.log('Error al cargar la imagen:', e);
                      e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/admin/actividades')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={loading || uploading}
              >
                {loading || uploading ? 'Guardando...' : id ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default ActividadForm