import React, { useContext } from "react";
import { StdContext } from "../context/StdContext";

const SignOut = () => {
    const { SignOut } = useContext(StdContext);
    SignOut();
    return <></>;
};

export default SignOut;
