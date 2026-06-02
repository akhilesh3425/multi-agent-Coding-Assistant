import React from 'react'
import { motion } from 'framer-motion'

const VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4'

export default function PhilosophySection() {
    return (
        <section className="bg-black py-28 md:py-40 px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <motion.h2 initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-5xl md:text-7xl lg:text-8xl text-white tracking-tight mb-16 md:mb-24">
                    <span className="italic text-white/40">Innovation then x</span> Vision
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="rounded-3xl overflow-hidden aspect-[4/3]">
                        <video src={VIDEO} muted autoPlay loop playsInline preload="auto" className="w-full h-full object-cover" />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                        <div className="p-0">
                            <div className="mb-6">
                                <div className="text-white/40 text-xs tracking-widest uppercase mb-4">Choose your space</div>
                                <div className="text-white/70 text-base md:text-lg leading-relaxed">Every meaningful breakthrough begins at the intersection of disciplined strategy and remarkable creative vision. We operate at that crossroads, turning bold thinking into tangible outcomes that move people and reshape industries.</div>
                            </div>

                            <div className="w-full h-px bg-white/10 my-6" />

                            <div>
                                <div className="text-white/40 text-xs tracking-widest uppercase mb-4">Shape the future</div>
                                <div className="text-white/70 text-base md:text-lg leading-relaxed">We believe that the best work emerges when curiosity meets conviction. Our process is designed to uncover hidden opportunities and translate them into experiences that resonate long after the first impression.</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
