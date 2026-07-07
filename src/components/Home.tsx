import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  IndianRupee, 
  Phone, 
  Mail, 
  Award, 
  Users, 
  Trophy, 
  Coffee, 
  ArrowRight,
  Sparkles,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  GraduationCap
} from 'lucide-react';

const collegeLogo = 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=200';
const eventBanner = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200';

interface HomeProps {
  setCurrentTab: (tab: 'home' | 'register' | 'admin-login' | 'admin-dashboard') => void;
  events?: any[];
  eventDate?: string;
}

export default function Home({ setCurrentTab, events = [], eventDate = '2026-10-24T09:00:00' }: HomeProps) {
  // Countdown Timer Logic
  const targetTime = new Date(eventDate).getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  const minFee = events.length > 0 ? Math.min(...events.map(e => e.fee)) : 100;
  
  const EVENT_COLORS = [
    { hover: 'hover:border-blue-600', tag: 'bg-blue-50 text-blue-700 border-blue-100', name: 'WebCraft' },
    { hover: 'hover:border-indigo-600', tag: 'bg-indigo-50 text-indigo-700 border-indigo-100', name: 'CodeForge' },
    { hover: 'hover:border-amber-600', tag: 'bg-amber-50 text-amber-700 border-amber-100', name: 'TechQuiz' },
    { hover: 'hover:border-teal-600', tag: 'bg-teal-50 text-teal-700 border-teal-100', name: 'PaperPres' },
    { hover: 'hover:border-pink-600', tag: 'bg-pink-50 text-pink-700 border-pink-100', name: 'UI Odyssey' },
    { hover: 'hover:border-rose-600', tag: 'bg-rose-50 text-rose-700 border-rose-100', name: 'RoboWars' }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans">
      
      {/* 1. College Header Header Bar */}
      <div className="bg-slate-900 text-white py-1.5 px-3 sm:px-4 lg:px-6 border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <img 
              src={collegeLogo} 
              alt="Apex College Logo" 
              className="h-8 w-8 rounded border border-white/20 bg-white object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <h4 className="font-extrabold tracking-wide text-xs sm:text-sm text-slate-100 leading-none">APEX INSTITUTE OF TECHNOLOGY</h4>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Affiliated to State Tech University • Approved by AICTE • NAAC A++ Grade</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-300">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-blue-400" />
              +91 98765 43210
            </span>
            <span className="h-2.5 w-[1px] bg-slate-700 hidden sm:inline"></span>
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3 text-blue-400" />
              symposium@apex.edu.in
            </span>
          </div>
        </div>
      </div>

      {/* 2. Hero Banner Section */}
      <div className="relative overflow-hidden bg-slate-950 text-white py-8 lg:py-10 px-3 sm:px-4 lg:px-6 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-y-0 right-0 w-1/2 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800/40">
              <Sparkles className="h-3 w-3 text-blue-400 animate-pulse" />
              NATIONAL TECHNICAL SYMPOSIUM 2026
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-none">
              PINNACLE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">2026</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl font-normal leading-relaxed">
              Apex Institute of Technology's premier national tech arena. Over 1,500+ participants compete, build, and innovate across six state-of-the-art developer domains.
            </p>

            {/* Event Meta Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1.5">
              <div className="bg-slate-900/65 rounded p-2 border border-slate-800 hover:bg-slate-900 transition-colors">
                <Calendar className="h-4 w-4 text-teal-400 mb-0.5" />
                <span className="block text-[9px] font-semibold text-slate-500">Date</span>
                <span className="text-xs font-bold text-slate-200">Oct 24, 2026</span>
              </div>
              <div className="bg-slate-900/65 rounded p-2 border border-slate-800 hover:bg-slate-900 transition-colors">
                <MapPin className="h-4 w-4 text-blue-400 mb-0.5" />
                <span className="block text-[9px] font-semibold text-slate-500">Venue</span>
                <span className="text-xs font-bold text-slate-200">Main Campus</span>
              </div>
              <div className="bg-slate-900/65 rounded p-2 border border-slate-800 hover:bg-slate-900 transition-colors col-span-2 sm:col-span-1">
                <IndianRupee className="h-4 w-4 text-emerald-400 mb-0.5" />
                <span className="block text-[9px] font-semibold text-slate-500">Registration</span>
                <span className="text-xs font-bold text-slate-200">From ₹{minFee}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                id="hero-register-btn"
                onClick={() => setCurrentTab('register')}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded shadow transition-all cursor-pointer"
              >
                <span>Register Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#details"
                className="inline-flex items-center justify-center px-5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded border border-slate-800 transition-colors text-center cursor-pointer"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Event Banner Illustration with Card Container */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-blue-500 rounded blur-xl opacity-10 transform scale-95"></div>
            <div className="relative bg-slate-900 p-1.5 rounded border border-slate-800 shadow-xl">
              <img 
                src={eventBanner} 
                alt="Pinnacle 2026 Event Banner" 
                className="w-full h-auto rounded-sm object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-2.5 bg-slate-900">
                <h3 className="text-xs font-bold text-teal-400">Pinnacle '26 Event Banner</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Join technical conferences, speed-coding arenas, and hardware battles.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Real-time Countdown Timer */}
      <div className="bg-white py-4 border-b border-slate-200 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-3">
            <h3 className="text-[10px] font-bold text-blue-700 tracking-wider uppercase">The Countdown Has Begun</h3>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">Registrations Closing Soon!</h2>
          </div>
          <div className="flex justify-center items-center space-x-2 sm:space-x-4 max-w-md mx-auto">
            <div className="bg-slate-50 rounded p-2 w-14 sm:w-16 text-center border border-slate-200 shadow-sm">
              <span className="block text-lg sm:text-xl font-black text-slate-900 tracking-tight">{String(timeLeft.days).padStart(2, '0')}</span>
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Days</span>
            </div>
            <span className="text-lg font-bold text-slate-400">:</span>
            <div className="bg-slate-50 rounded p-2 w-14 sm:w-16 text-center border border-slate-200 shadow-sm">
              <span className="block text-lg sm:text-xl font-black text-slate-900 tracking-tight">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Hours</span>
            </div>
            <span className="text-lg font-bold text-slate-400">:</span>
            <div className="bg-slate-50 rounded p-2 w-14 sm:w-16 text-center border border-slate-200 shadow-sm">
              <span className="block text-lg sm:text-xl font-black text-slate-900 tracking-tight">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Mins</span>
            </div>
            <span className="text-lg font-bold text-slate-400">:</span>
            <div className="bg-slate-50 rounded p-2 w-14 sm:w-16 text-center border border-slate-200 shadow-sm">
              <span className="block text-lg sm:text-xl font-black text-blue-700 tracking-tight">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Secs</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. About the Event & Why Participate Sections */}
      <section id="details" className="py-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* About Section */}
        <div className="lg:col-span-6 space-y-3">
          <div className="border-l-2 border-blue-700 pl-3">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-blue-700">The Ultimate Symposium</h2>
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900 mt-0.5">About Pinnacle 2026</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Welcome to <strong>Pinnacle '26</strong>, a high-octane engineering convention organized by the Apex Association of Student Developers. Our primary mandate is to push students' technical capacity from conceptual theory into high-performance engineering output. 
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            This year, we feature multi-threaded hack-challenges, state-of-the-art design stages, hardware battles, and prestigious research presentation rounds. Highly esteemed industry judges from pioneer technical conglomerates will evaluate submissions, offer mentorship, and recruit outstanding participants.
          </p>
          <div className="bg-slate-50 rounded p-3.5 border border-slate-200 flex items-start gap-3">
            <Award className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-950 text-xs">Recognized & Accredited</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Certificates are formally endorsed by state engineering authorities and can be linked to professional student credit points.</p>
            </div>
          </div>
        </div>

        {/* Why Participate Section */}
        <div className="lg:col-span-6 space-y-3">
          <div className="border-l-2 border-teal-600 pl-3">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Gain the Advantage</h2>
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900 mt-0.5">Why Participate?</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
              <Trophy className="h-6 w-6 text-yellow-500 mb-2" />
              <div>
                <h4 className="font-bold text-slate-950 text-xs">Mega Cash Prizes</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Win substantial cash awards, technical merchandise, and trophies across 1st, 2nd, and 3rd tiers.</p>
              </div>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
              <Users className="h-6 w-6 text-blue-500 mb-2" />
              <div>
                <h4 className="font-bold text-slate-950 text-xs">Peer Networking</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Forge lasting connections with top technical peers from diverse engineering backgrounds.</p>
              </div>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
              <Award className="h-6 w-6 text-teal-500 mb-2" />
              <div>
                <h4 className="font-bold text-slate-950 text-xs">Resume Booster</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Showcase your verified technical participation and accomplishments to top-tier recruiters.</p>
              </div>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
              <Coffee className="h-6 w-6 text-emerald-500 mb-2" />
              <div>
                <h4 className="font-bold text-slate-950 text-xs">Complimentary Food</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Enjoy a chef-crafted lunch, high-tea cookies, and delicious hot coffee/beverages free of cost.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Event Highlights Cards Section */}
      <section className="bg-slate-50 py-8 px-3 sm:px-4 lg:px-6 border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 max-w-2xl mx-auto">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">Dynamic Arenas</span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1.5">Featured Symposium Events</h2>
            <p className="text-slate-500 text-xs mt-1">Choose your arena and demonstrate your talent. Students from all colleges and engineering streams can register.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev, index) => {
              const colorInfo = EVENT_COLORS[index % EVENT_COLORS.length];
              return (
                <div 
                  key={ev.id || index} 
                  id={`event-card-${ev.id || index}`}
                  className={`bg-white rounded border border-slate-200 p-4 shadow-sm ${colorInfo.hover} transition-all duration-200`}
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colorInfo.tag}`}>
                      {colorInfo.name || ev.id || 'Symposium'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Code: {ev.id || 'EVNT'}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-950">{ev.name}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    {ev.description || 'Dynamic technical arena challenge.'}
                  </p>
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-slate-500 flex items-center">Entry Fee: ₹{ev.fee}</span>
                    <span className="font-bold text-teal-700 flex items-center">Prize pool: ₹{ev.prizePool}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-6">
            <button
              id="highlights-register-btn"
              onClick={() => setCurrentTab('register')}
              className="inline-flex items-center justify-center gap-1.5 px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded shadow cursor-pointer transition-colors"
            >
              <span>Proceed to Event Registration</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-slate-950 text-slate-300 pt-10 pb-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-slate-800">
          
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-700 text-white">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-extrabold tracking-tight text-white block">APEX INSTITUTE</span>
                <span className="text-[8px] font-bold text-blue-400 tracking-wider uppercase block -mt-0.5">OF TECHNOLOGY</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Educating future global leaders, establishing state engineering solutions, and promoting deep technical innovation across disciplines.
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <a href="#" className="p-1.5 rounded bg-slate-900 text-blue-400 hover:bg-blue-700 hover:text-white transition-colors">
                <Facebook className="h-3.5 w-3.5" />
              </a>
              <a href="#" className="p-1.5 rounded bg-slate-900 text-blue-400 hover:bg-blue-700 hover:text-white transition-colors">
                <Twitter className="h-3.5 w-3.5" />
              </a>
              <a href="#" className="p-1.5 rounded bg-slate-900 text-blue-400 hover:bg-blue-700 hover:text-white transition-colors">
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a href="#" className="p-1.5 rounded bg-slate-900 text-blue-400 hover:bg-blue-700 hover:text-white transition-colors">
                <Linkedin className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h3 className="text-[10px] font-bold tracking-wider uppercase text-blue-400">Quick Contact Info</h3>
            <ul className="space-y-2 text-[10px] text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-blue-500" />
                <span>Hotline: +91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-blue-500" />
                <span>E-mail: symposium@apex.edu.in</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                <span>Apex Campus Road, IT Corridor, South Zone</span>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h3 className="text-[10px] font-bold tracking-wider uppercase text-blue-400">Important Disclaimers</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Online registration closes on <strong>October 20, 2026</strong>. Late spot registrations will incur an additional charge of ₹500. All registrations must be verified using correct transaction logs in the Admin interface.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 flex flex-col sm:flex-row justify-between items-center text-[9px] text-slate-500">
          <p>© 2026 Apex Institute of Technology. All Rights Reserved. Managed by Dept of CS.</p>
          <p className="mt-1 sm:mt-0 uppercase tracking-widest font-mono">Precision Full-Stack Engineering Platform</p>
        </div>
      </footer>

    </div>
  );
}
