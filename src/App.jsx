import { useState } from 'react'
import logo from './assets/Real Media logo.png'
import mineTrailer from './assets/MINE OFFICIAl TRAILER .mp4'
import mineEpisodeTrailer from './assets/trailer of ep -1 Mine.mov'
import cybersecurityProject from './assets/Tech and policy Sybercecurity project .mp4'
import batchPromo from './assets/BATCH 2.0.mp4'
import robloxSquidGame from './assets/I Moved at the WRONG Time in Roblox Squid Game… 😰.mp4'
import drSabrinaEdit from './assets/CORECT DR SABRINA.mp4'
import bronzeToHeroic from './assets/BRONZE TO HEROIC Journey Begins! _ Free Fire Ranked Push Series Day 1.mp4'
import gameChangeSong from './assets/GAME CHANGE OFFICIAL SONG (MUSIC VIDEO).mp4'
import projectEditOne from './assets/0f4c36851e92429b9f253cffae1af12b.MP4'
import projectEditTwo from './assets/58ca08029b2549e88071de36a27ee490.MP4'
import projectEditThree from './assets/2e8cd3fc9a92496a83850bca28fe88de.MP4'
import projectEditFour from './assets/64b18c4b93af4e44854434bf0c855f64.MP4'
import projectEditFive from './assets/7cc07f49a0c64aea82cf8953df830711.MP4'
import projectEditSix from './assets/6adcf678bdb4473aa1c37fac4a6652cf.MP4'
import brandImageOne from './assets/IMG_3054.jpg'
import brandImageTwo from './assets/IMG_3052 (1).jpg'

