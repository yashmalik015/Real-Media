import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const services = [
  'Video Editing',
  'Web Development',
  'App Development',
  'Software Development',
  'Game Development',
  'Marketing',
]

const defaultStatusOptions = [
  'New brief submitted',
  'Handler assigned',
  'Brief under review',
  'Raw footage received',
  'In production',
  'First draft shared',
  'Revision in progress',
  'Final delivery ready',
]

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;700&display=swap');

  :root {
    --red: #e53935;
    --red-dark: #9f1111;
    --ink: #060606;
    --panel: rgba(14,14,16,0.86);
    --line: rgba(255,255,255,0.09);
  }

  * { box-sizing: border-box; }
  body { margin: 0; background: #000; color: #fff; font-family: 'DM Sans', system-ui, sans-serif; }
  button, input, textarea, select { font: inherit; }
  button { cursor: pointer; color: inherit; }

  .page {
    min-height: 100vh;
    background:
      radial-gradient(circle at 8% 5%, rgba(229,57,53,0.28), transparent 28rem),
      radial-gradient(circle at 92% 8%, rgba(255,255,255,0.08), transparent 22rem),
      linear-gradient(135deg, #020202 0%, #101010 52%, #050505 100%);
    overflow-x: hidden;
  }

  .grain {
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: 0.08;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.45'/%3E%3C/svg%3E");
  }

  .brand-title {
    font-family: 'Bebas Neue', sans-serif;
    letter-spacing: 0.16em;
  }

  .auth-shell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(380px, 520px);
    gap: 48px;
    align-items: center;
    max-width: 1180px;
    margin: 0 auto;
    padding: 42px 24px;
    position: relative;
    z-index: 1;
  }

  .hero-copy h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(4rem, 8vw, 7rem);
    line-height: 0.9;
    letter-spacing: 0.02em;
    margin: 22px 0;
  }

  .hero-copy p { color: rgba(255,255,255,0.68); font-size: 1.05rem; line-height: 1.8; max-width: 620px; }
  .logo-row { display: flex; align-items: center; gap: 16px; }
  .logo-row img { width: 72px; height: 72px; object-fit: contain; filter: drop-shadow(0 0 22px rgba(229,57,53,0.5)); }

  .feature-strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 34px;
  }

  .mini-card, .panel, .auth-card, .modal, .project-card, .chat-panel {
    background: linear-gradient(145deg, rgba(18,18,20,0.92), rgba(4,4,4,0.92));
    border: 1px solid var(--line);
    box-shadow: 0 30px 80px rgba(0,0,0,0.38);
  }

  .mini-card { border-radius: 20px; padding: 18px; min-height: 120px; }
  .mini-card strong { color: var(--red); display: block; margin-bottom: 8px; }
  .mini-card span { color: rgba(255,255,255,0.58); font-size: 0.86rem; line-height: 1.55; }

  .auth-card { border-radius: 30px; padding: 28px; backdrop-filter: blur(18px); }
  .auth-card h2, .modal h2, .panel h2 {
    font-family: 'Bebas Neue', sans-serif;
    letter-spacing: 0.06em;
    font-size: 2.15rem;
    margin: 0;
  }

  .tabs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 24px 0; }
  .tab, .ghost-btn, .solid-btn, .danger-btn {
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 12px 16px;
    background: rgba(255,255,255,0.04);
    transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
  }
  .tab.active, .solid-btn {
    border-color: rgba(229,57,53,0.65);
    background: linear-gradient(135deg, var(--red), var(--red-dark));
    box-shadow: 0 12px 34px rgba(229,57,53,0.25);
  }
  .ghost-btn:hover, .tab:hover, .solid-btn:hover { transform: translateY(-1px); border-color: rgba(229,57,53,0.55); }
  .danger-btn { background: rgba(229,57,53,0.1); color: #ffb5b5; border-color: rgba(229,57,53,0.25); }

  .field { display: grid; gap: 8px; margin-bottom: 16px; }
  .field label { color: rgba(255,255,255,0.56); font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase; }
  .field input, .field textarea, .field select {
    width: 100%;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    background: rgba(255,255,255,0.055);
    color: #fff;
    padding: 14px 16px;
    outline: none;
  }
  .field textarea { min-height: 120px; resize: vertical; }
  .field input:focus, .field textarea:focus, .field select:focus { border-color: rgba(229,57,53,0.68); }
  .hint { color: rgba(255,255,255,0.48); font-size: 0.84rem; line-height: 1.55; }
  .error { color: #ffb3b3; background: rgba(229,57,53,0.12); border: 1px solid rgba(229,57,53,0.24); padding: 12px 14px; border-radius: 16px; }

  .app-shell { position: relative; z-index: 1; display: grid; grid-template-columns: 280px minmax(0, 1fr); min-height: 100vh; }
  .sidebar { border-right: 1px solid var(--line); padding: 24px; background: rgba(0,0,0,0.55); backdrop-filter: blur(18px); }
  .sidebar .logo-row img { width: 56px; height: 56px; }
  .side-nav { display: grid; gap: 10px; margin-top: 34px; }
  .side-nav button { text-align: left; }
  .content { padding: 24px; display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 20px; }
  .topbar { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
  .topbar h1 { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.06em; font-size: 2.8rem; margin: 0; }
  .top-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .pill { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--line); border-radius: 999px; color: rgba(255,255,255,0.72); background: rgba(255,255,255,0.04); font-size: 0.82rem; }
  .pill.hot { color: #fff; border-color: rgba(229,57,53,0.45); background: rgba(229,57,53,0.15); }

  .dashboard-grid { display: grid; grid-template-columns: minmax(310px, 430px) minmax(0, 1fr); gap: 20px; min-height: 0; }
  .panel { border-radius: 26px; padding: 22px; min-height: 0; overflow: hidden; }
  .project-list { display: grid; gap: 12px; margin-top: 18px; max-height: calc(100vh - 230px); overflow: auto; padding-right: 4px; }
  .project-card { border-radius: 20px; padding: 16px; text-align: left; width: 100%; }
  .project-card.active { border-color: rgba(229,57,53,0.65); background: rgba(229,57,53,0.12); }
  .project-card h3 { margin: 0 0 8px; font-size: 1rem; }
  .project-card p { margin: 0; color: rgba(255,255,255,0.54); font-size: 0.84rem; line-height: 1.45; }

  .chat-panel { border-radius: 26px; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; min-height: calc(100vh - 155px); overflow: hidden; }
  .chat-header { padding: 20px; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
  .chat-header h2 { margin: 0; font-size: 1.35rem; }
  .chat-body { padding: 20px; overflow: auto; display: flex; flex-direction: column; gap: 12px; }
  .bubble { max-width: min(76%, 650px); border-radius: 18px; padding: 12px 14px; line-height: 1.55; font-size: 0.94rem; }
  .bubble.client { align-self: flex-end; background: linear-gradient(135deg, var(--red), var(--red-dark)); }
  .bubble.team, .bubble.system { align-self: flex-start; background: rgba(255,255,255,0.07); border: 1px solid var(--line); }
  .bubble small { display: block; color: rgba(255,255,255,0.52); margin-bottom: 5px; font-size: 0.72rem; }
  .composer { border-top: 1px solid var(--line); padding: 14px; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; }
  .composer input { border: 1px solid var(--line); border-radius: 999px; background: rgba(255,255,255,0.06); color: #fff; outline: none; padding: 13px 16px; }

  .modal-backdrop { position: fixed; inset: 0; z-index: 40; background: rgba(0,0,0,0.82); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; padding: 20px; }
  .modal { width: min(940px, 100%); max-height: 92vh; overflow: auto; border-radius: 30px; padding: 26px; }
  .form-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px; }
  .question-box { border: 1px solid var(--line); border-radius: 18px; padding: 14px; background: rgba(255,255,255,0.035); margin-bottom: 12px; }
  .file-list { display: grid; gap: 8px; margin-top: 12px; }
  .file-row, .note-row { border: 1px solid var(--line); border-radius: 14px; padding: 11px 12px; color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.035); font-size: 0.84rem; }
  .empty { display: grid; place-items: center; min-height: 360px; text-align: center; color: rgba(255,255,255,0.52); }
  .preview-strip { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 22px; }
  .preview-strip img { width: 100%; height: 180px; object-fit: cover; border-radius: 20px; border: 1px solid var(--line); opacity: 0.82; }

  .portfolio-page { display: grid; gap: 24px; }
  .portfolio-hero {
    min-height: 460px;
    border-radius: 32px;
    overflow: hidden;
    border: 1px solid var(--line);
    background:
      linear-gradient(90deg, rgba(0,0,0,0.88), rgba(0,0,0,0.38)),
      url("${brandImageOne}") center/cover;
    display: flex;
    align-items: end;
    padding: clamp(24px, 5vw, 56px);
    box-shadow: 0 30px 90px rgba(0,0,0,0.45);
  }
  .portfolio-hero h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3.8rem, 8vw, 7.2rem);
    line-height: 0.88;
    letter-spacing: 0.02em;
    margin: 0;
    max-width: 780px;
  }
  .portfolio-hero p { max-width: 610px; color: rgba(255,255,255,0.7); line-height: 1.75; }
  .portfolio-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
  .portfolio-card {
    min-height: 390px;
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid var(--line);
    background: rgba(255,255,255,0.035);
    position: relative;
    display: grid;
    align-items: end;
    box-shadow: 0 28px 70px rgba(0,0,0,0.28);
  }
  .portfolio-card img, .portfolio-card video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.78;
  }
  .portfolio-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.32), transparent);
  }
  .portfolio-card-content { position: relative; z-index: 1; padding: 22px; }
  .portfolio-card h3 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.8rem;
    letter-spacing: 0.04em;
    margin: 8px 0;
  }
  .portfolio-card p { color: rgba(255,255,255,0.66); line-height: 1.55; font-size: 0.92rem; }
  .portfolio-end {
    border: 1px solid rgba(229,57,53,0.28);
    border-radius: 26px;
    padding: 28px;
    background: linear-gradient(135deg, rgba(229,57,53,0.14), rgba(255,255,255,0.04));
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .landing-page {
    position: relative;
    min-height: 100vh;
    background: #000;
    color: #fff;
    overflow-x: hidden;
    font-family: 'DM Sans', sans-serif;
  }
  .landing-nav {
    position: sticky;
    top: 0;
    z-index: 30;
    border-bottom: 1px solid rgba(229,57,53,0.22);
    background: rgba(0,0,0,0.86);
    backdrop-filter: blur(14px);
  }
  .landing-nav-inner {
    max-width: 1440px;
    margin: 0 auto;
    padding: 18px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
  .landing-logo { display: flex; align-items: center; gap: 18px; }
  .landing-logo img { width: 70px; height: 70px; object-fit: contain; filter: drop-shadow(0 0 20px rgba(229,57,53,0.5)); }
  .landing-logo h1 {
    margin: 0;
    font-family: 'Bebas Neue', sans-serif;
    letter-spacing: 0.32em;
    font-size: 1.7rem;
  }
  .landing-links { display: flex; align-items: center; gap: clamp(18px, 3vw, 44px); color: rgba(255,255,255,0.72); }
  .landing-links button {
    border: 0;
    background: transparent;
    color: inherit;
    transition: color 0.2s ease;
  }
  .landing-links button:hover { color: var(--red); }
  .landing-hero {
    position: relative;
    min-height: 780px;
    display: grid;
    align-items: center;
    border-bottom: 1px solid rgba(229,57,53,0.24);
    background:
      radial-gradient(circle at 8% 12%, rgba(229,57,53,0.24), transparent 32rem),
      radial-gradient(circle at 88% 42%, rgba(229,57,53,0.15), transparent 34rem),
      #020202;
    overflow: hidden;
  }
  .landing-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(229,57,53,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(229,57,53,0.04) 1px, transparent 1px);
    background-size: 90px 90px;
    opacity: 0.32;
  }
  .landing-hero-inner {
    position: relative;
    z-index: 1;
    width: min(1440px, 100%);
    margin: 0 auto;
    padding: 80px 48px;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.95fr);
    gap: 70px;
    align-items: center;
  }
  .landing-label {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    color: var(--red);
    font-family: 'Bebas Neue', sans-serif;
    letter-spacing: 0.36em;
    font-size: 0.9rem;
  }
  .landing-label::before { content: ''; width: 44px; height: 2px; background: var(--red); }
  .landing-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(5.2rem, 9vw, 9rem);
    line-height: 0.9;
    letter-spacing: 0.02em;
    margin: 28px 0 34px;
  }
  .landing-title .red-word {
    position: relative;
    display: inline-block;
    color: var(--red);
    animation: brandGlitchFloat 2.8s ease-in-out infinite;
  }
  .landing-title .red-word::before,
  .landing-title .red-word::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    color: var(--red);
    clip-path: inset(42% 0 38% 0);
  }
  .landing-title .red-word::before { animation: brandGlitchSliceOne 1.15s steps(2,end) infinite; text-shadow: -10px 0 #12f7ff; }
  .landing-title .red-word::after { animation: brandGlitchSliceTwo 1.35s steps(2,end) infinite; text-shadow: 10px 0 #ff3ad7; }
  @keyframes brandGlitchFloat {
    0%, 100% { transform: translateY(0); filter: drop-shadow(0 0 0 rgba(229,57,53,0)); }
    25% { transform: translateY(-6px); }
    50% { transform: translateY(5px); filter: drop-shadow(0 0 18px rgba(229,57,53,0.22)); }
    75% { transform: translateY(-3px); }
  }
  @keyframes brandGlitchSliceOne {
    0%, 100% { transform: translate(-7px, -5px); clip-path: inset(16% 0 58% 0); }
    20% { transform: translate(8px, 5px); clip-path: inset(44% 0 34% 0); }
    42% { transform: translate(-12px, 8px); clip-path: inset(66% 0 12% 0); }
    64% { transform: translate(6px, -8px); clip-path: inset(26% 0 48% 0); }
    82% { transform: translate(-4px, 3px); clip-path: inset(52% 0 25% 0); }
  }
  @keyframes brandGlitchSliceTwo {
    0%, 100% { transform: translate(7px, 6px); clip-path: inset(52% 0 24% 0); }
    24% { transform: translate(-8px, -4px); clip-path: inset(18% 0 62% 0); }
    46% { transform: translate(11px, -7px); clip-path: inset(72% 0 8% 0); }
    68% { transform: translate(-6px, 8px); clip-path: inset(34% 0 42% 0); }
    86% { transform: translate(5px, -2px); clip-path: inset(44% 0 34% 0); }
  }
  .landing-copy {
    color: rgba(255,255,255,0.62);
    font-size: 1.08rem;
    line-height: 1.8;
    max-width: 680px;
  }
  .landing-actions { display: flex; flex-wrap: wrap; gap: 28px; margin-top: 46px; align-items: center; }
  .landing-primary {
    border: 0;
    border-radius: 999px;
    padding: 18px 34px;
    background: #e42525;
    box-shadow: 0 0 45px rgba(229,57,53,0.34);
    font-weight: 700;
  }
  .landing-secondary { border: 0; background: transparent; color: rgba(255,255,255,0.82); }
  .landing-hero-card {
    border: 1px solid rgba(229,57,53,0.26);
    border-radius: 34px;
    padding: 38px;
    background: linear-gradient(145deg, rgba(16,17,20,0.9), rgba(0,0,0,0.96));
    box-shadow: 0 0 90px rgba(229,57,53,0.18);
    transition: transform 0.35s cubic-bezier(.23,1,.32,1), border-color 0.35s ease, box-shadow 0.35s ease;
    transform-style: preserve-3d;
  }
  .landing-hero-card:hover {
    transform: translateY(-10px) scale(1.015);
    border-color: rgba(229,57,53,0.58);
    box-shadow: 0 0 110px rgba(229,57,53,0.28), 0 42px 90px rgba(0,0,0,0.58);
  }
  .landing-hero-card-head { display: flex; align-items: center; gap: 20px; margin-bottom: 34px; }
  .landing-hero-card-head img { width: 86px; height: 86px; object-fit: contain; }
  .landing-hero-card h2 {
    margin: 0;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2rem;
    letter-spacing: 0.16em;
  }
  .landing-feature-card {
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 28px;
    margin-top: 20px;
    background: rgba(0,0,0,0.42);
    transition: transform 0.28s ease, border-color 0.28s ease, background 0.28s ease, box-shadow 0.28s ease;
  }
  .landing-feature-card:hover {
    transform: translateX(10px) translateY(-3px);
    border-color: rgba(229,57,53,0.52);
    background: rgba(229,57,53,0.08);
    box-shadow: inset 0 0 28px rgba(229,57,53,0.05), 0 16px 34px rgba(0,0,0,0.28);
  }
  .landing-feature-card h3 {
    margin: 0 0 14px;
    color: var(--red);
    font-family: 'Bebas Neue', sans-serif;
    letter-spacing: 0.14em;
    font-size: 1.25rem;
  }
  .landing-feature-card p { margin: 0; color: rgba(255,255,255,0.58); line-height: 1.7; }
  .landing-marquee {
    background: #df463d;
    padding: 18px 0;
    overflow: hidden;
    color: #fff;
  }
  .landing-marquee-track {
    display: flex;
    gap: 70px;
    width: max-content;
    animation: landingMarquee 24s linear infinite;
    font-family: 'Bebas Neue', sans-serif;
    letter-spacing: 0.34em;
    font-size: 1.25rem;
    white-space: nowrap;
  }
  @keyframes landingMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .landing-section {
    padding: 92px 48px;
    background: #050505;
  }
  .landing-section-inner { width: min(1440px, 100%); margin: 0 auto; }
  .landing-section-title {
    text-align: center;
    margin-bottom: 54px;
  }
  .landing-section-title h2 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3rem, 5vw, 4.8rem);
    letter-spacing: 0.04em;
    margin: 12px 0 0;
  }
  .landing-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
  .landing-service-card, .landing-port-card, .landing-team-add {
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 26px;
    background: linear-gradient(145deg, rgba(18,18,20,0.92), rgba(0,0,0,0.94));
    overflow: hidden;
    box-shadow: 0 24px 70px rgba(0,0,0,0.32);
  }
  .landing-service-card {
    padding: 30px;
    min-height: 240px;
  }
  .landing-service-card:hover, .landing-port-card:hover { border-color: rgba(229,57,53,0.62); transform: translateY(-6px); transition: all 0.25s ease; }
  .landing-service-card .icon { font-size: 2.5rem; margin-bottom: 18px; }
  .landing-service-card h3, .landing-port-card h3 {
    font-family: 'Bebas Neue', sans-serif;
    letter-spacing: 0.06em;
    font-size: 1.75rem;
    margin: 0 0 12px;
  }
  .landing-service-card p, .landing-port-card p { color: rgba(255,255,255,0.58); line-height: 1.65; }
  .landing-port-card { min-height: 380px; position: relative; display: grid; align-items: end; }
  .landing-port-card img, .landing-port-card video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.72;
  }
  .landing-port-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.3), transparent);
  }
  .landing-port-card-content { position: relative; z-index: 1; padding: 26px; }
  .portfolio-card-actions {
    position: absolute;
    z-index: 4;
    top: 14px;
    right: 14px;
    display: flex;
    gap: 8px;
  }
  .portfolio-mini-btn {
    border: 1px solid rgba(255,255,255,0.16);
    border-radius: 999px;
    background: rgba(0,0,0,0.7);
    color: #fff;
    padding: 8px 11px;
    font-size: 0.76rem;
    backdrop-filter: blur(10px);
  }
  .portfolio-mini-btn.delete {
    border-color: rgba(229,57,53,0.5);
    color: #ffd1d1;
    background: rgba(229,57,53,0.24);
  }
  .landing-team-add {
    margin-top: 28px;
    padding: 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    border-color: rgba(229,57,53,0.28);
  }
  .landing-workspace-bar {
    position: fixed;
    left: 24px;
    bottom: 24px;
    z-index: 40;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .landing-chip {
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(0,0,0,0.72);
    color: rgba(255,255,255,0.8);
    border-radius: 999px;
    padding: 10px 14px;
    backdrop-filter: blur(12px);
  }

  @media (max-width: 980px) {
    .auth-shell, .app-shell, .dashboard-grid, .form-grid { grid-template-columns: 1fr; }
    .sidebar { border-right: 0; border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 5; }
    .app-shell { display: block; }
    .feature-strip { grid-template-columns: 1fr; }
    .portfolio-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .landing-hero-inner { grid-template-columns: 1fr; gap: 42px; padding: 64px 24px; }
    .landing-links { display: none; }
    .landing-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .dashboard-grid { min-height: auto; }
    .chat-panel { min-height: 650px; }
  }

  @media (max-width: 680px) {
    .auth-shell { padding: 22px 14px; gap: 24px; }
    .hero-copy h1 { font-size: clamp(3rem, 18vw, 4.8rem); }
    .auth-card, .modal, .panel { border-radius: 22px; padding: 18px; }
    .content { padding: 14px; }
    .sidebar { padding: 16px; }
    .side-nav { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 18px; }
    .side-nav .danger-btn { grid-column: span 2; }
    .topbar, .chat-header, .portfolio-end { align-items: stretch; flex-direction: column; }
    .topbar h1 { font-size: 2.2rem; }
    .top-actions { width: 100%; }
    .top-actions > * { flex: 1; justify-content: center; }
    .portfolio-hero { min-height: 420px; border-radius: 24px; padding: 22px; }
    .portfolio-grid { grid-template-columns: 1fr; }
    .landing-nav-inner { padding: 12px 16px; }
    .landing-logo h1 { font-size: 1.1rem; letter-spacing: 0.2em; }
    .landing-logo img { width: 54px; height: 54px; }
    .landing-hero { min-height: auto; }
    .landing-hero-inner { padding: 46px 18px; }
    .landing-title { font-size: clamp(4.2rem, 22vw, 6rem); }
    .landing-copy { font-size: 0.98rem; }
    .landing-hero-card { padding: 22px; border-radius: 24px; }
    .landing-grid { grid-template-columns: 1fr; }
    .landing-section { padding: 64px 18px; }
    .landing-team-add { align-items: stretch; flex-direction: column; }
    .landing-workspace-bar { left: 12px; right: 12px; bottom: 12px; }
    .landing-workspace-bar .landing-chip { flex: 1; }
    .portfolio-card { min-height: 340px; }
    .composer { grid-template-columns: 1fr; }
    .bubble { max-width: 92%; }
    .project-list { max-height: none; }
    .preview-strip { grid-template-columns: 1fr; }
  }
`

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

async function apiRequest(path, { token, ...options } = {}) {
  const headers = options.body instanceof FormData
    ? { ...(token ? authHeaders(token) : {}) }
    : { 'Content-Type': 'application/json', ...(token ? authHeaders(token) : {}) }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers, ...options.headers } })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Something went wrong.')
  return data
}

function AuthScreen({ onLogin }) {
  const [role, setRole] = useState('client')
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', teamId: '', teamName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = role === 'team'
        ? await apiRequest('/api/auth/team', {
            method: 'POST',
            body: JSON.stringify({ teamId: form.teamId, name: form.teamName || 'Real Media Team' }),
          })
        : await apiRequest('/api/auth/client', {
            method: 'POST',
            body: JSON.stringify({ mode, name: form.name, email: form.email, password: form.password }),
          })
      localStorage.setItem('real-media-session', JSON.stringify(payload))
      onLogin(payload)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="hero-copy">
        <div className="logo-row">
          <img src={logo} alt="Real Media logo" />
          <div>
            <div className="brand-title" style={{ fontSize: 28 }}>REAL MEDIA</div>
            <span className="hint">Client and team project portal</span>
          </div>
        </div>
        <h1>Login First.<br /><span style={{ color: 'var(--red)' }}>Build Better.</span></h1>
        <p>
          Clients can start a project, submit a detailed creative brief, answer smart project questions,
          upload raw footage, receive notifications, and chat with the assigned Real Media handler.
        </p>
        <div className="feature-strip">
          <div className="mini-card"><strong>Brief Builder</strong><span>Structured questions change by service so the team gets useful context.</span></div>
          <div className="mini-card"><strong>Raw Uploads</strong><span>Upload footage, photos, references, documents, and assets with the project.</span></div>
          <div className="mini-card"><strong>Project Chat</strong><span>Client and team talk in one WhatsApp-style project thread.</span></div>
        </div>
        <div className="preview-strip">
          <img src={brandImageOne} alt="Real Media brand preview" />
          <img src={brandImageTwo} alt="Real Media campaign preview" />
        </div>
      </section>

      <form className="auth-card" onSubmit={submit}>
        <h2>{role === 'team' ? 'Team Access' : mode === 'register' ? 'Create Client Account' : 'Client Login'}</h2>
        <p className="hint">Entry is gated. Choose client login or team login before entering the workspace.</p>

        <div className="tabs">
          <button type="button" className={`tab ${role === 'client' ? 'active' : ''}`} onClick={() => setRole('client')}>Client</button>
          <button type="button" className={`tab ${role === 'team' ? 'active' : ''}`} onClick={() => setRole('team')}>Team</button>
        </div>

        {role === 'client' ? (
          <>
            <div className="tabs" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: 0 }}>
              <button type="button" className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Login</button>
              <button type="button" className={`tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Register</button>
            </div>
            {mode === 'register' && (
              <div className="field">
                <label>Name</label>
                <input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Your full name" />
              </div>
            )}
            <div className="field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="Enter password" />
            </div>
          </>
        ) : (
          <>
            <div className="field">
              <label>Team Name</label>
              <input value={form.teamName} onChange={(event) => update('teamName', event.target.value)} placeholder="Project handler name" />
            </div>
            <div className="field">
              <label>10 Digit Team ID</label>
              <input inputMode="numeric" maxLength={10} value={form.teamId} onChange={(event) => update('teamId', event.target.value.replace(/\D/g, ''))} placeholder="1234567890" />
            </div>
            <p className="hint">Default local team ID is <strong>1234567890</strong>. Change it with <code>TEAM_ACCESS_ID</code> for production.</p>
          </>
        )}

        {error && <p className="error">{error}</p>}
        <button className="solid-btn" type="submit" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
          {loading ? 'Please wait...' : role === 'team' ? 'Enter Team Workspace' : mode === 'register' ? 'Create Account' : 'Login'}
        </button>
      </form>
    </main>
  )
}

