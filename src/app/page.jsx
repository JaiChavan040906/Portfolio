import PageArrows from '@/components/PageArrows';
import styles from './home.module.css';

export const metadata = {
  title: "Home – Jai's Journey",
  description: "Jai Chavan – BTech Computer Science Engineer. Full-stack developer, hackathon winner, and creative technologist.",
};

export default function HomePage() {
  return (
    <>
      <div className={styles.sceneContainer}>
        <div className={styles.ambientGlow} />

        <div className={styles.heroText}>
          <span className={styles.tag}>Hi, I'm</span>
          <h1>Jai Chavan</h1>
          <h2>BTech Computer Science Engineer</h2>
          <p>
            Computer Engineering undergraduate passionate about building creative
            and meaningful tech experiences. Skilled in Java, Python, and full-stack
            web development. Experienced in leading teams, contributing to hackathons,
            and turning ideas into real products.
          </p>
        </div>
      </div>

      <PageArrows next="/skills" />
    </>
  );
}
