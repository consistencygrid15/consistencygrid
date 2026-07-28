"use client";

import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { InteractivePhone } from "./InteractivePhone";
import { PhilosophyCallout } from "./PhilosophyCallout";
import { BentoFeatures } from "./BentoFeatures";
import { GetStarted } from "./GetStarted";
import { QRDownload } from "./QRDownload";
import { Testimonials } from "./Testimonials";
import { FAQ } from "./FAQ";
import { Footer } from "./Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      <Nav />
      <Hero />
      <InteractivePhone />
      <PhilosophyCallout />
      <BentoFeatures />
      <GetStarted />
      <QRDownload />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
