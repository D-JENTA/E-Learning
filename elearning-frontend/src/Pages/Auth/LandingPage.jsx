import React from 'react';
import { Link } from 'react-router-dom';
import EduSpace from "../../assets/EduSpace.png";

export default function LandingPage() {
  const features = [
    {
      title: "Tugas Harian",
      desc: "Dapatkan materi harian dan daftar tugas terstruktur yang mudah dipahami.",
      icon: "M9 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-2a2 2 0 00-2 2H10a2 2 0 00-2-2z M9 12l2 2 4-4 M9 16l2 2 4-4"
    },
    {
      title: "Unlimited Access",
      desc: "Belajar dengan kecepatan Anda sendiri dengan ketersediaan materi 24/7.",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0"
    },
    {
      title: "Simplified Workflow",
      desc: "Rasakan antarmuka yang mulus dirancang khusus untuk guru dan siswa.",
      icon: "M4 12h16M14 6l6 6-6 6"
    }
  ];

  const scrollToFooter = (e) => {
    e.preventDefault();
    const footerElement = document.getElementById('footer');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      
      <nav className="bg-white/90 backdrop-blur-md fixed w-full z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <img src={EduSpace} alt="Logo" className="h-10 w-auto object-contain" />
              <span className="text-2xl font-bold text-[#0d264f] tracking-tight">Edu<span className="text-blue-500">Space</span></span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 font-medium">
            <a href="#about" onClick={scrollToSection('about')} className="hover:text-[#0d264f] transition-colors">About</a>
            <a href="#features" onClick={scrollToSection('features')} className="hover:text-[#0d264f] transition-colors">Features</a>
            <button 
              onClick={scrollToFooter}
              className="px-4 py-2.5 rounded-xl text-gray-600 font-medium text-sm sm:text-base border border-transparent hover:text-[#0d264f] transition-colors"
            >
              Contact
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            <button 
              onClick={scrollToFooter}
              className="px-4 py-2.5 sm:px-5 rounded-xl text-gray-600 font-medium text-sm sm:text-base border border-transparent md:hidden"
            >
              Contact
            </button>
            <Link 
              to="/login" 
              className="px-4 py-2.5 sm:px-5 rounded-xl border border-[#0d264f] text-[#0d264f] font-semibold hover:bg-[#0d264f] hover:text-white transition-all duration-300 text-sm sm:text-base"
            >
              Log In
            </Link>
            
            <Link 
              to="/create" 
              className="px-4 py-2.5 sm:px-5 rounded-xl text-white bg-gradient-to-r from-[#0d264f] to-[#1a3a75] font-bold hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md text-sm sm:text-base"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10">
           <div className="absolute inset-0 bg-gradient-to-b from-[#e0f2fe] to-gray-50 opacity-30"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#0d264f] tracking-tight mb-6 leading-tight animate-fade-in-up">
            Master New Skills.<br />
            <span className="text-blue-600">Shape Your Tomorrow.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah dengan platform pembelajaran generasi berikutnya yang dirancang untuk memberdayakan guru dan menginspirasi siswa. Rasakan pendidikan seperti sebelumnya.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/create" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-[#0d264f] to-[#1a3a75] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-xl"
            >
              Mulai Belajar Sekarang
            </Link>
          </div>
        </div>
      </div>

      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Tentang EduSpace</h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Kami percaya bahwa setiap siswa berhak mendapatkan akses ke pendidikan berkualitas tinggi. EduSpace dibangun untuk menjembatani kesenjangan antara guru dan siswa melalui teknologi yang intuitif.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Dengan fitur pengelolaan tugas yang terintegrasi dan materi yang mudah diakses, kami menciptakan ekosistem belajar yang kolaboratif dan efisien untuk semua pihak.
              </p>
            </div>
            <div className="relative">
               <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border border-blue-100 shadow-lg">
                  <div className="grid grid-cols-2 gap-4">
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 007-7h-14z" /></svg>
                        </div>
                        <span className="font-bold text-gray-700">Guru</span>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                         <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        </div>
                        <span className="font-bold text-gray-700">Siswa</span>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800">Fitur Unggulan</h2>
            <div className="h-1 w-20 bg-[#0d264f] mx-auto mt-4 rounded-full"></div>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">Semua yang Anda butuhkan untuk proses belajar mengajar yang lebih baik.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 shadow-sm text-[#0d264f]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="footer" className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4">
                   <img src={EduSpace} alt="Logo" className="w-8 h-8 object-contain" />
                   <span className="text-xl font-bold text-gray-800">EduSpace</span>
                </div>
              <p className="text-gray-500 leading-relaxed">
                Platform pendidikan masa depan untuk guru dan siswa yang lebih produktif.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-4">Perusahaan</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-[#0d264f] transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-[#0d264f] transition-colors">Karir</a></li>
                <li><a href="#" className="hover:text-[#0d264f] transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-4">Hubungi Kami</h4>
              <p className="text-gray-500 mb-4 break-words">support@eduspace.com</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#0d264f] hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832-.656-2.428-.775l-.452-.451-.108-.702-.24-.895H5.452c-.29 0-.533.246-.656.688L1.678 2.816c-.078.425-.24.775-.482 1.235-.775h.432c.29 0 .533-.246.656-.688.688l.552-.552.244-.702.656-1.235.775z"/></svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2025 EduSpace Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}