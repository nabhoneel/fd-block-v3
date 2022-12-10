import "./styles/global.css";

import React from "react";
import { StdContextProvider } from "./src/context/StdContext";

export const wrapRootElement = ({ element, props }) => {
    return <StdContextProvider>{element}</StdContextProvider>;
};
