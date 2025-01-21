import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
const NotFound = () => {
  return (
    <>
      <Header />
      <p>Not Found!</p>
      <p>
        Back to <Link to="/">Home</Link>
      </p>
      <Footer />
    </>
  );
};
export default NotFound;
