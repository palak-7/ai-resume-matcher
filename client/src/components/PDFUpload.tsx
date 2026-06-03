import { useState, useRef, type DragEvent } from 'react'
import api from '../services/api'

interface UploadedResume {
    id: string
    originalName: string
    textLength: number
}

interface PDFUploadProps {
    onUploadSuccess: (resume: UploadedResume) => void
}

const PDFUpload = ({ onUploadSuccess }: PDFUploadProps) => {
    const [isDragging, setIsDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [uploaded, setUploaded] = useState<UploadedResume | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const validateFile = (file: File): string | null => {
        if (file.type !== 'application/pdf') return 'Only PDF files are allowed'
        if (file.size > 5 * 1024 * 1024) return 'File size must be under 5MB'
        return null
    }

    const uploadFile = async (file: File) => {
        const validationError = validateFile(file)
        if (validationError) { setError(validationError); return }

        setError('')
        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('resume', file)

            const res = await api.post('/resume/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            const resume = res.data.resume
            setUploaded(resume)
            onUploadSuccess(resume)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) uploadFile(file)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) uploadFile(file)
    }

    if (uploaded) {
        return (
            <div className="border border-green-200 bg-green-50 rounded-xl p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-lg">
                        ✓
                    </div>
                    <div>
                        <p className="font-medium text-green-800 text-sm">{uploaded.originalName}</p>
                        <p className="text-green-600 text-xs mt-0.5">
                            {(uploaded.textLength / 1000).toFixed(1)}k characters extracted
                        </p>
                    </div>
                    <button
                        onClick={() => { setUploaded(null); setError('') }}
                        className="ml-auto text-xs text-green-600 hover:underline"
                    >
                        Change
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${isDragging
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">Uploading and extracting text...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl mb-1">📄</div>
                        <p className="text-sm font-medium text-gray-700">
                            Drag & drop your resume here
                        </p>
                        <p className="text-xs text-gray-400">or click to browse</p>
                        <p className="text-xs text-gray-400 mt-1">PDF only · Max 5MB</p>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-red-600 text-xs mt-2">{error}</p>
            )}
        </div>
    )
}

export default PDFUpload