import React from 'react'
import { motion } from 'framer-motion'

const VIDEO1 = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4'
const VIDEO2 = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4'

function Card({ video, tag, title, desc }: any) {
    return (
        <motion.div className="liquid-glass rounded-3xl overflow-hidden group" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="aspect-video overflow-hidden">
                <video src={video} muted autoPlay loop playsInline preload="auto" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            <div className="p-6 md:p-8 relative">
                <div className="flex items-center justify-between">
                    <div className="text-white/40 text-xs tracking-widest uppercase">{tag}</div>
                    <div className="liquid-glass rounded-full p-2" />
                </div>

                <h3 className="text-white text-xl md:text-2xl mb-3 tracking-tight">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </div>
        </motion.div>
    )
}

export default function ServicesSection() {
    return (
        <section className="bg-black py-28 md:py-40 px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-3xl md:text-5xl text-white tracking-tight">What we do</motion.h2>
                    <div className="text-white/40 text-sm hidden md:block">Our services</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <Card video={VIDEO1} tag="Strategy" title="Research & Insight" desc="We dig deep into data, culture, and human behavior to surface the insights that drive meaningful, lasting change." />
                    <Card video={VIDEO2} tag="Craft" title="Design & Execution" desc="From concept to launch, we obsess over every detail to deliver experiences that feel effortless and look extraordinary." />
                </div>
            </div>
        </section>
    )
}
