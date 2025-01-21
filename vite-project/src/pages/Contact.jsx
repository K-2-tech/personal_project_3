import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EmailLink from "../components/EmailLink";
const Contact = () => {
  return (
    <>
      <Header />
      <div>
        <Link to="/">Home</Link> &gt; <Link to="/contact">Contact</Link>
      </div>
      <EmailLink email="f4796150@gmail.com" subject="Inquiry" />

      <Footer />
    </>
  );
};
export default Contact;
