 'use client'

 import { useState } from 'react'
 import { supabase } from '@/lib/supabase'
 import { useAuthStore } from '@/lib/auth-store'
 import ProtectedRoute from '@/components/ProtectedRoute'

 export default function FamisanarPage() {
   const { user } = useAuthStore()
   const [file, setFile] = useState<File | null>(null)
   const [documentType, setDocumentType] = useState('')
   const [isUploading, setIsUploading] = useState(false)
   const [message, setMessage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     const selected = event.target.files?.[0] ?? null
     setFile(selected)
     setMessage(null)
   }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
    const dropped = event.dataTransfer.files?.[0] ?? null
    if (dropped) {
      setFile(dropped)
      setMessage(null)
    }
  }

   const handleUpload = async () => {
     if (!file) {
       setMessage('Selecciona un PDF para subir.')
       return
     }
     if (file.type !== 'application/pdf') {
       setMessage('Solo se permiten archivos PDF.')
       return
     }

     setIsUploading(true)
     setMessage(null)

     try {
       const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
       const safeName = file.name.replace(/\s+/g, '_')
       const path = `uploads/${timestamp}-${safeName}`
       const bucket = 'famisanar-documents'

       const { error: uploadError } = await supabase
         .storage
         .from(bucket)
         .upload(path, file, { upsert: false, contentType: file.type })

       if (uploadError) {
         throw new Error(uploadError.message)
       }

       const { data: publicUrlData } = supabase.storage
         .from(bucket)
         .getPublicUrl(path)

       const documentUrl = publicUrlData?.publicUrl
       if (!documentUrl) {
         throw new Error('No se pudo obtener la URL pública del documento.')
       }

       const { error: insertError } = await supabase
         .from('documents' as any)
         .insert({
           created_by: user?.email ?? null,
           document_url: documentUrl,
           document_name: file.name,
           document_type: documentType || null,
         })

       if (insertError) {
         throw new Error(insertError.message)
       }

       setMessage('Documento subido correctamente.')
       setFile(null)
       setDocumentType('')
     } catch (error: any) {
       setMessage(error?.message || 'No se pudo subir el documento.')
     } finally {
       setIsUploading(false)
     }
   }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Famisanar</h1>
          <p className="text-sm text-gray-600 mb-6">
            Sube documentos PDF para almacenamiento.
          </p>

         <div className="space-y-4">
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">
               Documento (PDF)
             </label>
            <div
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition-colors ${
                isDragging
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="famisanar-file-upload"
              />
              <label
                htmlFor="famisanar-file-upload"
                className="cursor-pointer font-semibold"
              >
                {file ? 'Cambiar archivo' : 'Arrastra un PDF o haz clic para seleccionar'}
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Solo PDF (máx. 10MB)
              </p>
            </div>
             {file && (
               <p className="text-xs text-gray-500 mt-1">
                 Archivo seleccionado: {file.name}
               </p>
             )}
           </div>

           <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">
               Tipo de documento (opcional)
             </label>
            <input
               type="text"
               value={documentType}
               onChange={(event) => setDocumentType(event.target.value)}
               placeholder="Ej. reserva, factura, etc."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
             />
           </div>

           <button
             onClick={handleUpload}
             disabled={isUploading}
             className={`w-full py-3 rounded-lg text-white font-bold transition-colors ${
               isUploading ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'
             }`}
           >
             {isUploading ? 'Subiendo...' : 'Subir documento'}
           </button>

          {message && (
            <div className="text-sm font-semibold text-green-900 bg-green-100 border border-green-200 rounded-lg px-4 py-3">
              {message}
            </div>
          )}
         </div>
        </div>
      </div>
    </ProtectedRoute>
   )
 }

