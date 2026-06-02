import React from 'react'
import { Globe } from 'lucide-react'

export default function Navbar() {
    return (
        <nav className="relative z-20 px-6 py-6">
            <div className="liquid-glass rounded-full max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
                <div className="flex items-center">
                    <Globe color="white" size={24} />
                    <span className="text-white font-semibold text-lg ml-3">Asme</span>
                    <div className="hidden md:flex items-center gap-8 ml-8">
                        <a className="text-white/80 hover:text-white text-sm font-medium">Features</a>
                        <a className="text-white/80 hover:text-white text-sm font-medium">Pricing</a>
                        <a className="text-white/80 hover:text-white text-sm font-medium">About</a>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="text-white text-sm font-medium">Sign Up</button>
                    <button className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium">Login</button>
                </div>
            </div>
        </nav>
    )
}
