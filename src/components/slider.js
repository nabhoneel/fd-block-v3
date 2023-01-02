import React from "react";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/scrollbar";

import "./slider.css";
import Img1 from "../assets/images/banquet1.jpeg";
import Img2 from "../assets/images/banquet_outside_2.jpeg";
import Img3 from "../assets/images/banquet_outside.jpg";

// import required modules
import { Scrollbar, Autoplay } from "swiper";

export default function Slider({ className }) {
    const style_classes = `mySwiper ${className}`;
    return (
        <>
            <Swiper
                scrollbar={{
                    hide: true,
                }}
                autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                }}
                modules={[Scrollbar, Autoplay]}
                className={style_classes}
            >
                <SwiperSlide>
                    <img alt="shutup-warning" src={Img1} />
                </SwiperSlide>
                <SwiperSlide>
                    <img alt="shutup-warning" src={Img2} />
                </SwiperSlide>
                <SwiperSlide>
                    <img alt="shutup-warning" src={Img3} />
                </SwiperSlide>
                <SwiperSlide>
                    <img alt="shutup-warning" src={Img1} />
                </SwiperSlide>
                <SwiperSlide>
                    <img alt="shutup-warning" src={Img2} />
                </SwiperSlide>
                <SwiperSlide>
                    <img alt="shutup-warning" src={Img3} />
                </SwiperSlide>
            </Swiper>
        </>
    );
}
