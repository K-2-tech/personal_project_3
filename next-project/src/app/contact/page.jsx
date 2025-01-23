import Link from "next/link";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import EmailLink from "../components/learnlooper/EmailLink";

export default function Contact() {
  return (
    <>
      <Header />
      <div>
        <Link href="/">Home</Link> &gt; <Link href="/contact">Contact</Link>
      </div>
      <EmailLink email="f4796150@gmail.com" subject="Inquiry" />
      <Footer />
    </>
  );
}
