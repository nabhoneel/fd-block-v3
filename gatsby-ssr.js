// NOTE: The contents of gatsby-ssr.js must be the same as gatsby-browser.js, with resepct to
// wrapping the root element with the Context provider ; otherwise useContext() yields undefined

import "./styles/global.css";

import React from "react";
import { StdContextProvider } from "./src/context/StdContext";

export const wrapRootElement = ({ element, props }) => {
    return <StdContextProvider>{element}</StdContextProvider>;
};
