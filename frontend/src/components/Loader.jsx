import React from 'react'

const Loader = ({ small }) => {
  return (
    <div className={`flex justify-center items-center ${small ? 'py-0' : 'py-8'}`}>
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary-600 ${small ? 'h-5 w-5' : 'h-12 w-12'}`}></div>
    </div>
  )
}

export default Loader