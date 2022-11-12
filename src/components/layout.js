import React from "react";
import Header from "./header";

export default function Layout({ children }) {
    return (
        <div className="container mx-auto">
            <Header></Header>
            {children}
        </div>
    );
}
