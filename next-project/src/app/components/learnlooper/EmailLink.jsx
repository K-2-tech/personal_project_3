"use client";
import React from "react";
import { RiTwitterXFill } from "react-icons/ri";
const EmailLink = ({ email, subject = "", body = "" }) => {
  const handleEmailClick = () => {
    // エンコードされたメールtoリンクを作成
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);

    // メールクライアントを開く
    window.location.href = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
  };

  return (
    <div>
      Please feel free to contact us through&nbsp;
      <a href={`mailto:${email}`} onClick={handleEmailClick}>
        this link
      </a>
      &nbsp;or&nbsp;
      <a
        href="https://x.com/K2nyanko"
        target="_blank"
        rel="noopener noreferrer"
      >
        <RiTwitterXFill />
      </a>
    </div>
  );
};

export default EmailLink;
