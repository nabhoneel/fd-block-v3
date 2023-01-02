import React from "react";
import { Spinner } from "flowbite-react";

export default function () {
    return (
        <div className="absolute top-1/2 left-1/2 mt-[-50px] ml-[-50px] w-[100px] h-[100px]">
            <Spinner size="2xl" />
        </div>
    );
}
