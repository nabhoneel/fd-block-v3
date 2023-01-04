import React from "react";
import { Spinner } from "flowbite-react";

import fd_block_logo from "../assets/images/fdblock.png";

function LoadingAnimation() {
    return (
        <div className="absolute top-1/2 left-1/2 mt-[-50px] ml-[-50px] w-[100px] h-[100px]">
            <img src={fd_block_logo} className="absolute top-1/2 left-1/2 mt-[-20px] ml-[-20px] w-[40px] h-[40px]" alt="fdblock.org logo" />
            <Spinner size="2xl" />
        </div>
    );
}

export default LoadingAnimation;
