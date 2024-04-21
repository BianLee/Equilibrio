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
          <img src="/path/to/image1.jpg" alt="Image 1" />
        </div>
        <div>
          <img src="/path/to/image2.jpg" alt="Image 2" />
        </div>
        <div>
          <img src="/path/to/image3.jpg" alt="Image 3" />
        </div>
        <div>
          <img src="/path/to/image4.jpg" alt="Image 4" />
        </div>
        <div>
          <img src="/path/to/image5.jpg" alt="Image 5" />
        </div>
      </Slider>
    </div>
  );
}

export default ImageSlider;
