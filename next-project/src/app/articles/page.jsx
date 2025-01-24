import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import styles from './Blog.module.css';
import Link from "next/link";
export default function Article1() {
    return (
        <>
            <Header />
            <div className={styles.navLink}>
                <Link href="/">Home</Link> &gt; <Link href="/articles">Articles</Link>
            </div>
            <main className={styles.main}>
                <h1>Link to Articles</h1>
                <ul><li><Link href="/articles/article1">Time Management Techniques That Even Beginners Can Stick To - Achieved with LearnLooper!</Link>
                </li><li><Link href="/articles/article2">LearnLooper: The Tool That's Revolutionizing Learning</Link>
                </li><li><Link href="/articles/article3">Learning Efficiency Revolution: The Science-Backed Learning Method of LearnLooper</Link></li></ul>
                </main>
            <Footer />
            </>
  );
}
