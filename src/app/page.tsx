import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/about/About";
import { AmbientGradient } from "@/components/AmbientGradient";
import { ProjectSphereSection } from "@/components/projects/sphere/ProjectSphereSection";
import { SkillsField } from "@/components/skills/SkillsField";
import { HandRevealSection } from "@/components/resume/HandRevealSection";
import { Footer } from "@/components/footer/Footer";
import { isEmailConfigured } from "@/lib/email/sendContactEmail";

export default function Home() {
  // Resolved on the server so the contact form never renders as live when
  // submitting would fail. Only the boolean crosses to the client — never the key.
  const contactEnabled = isEmailConfigured();

  return (
    <>
      <AmbientGradient />
      <Hero />
      <About />
      <ProjectSphereSection />
      <SkillsField />
      <HandRevealSection />
      <Footer contactEnabled={contactEnabled} />
    </>
  );
}