export default function RealMediaWebsite() {
  const [selectedService, setSelectedService] = useState(null)
  const [activeVideo, setActiveVideo] = useState(null)

  const portfolioData = {
    'Video Editing': [
      {
        title: 'Mine Official Trailer',
        video: mineTrailer,
      },
      {
        title: 'Mine Episode 1 Trailer',
        video: mineEpisodeTrailer,
      },
      {
        title: 'Cybersecurity Project Edit',
        video: cybersecurityProject,
      },
      {
        title: 'Batch 2.0 Promo Edit',
        video: batchPromo,
      },
      {
        title: 'Roblox Squid Game Edit',
        video: robloxSquidGame,
      },
      {
        title: 'Dr Sabrina Client Edit',
        video: drSabrinaEdit,
      },
      {
        title: 'Bronze To Heroic Free Fire Edit',
        video: bronzeToHeroic,
      },
      {
        title: 'Game Change Music Video',
        video: gameChangeSong,
      },
      {
        title: 'Vertical Reel Edit 01',
        video: projectEditOne,
      },
      {
        title: 'Vertical Reel Edit 02',
        video: projectEditTwo,
      },
      {
        title: 'Vertical Reel Edit 03',
        video: projectEditThree,
      },
      {
        title: 'Vertical Reel Edit 04',
        video: projectEditFour,
      },
      {
        title: 'Vertical Reel Edit 05',
        video: projectEditFive,
      },
      {
        title: 'Vertical Reel Edit 06',
        video: projectEditSix,
      },
    ],
    'Web Development': [
      'Modern Business Website',
      'Restaurant Booking Platform',
      'Premium Agency Landing Page',
    ],
    'App Development': [
      'Fitness Mobile App',
      'Food Delivery App',
      'Startup Social Platform',
    ],
    'Game Development': [
      'Multiplayer Survival Game',
      '3D Racing Experience',
      'Adventure Mobile Game',
    ],
    Marketing: [
      'Instagram Growth Campaign',
      'Brand Awareness Strategy',
      'Paid Ads Funnel System',
    ],
  }
  const services = [
    {
      title: 'Web Development',
      desc: 'Modern, responsive and high-performance websites built for businesses that want to scale globally.',
      icon: '🌐',
    },
    {
      title: 'App Development',
      desc: 'Powerful Android, iOS and cross-platform applications with clean user experience.',
      icon: '📱',
    },
    {
      title: 'Software Development',
      desc: 'Custom software solutions designed to automate and grow your business operations.',
      icon: '💻',
    },
    {
      title: 'Game Development',
      desc: 'Creative and immersive game experiences with modern visuals and gameplay systems.',
      icon: '🎮',
    },
    {
      title: 'Marketing',
      desc: 'Digital marketing strategies that help local brands become globally recognized.',
      icon: '📈',
    },
    {
      title: 'Video Editing',
      desc: 'Cinematic edits, promotional videos and social media content that captures attention.',
      icon: '🎬',
    },
  ]

  const brandProjects = [
    {
      title: 'Premium Brand Identity',
      desc: 'Visual branding and creative direction for a polished business presence.',
      image: brandImageOne,
      fit: 'object-cover',
    },
    {
      title: 'Creative Campaign Design',
      desc: 'Content visuals built for social media, marketing and brand recognition.',
      image: brandImageTwo,
      fit: 'object-cover',
    },
    {
      title: 'Real Media Branding',
      desc: 'Real Media logo system and digital brand presentation.',
      image: logo,
      fit: 'object-contain p-12',
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">

      {activeVideo && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-6xl overflow-hidden rounded-[28px] border border-red-900/50 bg-black shadow-[0_0_80px_rgba(220,38,38,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-xl font-bold text-white backdrop-blur-md transition hover:bg-red-600"
            >
              ✕
            </button>

            <video
              src={activeVideo.video}
              className="max-h-[82vh] w-full bg-black object-contain"
              controls
              autoPlay
              playsInline
            />

            <div className="border-t border-zinc-900 bg-black px-6 py-4">
              <h3 className="text-xl font-bold">{activeVideo.title}</h3>
              <p className="mt-1 text-sm text-gray-400">
                Full video preview
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="relative bg-gradient-to-br from-zinc-950 to-black border border-red-900/50 rounded-[35px] w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-[0_0_80px_rgba(220,38,38,0.2)]">

            <button
              onClick={() => {
                setSelectedService(null)
                setActiveVideo(null)
              }}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-zinc-900 hover:bg-red-600 transition text-xl font-bold"
            >
              ✕
            </button>

            <div className="p-10 md:p-16">
              <p className="text-red-500 uppercase tracking-[0.3em] text-sm mb-4">
                RealMedia Services
              </p>

              <h2 className="text-5xl md:text-6xl font-black leading-tight max-w-3xl">
                {selectedService}
              </h2>

              <p className="text-gray-400 text-lg mt-6 max-w-2xl leading-relaxed">
                Professional high-end {selectedService.toLowerCase()} services designed to help businesses scale globally with premium digital experiences.
              </p>

              <button className="mt-10 bg-red-600 hover:bg-red-700 transition px-8 py-4 rounded-full font-semibold shadow-2xl shadow-red-700/30 text-lg">
                Start Your Project
              </button>

              <div className="mt-20">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <p className="text-red-500 uppercase tracking-[0.2em] text-sm mb-2">
                      Portfolio
                    </p>

                    <h3 className="text-4xl font-black">
                      Recent Projects
                    </h3>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {portfolioData[selectedService]?.map((project, index) => {
                    const projectTitle = typeof project === 'string' ? project : project.title

                    return (
                    <div
                      key={index}
                      className="group relative h-[320px] cursor-pointer overflow-hidden rounded-[28px] border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black transition-all duration-300 hover:-translate-y-2 hover:border-red-600"
                      role={project.video ? 'button' : undefined}
                      tabIndex={project.video ? 0 : undefined}
                      onClick={() => {
                        if (project.video) {
                          setActiveVideo({
                            title: projectTitle,
                            video: project.video,
                          })
                        }
                      }}
                      onKeyDown={(event) => {
                        if (project.video && (event.key === 'Enter' || event.key === ' ')) {
                          event.preventDefault()
                          setActiveVideo({
                            title: projectTitle,
                            video: project.video,
                          })
                        }
                      }}
                    >
                      {project.video && (
                        <video
                          src={project.video}
                          className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-300 group-hover:opacity-90"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                      <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition"></div>

                      <div className="absolute top-5 left-5 bg-red-600/20 border border-red-500/30 text-red-400 text-xs px-4 py-2 rounded-full backdrop-blur-md">
                        REALMEDIA
                      </div>

                      <div className="absolute bottom-0 p-8">
                        <h3 className="text-2xl font-bold mb-3 group-hover:text-red-500 transition">
                          {projectTitle}
                        </h3>

                        <p className="text-gray-400 text-sm leading-relaxed">
                          Premium video edit with cinematic pacing, motion and brand-focused storytelling.
                        </p>
                      </div>
                    </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-red-900/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={logo}
                alt="Real Media logo"
                className="w-16 h-16 object-contain drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-[0.15em]">
                <span className="text-red-500">REAL</span> MEDIA
              </h1>
            </div>
          </div>

          <div className="hidden lg:flex gap-7 text-sm tracking-wide text-gray-300 font-medium">
            {[
              'Video Editing',
              'Web Development',
              'App Development',
              'Game Development',
              'Marketing',
            ].map((item) => (
              <button
                key={item}
                onClick={() => setSelectedService(item)}
                className="hover:text-red-500 transition relative group"
              >
                {item}
                <span className="absolute left-0 -bottom-2 w-0 h-[2px] bg-red-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </div>

          <button className="bg-red-600 hover:bg-red-700 transition px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-red-600/30 border border-red-500/20">
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.25),transparent_40%)]"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center relative z-10">
          <div>
            <p className="text-red-500 tracking-[0.3em] uppercase text-sm mb-5">
              Digital Growth Agency
            </p>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              We Build
              <span className="text-red-500"> Brands </span>
              That Go Global.
            </h1>

            <p className="text-gray-400 text-lg mt-8 leading-relaxed max-w-xl">
              RealMedia helps businesses grow with powerful websites, apps,
              marketing, video production and creative digital solutions.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <button className="bg-red-600 hover:bg-red-700 transition px-7 py-4 rounded-full font-semibold shadow-2xl shadow-red-700/30">
                Start Your Project
              </button>

              <button className="border border-gray-700 hover:border-red-500 hover:text-red-500 transition px-7 py-4 rounded-full font-semibold">
                View Services
              </button>
            </div>
          </div>

          {/* HERO CARD */}
          <div className="relative flex justify-center">
            <div className="absolute w-72 h-72 bg-red-600/30 blur-[120px] rounded-full"></div>

            <div className="relative bg-gradient-to-br from-zinc-900 to-black border border-red-900/40 rounded-[32px] p-10 shadow-[0_0_80px_rgba(220,38,38,0.18)] w-full max-w-lg backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-8">
                <img
                  src={logo}
                  alt="RealMedia Logo"
                  className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                />

                <div>
                  <h2 className="text-2xl font-bold tracking-wide">
                    REALMEDIA
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Building Brands. Growing Global.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-black/50 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-lg font-semibold mb-2 text-red-500">
                    Creative Production
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Cinematic shoots, premium editing and social media content.
                  </p>
                </div>

                <div className="bg-black/50 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-lg font-semibold mb-2 text-red-500">
                    Development Solutions
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Websites, mobile apps, software and scalable digital products.
                  </p>
                </div>

                <div className="bg-black/50 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-lg font-semibold mb-2 text-red-500">
                    Marketing & Branding
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Ads, branding strategy and online growth systems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-red-500 uppercase tracking-[0.3em] text-sm mb-4">
              Our Services
            </p>

            <h2 className="text-4xl md:text-5xl font-black">
              Everything Your Business Needs
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-black border border-zinc-800 hover:border-red-600 transition-all duration-300 rounded-3xl p-8 hover:-translate-y-2 shadow-lg hover:shadow-red-700/10"
              >
                <div className="text-5xl mb-6">{service.icon}</div>

                <h3 className="text-2xl font-bold mb-4 group-hover:text-red-500 transition">
                  {service.title}
                </h3>

                <p className="text-gray-400 leading-relaxed text-sm">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-red-500 uppercase tracking-[0.3em] text-sm mb-4">
              About RealMedia
            </p>

            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-8">
              Helping Small Businesses Become Global Brands.
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              We combine creativity, technology and marketing to help businesses
              scale online with professional branding and digital experiences.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-3xl font-black text-red-500">100+</h3>
                <p className="text-gray-400 mt-2">Creative Projects</p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-3xl font-black text-red-500">24/7</h3>
                <p className="text-gray-400 mt-2">Support & Growth</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-red-600/20 blur-[100px] rounded-full"></div>

            <div className="relative bg-gradient-to-br from-red-600 to-red-900 rounded-[40px] p-[1px]">
              <div className="bg-black rounded-[40px] p-10">
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-5">
                    <span className="text-gray-400">Website Design</span>
                    <span className="font-bold">98%</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-zinc-800 pb-5">
                    <span className="text-gray-400">Marketing</span>
                    <span className="font-bold">95%</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-zinc-800 pb-5">
                    <span className="text-gray-400">Video Production</span>
                    <span className="font-bold">99%</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Brand Growth</span>
                    <span className="font-bold">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="py-24 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-red-500 uppercase tracking-[0.3em] text-sm mb-4">
              Portfolio
            </p>

            <h2 className="text-4xl md:text-5xl font-black">
              Featured Work
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {brandProjects.map((project) => (
              <div
                key={project.title}
                className="group relative overflow-hidden rounded-[30px] border border-zinc-800 h-[380px] bg-gradient-to-br from-zinc-900 to-black"
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className={`absolute inset-0 h-full w-full ${project.fit} opacity-75 transition duration-300 group-hover:scale-105 group-hover:opacity-95`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition"></div>

                <div className="absolute bottom-0 p-8">
                  <h3 className="text-2xl font-bold mb-3">
                    {project.title}
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed">
                    {project.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-red-500 uppercase tracking-[0.3em] text-sm mb-4">
            Contact Us
          </p>

          <h2 className="text-4xl md:text-6xl font-black leading-tight mb-8">
            Let’s Build Something Powerful.
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto mb-12">
            Ready to grow your business online? RealMedia is here to turn your
            ideas into a powerful digital brand.
          </p>

          <div className="flex flex-wrap justify-center gap-5">
            <button className="bg-red-600 hover:bg-red-700 transition px-8 py-4 rounded-full font-semibold shadow-2xl shadow-red-700/30">
              Start Project
            </button>

            <button className="border border-zinc-700 hover:border-red-500 hover:text-red-500 transition px-8 py-4 rounded-full font-semibold">
              Book Meeting
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 py-10 px-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <h2 className="text-2xl font-black tracking-wide">
              REAL<span className="text-red-500">MEDIA</span>
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Building Brands. Growing Global.
            </p>
          </div>

          <div className="text-gray-500 text-sm text-center md:text-right">
            © 2026 RealMedia. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
