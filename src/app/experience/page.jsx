import ExperienceMap from '@/components/ExperienceMap';
import PageArrows from '@/components/PageArrows';

export const metadata = {
  title: "Experience – Jai's Journey",
  description: "A cinematic career journey map.",
};

export default function ExperiencePage() {
  return (
    <>
      <ExperienceMap />
      <PageArrows prev="/skills" next="/contact" />
    </>
  );
}
