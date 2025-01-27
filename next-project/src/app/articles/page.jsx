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
                <ul>
                <li><Link href="/articles/article1">Time Management Techniques That Even Beginners Can Stick To - Achieved with LearnLooper!</Link>
                </li><li><Link href="/articles/article2">LearnLooper: The Tool That's Revolutionizing Learning</Link>
                </li><li><Link href="/articles/article3">Learning Efficiency Revolution: The Science-Backed Learning Method of LearnLooper</Link>
                </li><li><Link href="/articles/article4">AB Loop Listening</Link>
                </li><li><Link href="/articles/article5">Effective TOEIC Listening Practice Using LearnLooper</Link>
                </li><li><Link href="/articles/article6">Boost Your Learning Efficiency with Scientific Techniques</Link>
                </li><li><Link href="/articles/article7">How to Maximize Learning Efficiency with a Pomodoro Timer</Link>
                </li><li><Link href="/articles/article8">Unlock Your Study Potential: LearnLooper’s Multi-Audio Upload for Efficient Learning</Link></li>
                <li><Link href="/articles/article9">Revolutionize Your Study Routine: Free Tools to Enhance Learning Productivity</Link></li>
                <li><Link href="/articles/article10">From Procrastination to Productivity: The Ultimate Guide to Staying Focused with LearnLooper</Link></li>
                </ul >
                </main>
            <Footer />
            </>
  );
}
