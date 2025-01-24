import React from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import styles from '../Blog.module.css';
import Link from "next/link";
export default function Article1() {
  return (
<>
        <Header />
        <div className={styles.navLink}>
      <Link href="/">Home</Link> &gt;<Link href="/articles">Articles</Link> &gt; <Link href="/blog/article1">Article 1</Link>
    </div>
    <div className={styles.container}>

    <main className={styles.main}>
    <h1 className={styles.title}>Time Management Techniques That Even Beginners Can Stick To - Achieved with LearnLooper!</h1>
    <section className={styles.section}>
      <h2>Why is time management so difficult?</h2>
      <p>
        For many people, the biggest hurdle in learning is "continuity". Maintaining motivation and efficiently securing learning time is the biggest challenge for beginners. Various factors such as maintaining concentration and loss of motivation for boring studies are hindering the continuation of learning.
      </p>
    </section>
    <section className={styles.section}>
      <h2>Innovative features of LearnLooper</h2>
      <h3>1-minute Pomodoro Timer: Unparalleled flexibility</h3>
      <p>
        The standard Pomodoro technique was 25 minutes, but LearnLooper allows you to set the timer in 1-minute increments. This enables you to convert even short gaps of time into learning time, and allows for flexible learning that matches your concentration level. It also lowers the psychological barrier and makes it easier to start learning.
      </p>
      <h3>Enjoyable learning environment integrated with YouTube</h3>
      <p>
        The biggest feature of LearnLooper is the ability to learn while listening to your favorite music. You can directly play your favorite songs from YouTube, and the appropriate music that doesn't interfere with your concentration will boost your learning motivation. By combining boring studies with enjoyable content, you can turn learning into an enjoyable activity.
      </p>
    </section>
    <section className={styles.section}>
      <h2>Specific usage steps</h2>
      <ol>
        <li>Open LearnLooper</li>
        <li>Set the 1-minute timer</li>
        <li>Select your favorite YouTube music</li>
        <li>Start learning!</li>
      </ol>     
    </section>
    <section className={styles.section}>
      <h2>Recommended usage</h2>
      <ul>
        <li>Utilize spare time during commutes</li>
        <li>For the introduction to difficult studies</li>
        <li>For subjects where motivation is hard to maintain</li>
      </ul>     
    </section>
    <section className={styles.section}>
      <h2>Tips for continuing learning</h2>
      <ul>
        <li>Start with a short time without overdoing it</li>
        <li>Boost motivation with favorite music</li>
        <li>Cherish the sense of achievement</li>
      </ul>     
    </section>
    <div>LearnLooper is a learning tool that overturns conventional concepts. By using the AB loop function, you can repeatedly study the parts that require particularly focused attention. Freely utilize it to suit your learning style.</div>
  </main>

     
            </div>
            <Footer />
            </>
  );
}