function ProjectModal({ token, onClose, onCreated }) {
  const [service, setService] = useState(services[0])
  const [questions, setQuestions] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [answers, setAnswers] = useState({})
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    apiRequest(`/api/questions/${encodeURIComponent(service)}`, { token })
      .then((data) => setQuestions(data.questions))
      .catch((err) => setError(err.message))
  }, [service, token])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('service', service)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('answers', JSON.stringify(answers))
      Array.from(files).forEach((file) => formData.append('files', file))
      const data = await apiRequest('/api/projects', { method: 'POST', body: formData, token })
      onCreated(data.project)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div className="topbar" style={{ marginBottom: 20 }}>
          <div>
            <h2>Start Project</h2>
            <p className="hint">Describe the project, answer the smart brief questions, and upload raw footage or references.</p>
          </div>
          <button type="button" className="ghost-btn" onClick={onClose}>Close</button>
        </div>

        <div className="form-grid">
          <div>
            <div className="field">
              <label>Service</label>
              <select value={service} onChange={(event) => setService(event.target.value)}>
                {services.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Project Title</label>
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Example: Launch reel for new cafe" />
            </div>
            <div className="field">
              <label>Project Description</label>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Write your main brief, goals, style, and what success looks like." />
            </div>
            <div className="field">
              <label>Upload Raw Footage / Assets</label>
              <input type="file" multiple onChange={(event) => setFiles(event.target.files)} />
              <span className="hint">Videos, photos, PDFs, references, logos, scripts, and brand files are accepted.</span>
            </div>
          </div>

          <div>
            <label className="hint" style={{ display: 'block', marginBottom: 12 }}>Frequent questions for {service}</label>
            {questions.map((question) => (
              <div className="question-box" key={question}>
                <div className="field" style={{ margin: 0 }}>
                  <label>{question}</label>
                  <textarea
                    value={answers[question] || ''}
                    onChange={(event) => setAnswers((current) => ({ ...current, [question]: event.target.value }))}
                    placeholder="Answer here"
                    style={{ minHeight: 76 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        <button className="solid-btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: 18 }}>
          {loading ? 'Submitting Project...' : 'Submit Brief and Upload Files'}
        </button>
      </form>
    </div>
  )
}

function PortfolioModal({ token, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    service: 'Video Editing',
    description: '',
    client: '',
    outcome: '',
  })
  const [media, setMedia] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => formData.append(key, value))
      if (media) formData.append('media', media)
      const data = await apiRequest('/api/portfolio', { method: 'POST', token, body: formData })
      onCreated(data.portfolioItem)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div className="topbar" style={{ marginBottom: 20 }}>
          <div>
            <h2>Add Portfolio</h2>
            <p className="hint">Team-only: add a project and the website will automatically create a new portfolio card.</p>
          </div>
          <button type="button" className="ghost-btn" onClick={onClose}>Close</button>
        </div>

        <div className="form-grid">
          <div>
            <div className="field">
              <label>Project Name</label>
              <input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Example: Cafe launch reel" />
            </div>
            <div className="field">
              <label>Service</label>
              <select value={form.service} onChange={(event) => update('service', event.target.value)}>
                {services.map((item) => <option key={item}>{item}</option>)}
                <option>Branding</option>
                <option>Creative Direction</option>
              </select>
            </div>
            <div className="field">
              <label>Client / Brand</label>
              <input value={form.client} onChange={(event) => update('client', event.target.value)} placeholder="Client name or brand category" />
            </div>
          </div>

          <div>
            <div className="field">
              <label>Description</label>
              <textarea value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="What was built, edited, designed, or launched?" />
            </div>
            <div className="field">
              <label>Outcome / Detail</label>
              <textarea value={form.outcome} onChange={(event) => update('outcome', event.target.value)} placeholder="Result, style, deliverables, or project highlights." style={{ minHeight: 86 }} />
            </div>
            <div className="field">
              <label>Portfolio Media</label>
              <input type="file" accept="image/*,video/*" onChange={(event) => setMedia(event.target.files?.[0] || null)} />
              <span className="hint">Upload an image or video thumbnail/preview for this card.</span>
            </div>
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        <button className="solid-btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: 18 }}>
          {loading ? 'Adding Portfolio...' : 'Add Portfolio Card'}
        </button>
      </form>
    </div>
  )
}

function PortfolioPage({ user, portfolio, onStartProject, onOpenWorkspace, onAddPortfolio, onDeletePortfolio }) {
  const [selectedService, setSelectedService] = useState(null)
  const [activeVideo, setActiveVideo] = useState(null)

  const landingServices = [
    { title: 'Web Development', desc: 'Modern, responsive and high-performance websites built for businesses that want to scale globally.', icon: '🌐' },
    { title: 'App Development', desc: 'Powerful Android, iOS and cross-platform applications with clean user experience.', icon: '📱' },
    { title: 'Software Development', desc: 'Custom software solutions designed to automate and grow your business operations.', icon: '💻' },
    { title: 'Game Development', desc: 'Creative and immersive game experiences with modern visuals and gameplay systems.', icon: '🎮' },
    { title: 'Marketing', desc: 'Digital marketing strategies that help local brands become globally recognized.', icon: '📈' },
    { title: 'Video Editing', desc: 'Cinematic edits, promotional videos and social media content that captures attention.', icon: '🎬' },
  ]

  const videoPortfolio = [
    { title: 'Mine Official Trailer', service: 'Video Editing', description: 'Premium cinematic trailer edit with pacing, sound, and motion.', mediaType: 'video', media: mineTrailer },
    { title: 'Mine Episode 1 Trailer', service: 'Video Editing', description: 'Story-first trailer for a serialized episode launch.', mediaType: 'video', media: mineEpisodeTrailer },
    { title: 'Cybersecurity Project Edit', service: 'Video Editing', description: 'Educational technology edit with clean structure and visual rhythm.', mediaType: 'video', media: cybersecurityProject },
    { title: 'Batch 2.0 Promo Edit', service: 'Video Editing', description: 'High-energy promo content built for attention and conversion.', mediaType: 'video', media: batchPromo },
    { title: 'Roblox Squid Game Edit', service: 'Video Editing', description: 'Gaming content edit with fast pacing and retention-focused cuts.', mediaType: 'video', media: robloxSquidGame },
    { title: 'Dr Sabrina Client Edit', service: 'Video Editing', description: 'Client-focused edit with clear message and polished delivery.', mediaType: 'video', media: drSabrinaEdit },
    { title: 'Bronze To Heroic Free Fire Edit', service: 'Video Editing', description: 'Gaming journey edit built for audience engagement.', mediaType: 'video', media: bronzeToHeroic },
    { title: 'Game Change Music Video', service: 'Video Editing', description: 'Music video edit with cinematic movement and visual impact.', mediaType: 'video', media: gameChangeSong },
    { title: 'Vertical Reel Edit 01', service: 'Video Editing', description: 'Short-form reel optimized for social media viewing.', mediaType: 'video', media: projectEditOne },
    { title: 'Vertical Reel Edit 02', service: 'Video Editing', description: 'Vertical content with bold cuts and clean delivery.', mediaType: 'video', media: projectEditTwo },
    { title: 'Vertical Reel Edit 03', service: 'Video Editing', description: 'Fast vertical edit for mobile-first platforms.', mediaType: 'video', media: projectEditThree },
    { title: 'Vertical Reel Edit 04', service: 'Video Editing', description: 'Premium mobile content with branded presentation.', mediaType: 'video', media: projectEditFour },
    { title: 'Vertical Reel Edit 05', service: 'Video Editing', description: 'Social reel crafted for impact and repeat viewing.', mediaType: 'video', media: projectEditFive },
    { title: 'Vertical Reel Edit 06', service: 'Video Editing', description: 'Short-form video edit with strong visual rhythm.', mediaType: 'video', media: projectEditSix },
  ]

  const brandProjects = [
    { title: 'Premium Brand Identity', service: 'Branding', description: 'Visual branding and creative direction for a polished business presence.', mediaType: 'image', media: brandImageOne },
    { title: 'Creative Campaign Design', service: 'Marketing', description: 'Content visuals built for social media, marketing and brand recognition.', mediaType: 'image', media: brandImageTwo },
    { title: 'Real Media Branding', service: 'Creative Direction', description: 'Real Media logo system and digital brand presentation.', mediaType: 'image', media: logo },
  ]

  const backendPortfolio = portfolio
    .filter((item) => !item.id?.startsWith('portfolio_brand') && !item.id?.startsWith('portfolio_campaign') && !item.id?.startsWith('portfolio_real_media'))
    .map((item) => ({
      ...item,
      media: item.mediaUrl ? `${API_URL}${item.mediaUrl}` : brandImageOne,
      canDelete: true,
    }))

  const combinedPortfolio = [...backendPortfolio, ...brandProjects, ...videoPortfolio]
  const marqueeItems = ['WEB DEVELOPMENT', 'APP DEVELOPMENT', 'GAME DEVELOPMENT', 'MARKETING', 'BRANDING', 'CONTENT CREATION', 'VIDEO EDITING']

  return (
    <section className="landing-page">
      {activeVideo && (
        <div className="modal-backdrop" onClick={() => setActiveVideo(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="topbar" style={{ marginBottom: 16 }}>
              <h2>{activeVideo.title}</h2>
              <button className="ghost-btn" onClick={() => setActiveVideo(null)}>Close</button>
            </div>
            <video src={activeVideo.media} controls autoPlay playsInline style={{ width: '100%', maxHeight: '72vh', objectFit: 'contain', background: '#000', borderRadius: 18 }} />
          </div>
        </div>
      )}

      {selectedService && (
        <div className="modal-backdrop" onClick={() => setSelectedService(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="topbar" style={{ marginBottom: 18 }}>
              <div>
                <span className="landing-label">REALMEDIA SERVICES</span>
                <h2>{selectedService}</h2>
              </div>
              <button className="ghost-btn" onClick={() => setSelectedService(null)}>Close</button>
            </div>
            <p className="hint">Professional high-end {selectedService.toLowerCase()} services designed to help businesses scale globally with premium digital experiences.</p>
            <div className="top-actions" style={{ margin: '20px 0 30px' }}>
              {user.role === 'client' && <button className="solid-btn" onClick={onStartProject}>Start Your Project</button>}
              {user.role === 'team' && <button className="solid-btn" onClick={onAddPortfolio}>Add Portfolio</button>}
            </div>
            <div className="landing-grid">
              {combinedPortfolio.filter((item) => item.service === selectedService || selectedService !== 'Video Editing' && item.service !== 'Video Editing').slice(0, 6).map((item) => (
                <article className="landing-port-card" key={`${selectedService}-${item.title}`}>
                  {item.mediaType === 'video' ? <video src={item.media} muted loop playsInline autoPlay /> : <img src={item.media} alt={item.title} />}
                  {user.role === 'team' && item.canDelete && (
                    <div className="portfolio-card-actions">
                      <button
                        className="portfolio-mini-btn delete"
                        onClick={(event) => {
                          event.stopPropagation()
                          onDeletePortfolio(item.id)
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  <div className="landing-port-card-content">
                    <span className="pill hot">{item.service}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <img src={logo} alt="Real Media logo" />
            <h1><span style={{ color: 'var(--red)' }}>REAL</span> MEDIA</h1>
          </div>
          <div className="landing-links">
            {['Video Editing', 'Web Development', 'App Development', 'Game Development', 'Marketing'].map((item) => (
              <button key={item} onClick={() => setSelectedService(item)}>{item}</button>
            ))}
            {user.role === 'team' && <button onClick={onAddPortfolio}>Add Portfolio</button>}
          </div>
          <button className="landing-primary" onClick={user.role === 'client' ? onStartProject : onOpenWorkspace}>
            {user.role === 'client' ? 'Get Started' : 'Workspace'}
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div>
            <span className="landing-label">DIGITAL GROWTH AGENCY</span>
            <h1 className="landing-title">
              WE BUILD<br />
              <span className="red-word" data-text="BRANDS">BRANDS</span><br />
              THAT GO GLOBAL.
            </h1>
            <p className="landing-copy">
              RealMedia helps businesses grow with powerful websites, apps, marketing,
              video production and creative digital solutions.
            </p>
            <div className="landing-actions">
              {user.role === 'client' && <button className="landing-primary" onClick={onStartProject}>Start Your Project</button>}
              <button className="landing-secondary" onClick={() => document.getElementById('landing-services')?.scrollIntoView({ behavior: 'smooth' })}>View Services</button>
            </div>
          </div>

          <div className="landing-hero-card">
            <div className="landing-hero-card-head">
              <img src={logo} alt="Real Media" />
              <div>
                <h2>REALMEDIA</h2>
                <p className="hint">Building Brands. Growing Global.</p>
              </div>
            </div>
            {[
              ['Creative Production', 'Cinematic shoots, premium editing and social media content.'],
              ['Development Solutions', 'Websites, mobile apps, software and scalable digital products.'],
              ['Marketing & Branding', 'Ads, branding strategy and online growth systems.'],
            ].map(([title, desc]) => (
              <div className="landing-feature-card" key={title}>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="landing-marquee">
        <div className="landing-marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, index) => <span key={`${item}-${index}`}>{item} ·</span>)}
        </div>
      </div>

      <section className="landing-section" id="landing-services">
        <div className="landing-section-inner">
          <div className="landing-section-title">
            <span className="landing-label">OUR SERVICES</span>
            <h2>Everything Your Business Needs</h2>
          </div>
          <div className="landing-grid">
            {landingServices.map((service) => (
              <button className="landing-service-card" key={service.title} onClick={() => setSelectedService(service.title)}>
                <div className="icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section" id="landing-portfolio" style={{ background: '#080808' }}>
        <div className="landing-section-inner">
          <div className="landing-section-title">
            <span className="landing-label">PORTFOLIO</span>
            <h2>Featured Work</h2>
          </div>
          <div className="landing-grid">
            {combinedPortfolio.map((item) => (
              <article
                className="landing-port-card"
                key={`${item.id || item.title}-${item.title}`}
                role={item.mediaType === 'video' ? 'button' : undefined}
                tabIndex={item.mediaType === 'video' ? 0 : undefined}
                onClick={() => item.mediaType === 'video' && setActiveVideo(item)}
                onKeyDown={(event) => {
                  if (item.mediaType === 'video' && (event.key === 'Enter' || event.key === ' ')) setActiveVideo(item)
                }}
              >
                {item.mediaType === 'video' ? <video src={item.media} muted loop playsInline autoPlay /> : <img src={item.media} alt={item.title} />}
                {user.role === 'team' && item.canDelete && (
                  <div className="portfolio-card-actions">
                    <button
                      className="portfolio-mini-btn delete"
                      onClick={(event) => {
                        event.stopPropagation()
                        onDeletePortfolio(item.id)
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
                <div className="landing-port-card-content">
                  <span className="pill hot">{item.service}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="landing-team-add">
            <div>
              <h2 className="brand-title" style={{ fontSize: 34, margin: 0 }}>
                {user.role === 'team' ? 'Add More Portfolio' : 'Ready To Build Yours?'}
              </h2>
              <p className="hint" style={{ margin: '8px 0 0' }}>
                {user.role === 'team'
                  ? 'Team members can add new portfolio work here. The website creates a new card automatically.'
                  : 'Click start project and enter your dedicated client workspace.'}
              </p>
            </div>
            {user.role === 'team' ? (
              <button className="landing-primary" onClick={onAddPortfolio}>Add Portfolio</button>
            ) : (
              <button className="landing-primary" onClick={onStartProject}>Start Your Project</button>
            )}
          </div>
        </div>
      </section>

      <div className="landing-workspace-bar">
        <button className="landing-chip" onClick={onOpenWorkspace}>Workspace</button>
        <button className="landing-chip" onClick={() => document.getElementById('landing-portfolio')?.scrollIntoView({ behavior: 'smooth' })}>Portfolio</button>
      </div>
    </section>
  )
}

function NotificationsPanel({ notifications, onRead }) {
  return (
    <section className="panel">
      <div className="topbar">
        <h2>Notifications</h2>
        <button className="ghost-btn" onClick={onRead}>Mark Read</button>
      </div>
      <div className="project-list">
        {notifications.length === 0 ? (
          <div className="empty">No notifications yet.</div>
        ) : notifications.map((note) => (
          <div className="note-row" key={note.id} style={{ borderColor: note.read ? undefined : 'rgba(229,57,53,0.45)' }}>
            <strong>{note.title}</strong>
            <p style={{ margin: '6px 0', color: 'rgba(255,255,255,0.62)' }}>{note.message}</p>
            <span className="hint">{new Date(note.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProjectChat({ user, token, project, onProjectUpdate }) {
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [statusDraft, setStatusDraft] = useState({ projectId: '', value: '' })
  const bottomRef = useRef(null)
  const statusValue = statusDraft.projectId === project?.id ? statusDraft.value : project?.status || ''

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [project?.messages])

  if (!project) {
    return (
      <section className="chat-panel empty">
        <div>
          <h2 className="brand-title" style={{ fontSize: 32 }}>Select a project</h2>
          <p>Project chat, files, status, and notifications will appear here.</p>
        </div>
      </section>
    )
  }

  const send = async () => {
    if (!message.trim()) return
    const data = await apiRequest(`/api/projects/${project.id}/messages`, {
      method: 'POST',
      token,
      body: JSON.stringify({ text: message }),
    })
    setMessage('')
    onProjectUpdate(data.project)
  }

  const changeStatus = async () => {
    const data = await apiRequest(`/api/projects/${project.id}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status: statusValue }),
    })
    onProjectUpdate(data.project)
  }

  const uploadFiles = async (event) => {
    const selected = Array.from(event.target.files || [])
    if (selected.length === 0) return
    setUploading(true)
    const formData = new FormData()
    selected.forEach((file) => formData.append('files', file))
    const data = await apiRequest(`/api/projects/${project.id}/files`, { method: 'POST', token, body: formData })
    onProjectUpdate(data.project)
    setUploading(false)
    event.target.value = ''
  }

  return (
    <section className="chat-panel">
      <div className="chat-header">
        <div>
          <h2>{project.title}</h2>
          <p className="hint">{project.service} · {project.clientName} · {project.status}</p>
        </div>
        <div className="top-actions">
          {user.role === 'team' && (
            <>
              <select
                value={statusValue}
                onChange={(event) => setStatusDraft({ projectId: project.id, value: event.target.value })}
                className="ghost-btn"
              >
                {defaultStatusOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
              <button className="solid-btn" onClick={changeStatus}>Update</button>
            </>
          )}
          <label className="ghost-btn">
            {uploading ? 'Uploading...' : 'Upload'}
            <input type="file" multiple onChange={uploadFiles} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div className="chat-body">
        <div className="note-row">
          <strong>Project Brief</strong>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>{project.description}</p>
          <div className="file-list">
            {project.files.length === 0 ? <span className="hint">No files uploaded yet.</span> : project.files.map((file) => (
              <a className="file-row" key={file.id} href={`${API_URL}${file.url}`} target="_blank" rel="noreferrer">
                {file.originalName} · {(file.size / 1024 / 1024).toFixed(1)} MB
              </a>
            ))}
          </div>
        </div>

        {project.messages.map((item) => (
          <div className={`bubble ${item.senderRole}`} key={item.id}>
            <small>{item.senderName} · {new Date(item.createdAt).toLocaleString()}</small>
            {item.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="composer">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') send()
          }}
          placeholder="Message your project handler..."
        />
        <button className="solid-btn" onClick={send}>Send</button>
      </div>
    </section>
  )
}

function Dashboard({ session, onLogout }) {
  const { token, user } = session
  const [view, setView] = useState('portfolio')
  const [projects, setProjects] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [notifications, setNotifications] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false)
  const [error, setError] = useState('')

  const unreadCount = notifications.filter((item) => !item.read).length
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId) || projects[0],
    [projects, selectedId],
  )

  const loadData = useCallback(async () => {
    try {
      const [projectData, notificationData] = await Promise.all([
        apiRequest('/api/projects', { token }),
        apiRequest('/api/notifications', { token }),
      ])
      const portfolioData = await apiRequest('/api/portfolio', { token })
      setProjects(projectData.projects)
      setPortfolio(portfolioData.portfolio)
      setNotifications(notificationData.notifications)
      setSelectedId((current) => current || projectData.projects[0]?.id || '')
    } catch (err) {
      setError(err.message)
    }
  }, [token])

  useEffect(() => {
    const firstLoad = setTimeout(loadData, 0)
    const timer = setInterval(loadData, 5000)
    return () => {
      clearTimeout(firstLoad)
      clearInterval(timer)
    }
  }, [loadData])

  const upsertProject = (project) => {
    setProjects((current) => {
      const exists = current.some((item) => item.id === project.id)
      return exists ? current.map((item) => item.id === project.id ? project : item) : [project, ...current]
    })
    setSelectedId(project.id)
    setModalOpen(false)
    setView('projects')
    loadData()
  }

  const addPortfolioItem = (portfolioItem) => {
    setPortfolio((current) => [portfolioItem, ...current])
    setPortfolioModalOpen(false)
    setView('portfolio')
    loadData()
  }

  const deletePortfolioItem = async (portfolioId) => {
    if (!window.confirm('Delete this portfolio card?')) return
    await apiRequest(`/api/portfolio/${portfolioId}`, { method: 'DELETE', token })
    setPortfolio((current) => current.filter((item) => item.id !== portfolioId))
    loadData()
  }

  const markRead = async () => {
    await apiRequest('/api/notifications/read', { method: 'PATCH', token })
    loadData()
  }

  if (view === 'portfolio') {
    return (
      <>
        <PortfolioPage
          user={user}
          portfolio={portfolio}
          onStartProject={() => {
            setView('projects')
            setModalOpen(true)
          }}
          onOpenWorkspace={() => setView('projects')}
          onAddPortfolio={() => setPortfolioModalOpen(true)}
          onDeletePortfolio={deletePortfolioItem}
        />
        {modalOpen && <ProjectModal token={token} onClose={() => setModalOpen(false)} onCreated={upsertProject} />}
        {portfolioModalOpen && <PortfolioModal token={token} onClose={() => setPortfolioModalOpen(false)} onCreated={addPortfolioItem} />}
      </>
    )
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="logo-row">
          <img src={logo} alt="Real Media logo" />
          <div>
            <div className="brand-title" style={{ fontSize: 22 }}>REAL MEDIA</div>
            <span className="hint">{user.role === 'team' ? 'Team workspace' : 'Client workspace'}</span>
          </div>
        </div>
        <div className="side-nav">
          <button className={`tab ${view === 'portfolio' ? 'active' : ''}`} onClick={() => setView('portfolio')}>Portfolio</button>
          <button className={`tab ${view === 'projects' ? 'active' : ''}`} onClick={() => setView('projects')}>Workspace</button>
          <button className={`tab ${view === 'notifications' ? 'active' : ''}`} onClick={() => setView('notifications')}>Notifications {unreadCount ? `(${unreadCount})` : ''}</button>
          {user.role === 'client' && <button className="solid-btn" onClick={() => setModalOpen(true)}>Start Project</button>}
          {user.role === 'team' && <button className="solid-btn" onClick={() => setPortfolioModalOpen(true)}>Add Portfolio</button>}
          <button className="danger-btn" onClick={onLogout}>Logout</button>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <h1>{view === 'portfolio' ? 'Portfolio' : user.role === 'team' ? 'Project Command' : 'Your Projects'}</h1>
            <p className="hint">Logged in as {user.name}</p>
          </div>
          <div className="top-actions">
            <span className={`pill ${unreadCount ? 'hot' : ''}`}>{unreadCount} unread notification{unreadCount === 1 ? '' : 's'}</span>
            <span className="pill">{projects.length} project{projects.length === 1 ? '' : 's'}</span>
          </div>
        </header>

        {error && <p className="error">{error}</p>}

        {view === 'notifications' ? (
          <NotificationsPanel notifications={notifications} onRead={markRead} />
        ) : (
          <div className="dashboard-grid">
            <section className="panel">
              <div className="topbar">
                <h2>Project List</h2>
                <button className="ghost-btn" onClick={loadData}>Refresh</button>
              </div>
              <div className="project-list">
                {projects.length === 0 ? (
                  <div className="empty">
                    <div>
                      <p>No projects yet.</p>
                      {user.role === 'client' && <button className="solid-btn" onClick={() => setModalOpen(true)}>Start Your First Project</button>}
                    </div>
                  </div>
                ) : projects.map((project) => (
                  <button
                    key={project.id}
                    className={`project-card ${selectedProject?.id === project.id ? 'active' : ''}`}
                    onClick={() => setSelectedId(project.id)}
                  >
                    <h3>{project.title}</h3>
                    <p>{project.service} · {project.status}</p>
                    <p>{new Date(project.updatedAt).toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </section>

            <ProjectChat user={user} token={token} project={selectedProject} onProjectUpdate={upsertProject} />
          </div>
        )}
      </section>

      {modalOpen && <ProjectModal token={token} onClose={() => setModalOpen(false)} onCreated={upsertProject} />}
      {portfolioModalOpen && <PortfolioModal token={token} onClose={() => setPortfolioModalOpen(false)} onCreated={addPortfolioItem} />}
    </main>
  )
}

export default function RealMediaWebsite() {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('real-media-session'))
    } catch {
      return null
    }
  })

  const logout = () => {
    localStorage.removeItem('real-media-session')
    setSession(null)
  }

  return (
    <div className="page">
      <style>{styles}</style>
      <div className="grain" />
      {session?.token ? (
        <Dashboard session={session} onLogout={logout} />
      ) : (
        <AuthScreen onLogin={setSession} />
      )}
    </div>
  )
}
