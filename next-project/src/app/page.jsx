import Link from "next/link";
import styles from "./HomePage.module.css";
import Image from "next/image";
import { RiTwitterXFill } from "react-icons/ri";

export default function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <Image src="./icon.svg" height={45} width={45} alt="icon" />
        <div className={styles.title}>
          LearnLooper
        </div>
      </div>
      <main className={styles.main}>
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Welcome to Our Web Tools</h1>
          <p className={styles.heroDescription}>
            Discover our suite of productivity-boosting applications.
          </p>
        </section>

        <section className={styles.productSection}>
          <Link href="/tools/learnlooper" className={styles.productItem}>
            <div>
              <h2 className={styles.productTitle}>LearnLooper</h2>
              <p className={styles.productDescription}>
                A Pomodoro timer to enhance your focus.
              </p>
            </div>
          </Link>
          <Link href="/tools/abloop" className={styles.productItem}>
            <div>
              <h2 className={styles.productTitle}>AB Loop</h2>
              <p className={styles.productDescription}>
                Loop playback for YouTube videos. Dance and piano practice.
              </p>
            </div>
          </Link>
          <Link href="/tools/audioloop" className={styles.productItem}>
            <div>
              <h2 className={styles.productTitle}>Audio Loop Tool</h2>
              <p className={styles.productDescription}>
                MP3 playback with looping capabilities.
              </p>
            </div>
          </Link>
          <Link href="/tools/displaylock" className={styles.productItem}>
            <div>
              <h2 className={styles.productTitle}>Display Lock</h2>
              <p className={styles.productDescription}>
                Stay focused by preventing tab switching during study sessions.
              </p>
            </div>
          </Link>
        </section>

        <section className={styles.articlesSection}>
        <h2 className={styles.articlesTitle}>Articles &amp; FAQ</h2>
          <p className={styles.articlesDescription}>
            Check out our helpful tips and information.
          </p>
          <Link href="/articles" className={styles.articlesLink}>
            Read More
          </Link>
        </section>
      </main>
      <div className={styles.footerMenu}>
      <Link href="/">Home</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/contact">Contact</Link>
        <a
          href="https://x.com/K2nyanko"
          target="_blank"
          rel="noopener noreferrer"
        >
          <RiTwitterXFill className={styles.twitterIcon} />
        </a>
      </div>
      <div className={styles.copyright}>
        <small>Copyright©K2nyanko</small>
      </div>
    </div>
  );
}