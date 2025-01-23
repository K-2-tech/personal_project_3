import React from "react";
import styles from "./Header.module.css";
import Image from "next/image";
import Link from "next/link";
const Header = () => {
  return (
    <div className={styles.headerWrapper}>
      <Image src="/icon.svg" height={45} width={45} alt="icon" />
      <Link href="/" className={styles.headerLink}>
        <div className={styles.title}>
          <span>L</span>
          <p>earn</p>
          <span>L</span>
          <p>ooper</p>
        </div>
      </Link>
    </div>
  );
};

export default Header;
