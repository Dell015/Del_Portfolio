import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/about/About";
import { AmbientGradient } from "@/components/AmbientGradient";
import { ProjectSphereSection } from "@/components/projects/sphere/ProjectSphereSection";
import { SkillsField } from "@/components/skills/SkillsField";
import { ResumeCTA } from "@/components/resume/ResumeCTA";
import { Footer } from "@/components/footer/Footer";

export default function Home() {
  return (
    <>
      <AmbientGradient />
      <Hero />
      <About />
      <ProjectSphereSection />
      <SkillsField />
      <ResumeCTA />
      <Footer />
    </>
  );
}
