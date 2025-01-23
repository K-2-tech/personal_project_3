import React from "react";
import Link from "next/link";
import { RiTwitterXFill } from "react-icons/ri";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <>
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
    </>
  );
};

export default Footer;
