import React, { useState, useRef, useEffect } from 'react'

interface Props {
    projectDir: string | null
    isSimulated: boolean
    previewUrl?: string | null
    previewHtml?: string | null
    onClose: () => void
}

export default function ProjectPreview({ projectDir, isSimulated, previewUrl, previewHtml, onClose }: Props) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isFullScreen, setIsFullScreen] = useState(false)

    useEffect(() => {
        // For simulated projects with blob URL or HTML
        if (isSimulated) {
            if (previewUrl) {
                // Blob URL provided
                if (iframeRef.current) {
                    iframeRef.current.src = previewUrl
                }
            } else if (previewHtml) {
                // HTML content provided
                if (iframeRef.current) {
                    iframeRef.current.srcdoc = previewHtml
                }
            }
            setLoading(false)
            return
        }

        // For real projects - load from API
        if (!projectDir) {
            setError('No project directory specified')
            setLoading(false)
            return
        }

        const loadProject = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await fetch(`/api/project-view/${projectDir}`)
                if (!response.ok) {
                    throw new Error(`Failed to load project: ${response.statusText}`)
                }
                const html = await response.text()

                if (iframeRef.current) {
                    iframeRef.current.srcdoc = html
                }
                setLoading(false)
            } catch (err) {
                console.error('Error loading project:', err)
                setError(err instanceof Error ? err.message : 'Unknown error')
                setLoading(false)
            }
        }

        loadProject()
    }, [projectDir, isSimulated, previewUrl, previewHtml])

    const handleFullScreenToggle = () => {
        if (!document.fullscreenElement) {
            iframeRef.current?.requestFullscreen().catch(err => {
                console.error('Error entering fullscreen:', err)
            })
            setIsFullScreen(true)
        } else {
            document.exitFullscreen()
            setIsFullScreen(false)
        }
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-background border border-neon/30 rounded-lg p-6 max-w-md w-full">
                    <h2 className="text-xl font-bold text-cream mb-2">Preview Error</h2>
                    <p className="text-cream/70 mb-4">{error}</p>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-neon/20 border border-neon hover:bg-neon/30 transition-colors text-cream rounded"
                    >
                        Close
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Modal Preview */}
            {!isFullScreen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background border border-neon/30 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-neon/30">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                                <h2 className="text-lg font-bold text-cream">Live Project Preview</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleFullScreenToggle}
                                    className="p-2 hover:bg-white/10 rounded transition-colors text-cream/70 hover:text-cream"
                                    title="Toggle fullscreen"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6v4m12-4h4v4M6 18h4v-4m12 4h-4v-4" />
                                    </svg>
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded transition-colors text-cream/70 hover:text-cream"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex-1 flex items-center justify-center min-h-[500px]">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-2 border-neon/30 border-t-neon rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-cream/70">Loading project...</p>
                                </div>
                            </div>
                        )}

                        {/* Iframe */}
                        {!loading && (
                            <div className="flex-1 w-full overflow-hidden">
                                <iframe
                                    ref={iframeRef}
                                    className="w-full h-full border-0 bg-white"
                                    title="Project Preview"
                                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-pointer-lock"
                                    style={{ minHeight: '500px' }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Fullscreen Preview */}
            {isFullScreen && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col">
                    <div className="p-4 border-b border-neon/30 flex items-center justify-between bg-background">
                        <h2 className="text-lg font-bold text-cream">Live Project Preview (Fullscreen)</h2>
                        <button
                            onClick={() => {
                                document.exitFullscreen().catch(() => { })
                                setIsFullScreen(false)
                            }}
                            className="p-2 hover:bg-white/10 rounded transition-colors text-cream/70 hover:text-cream"
                        >
                            ✕ Exit Fullscreen
                        </button>
                    </div>
                    <iframe
                        ref={iframeRef}
                        className="flex-1 w-full border-0 bg-white"
                        title="Project Preview Fullscreen"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-pointer-lock"
                    />
                </div>
            )}
        </>
    )
}