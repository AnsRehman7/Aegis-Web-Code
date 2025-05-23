import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import mainImg from "../assets/main-img.png";

function HeroSection() {

  const navigate = useNavigate();

  const handleSubmit = () => {
   
    navigate("/login"); 
  };

  return (
    <div className="container-fluid py-5 hero-section " style={{backgroundColor:"#F1FFF3"}}>

      <div className="container h-90 d-flex justify-content-center align-items-center">
        <div className="row align-items-center h-100">
          
          {/* Left Section */}
          <div className="col-lg-6 text-center text-lg-start">
            <h2 className="fw-bold">
              The all-in-one <br />
              <span className="text-primary">Parental Control</span>
              <br />
               Solution
            </h2>
            <button onClick={handleSubmit} className="btn btn-primary mt-3">Get Started Free</button>

           
          </div>

          {/* Right Section (Mockup Image) */}
          <div className="col-lg-6 text-center">
          <img 
  src={mainImg} className="img-fluid" alt="Mobile UI" style={{ width: "2264px", height: "auto" }} />

          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
