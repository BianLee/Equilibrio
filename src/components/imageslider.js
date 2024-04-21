import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
function ImageSlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  return (
    <div className="bg-white p-4 mt-4 rounded-lg shadow h-auto flex flex-col">
      <Slider {...settings}>
        <div>
          <img
            src="./cobra.png"
            alt="Image 1"
            style={{ userSelect: "none", pointerEvents: "none" }}
            draggable="false"
          />
        </div>
        <div>
          <img
            src="dog.png"
            alt="Image 2"
            style={{ userSelect: "none", pointerEvents: "none" }}
            draggable="false"
          />
        </div>
        <div>
          <img
            src="tree.jpg"
            alt="Image 3"
            style={{ userSelect: "none", pointerEvents: "none" }}
            draggable="false"
          />
        </div>
        <div>
          <img
            src="warrior.jpg"
            alt="Image 4"
            style={{ userSelect: "none", pointerEvents: "none" }}
            draggable="false"
          />
        </div>
        <div>
          <img
            src="chair.jpg"
            alt="Image 5"
            style={{ userSelect: "none", pointerEvents: "none" }}
            draggable="false"
          />
        </div>
      </Slider>
    </div>
  );
}

export default ImageSlider;
