import Link from "next/link";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <p>Not Found!</p>
      <p>
        Back to <Link href="/">Home</Link>
      </p>
      <Footer />
    </>
  );
}