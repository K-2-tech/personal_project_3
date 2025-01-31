import React from "react";
import styles from "./Header.module.css";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <div className={styles.headerWrapper}>
      <div className={styles.contentContainer}>
        <Image src="/icon.svg" height={45} width={45} alt="icon" />
        <Link href="/" className={styles.headerLink}>
          <div className={styles.title}>
            LearnLooper
          </div>
        </Link>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLScKDnNGjQM9ml7GSCCZTITNWZMoNfCYFcmxncnxiixVcoxbtg/viewform?usp=header"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.feedbackButton}
        >
          Feedback
        </a>
      </div>
    </div>
  );
};

export default Header;