/**
 * Formatea una fecha ISO para mostrarla en formato DD/MM/YYYY
 * @param {string} dateString - String de fecha en formato ISO o similar
 * @return {string} Fecha formateada como DD/MM/YYYY
 */
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // Si es un formato ISO con 'T' (como 2025-05-01T00:00:00.000+00:00)
      if (dateString.includes('T')) {
        // Extraer solo la parte de la fecha (YYYY-MM-DD)
        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Si es solo fecha en formato YYYY-MM-DD
      if (dateString.includes('-') && dateString.split('-').length === 3) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // En caso que sea un objeto Date o necesite otra manipulación
      const date = new Date(dateString);
      
      // Verificar que la fecha sea válida
      if (isNaN(date.getTime())) {
        console.error('Fecha inválida:', dateString);
        return 'Fecha inválida';
      }
      
      // Construir la fecha manualmente para evitar problemas de zona horaria
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Los meses en JS van de 0-11
      const year = date.getUTCFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'N/A';
    }
  };
  
  export default formatDate;