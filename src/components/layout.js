import React from "react";
import Header, { routes } from "./header";
import { Footer } from "flowbite-react";

export default function Layout({ children }) {
    const navbar_elements = [];
    return (
        <div className="container mx-auto">
            <Header></Header>
            {children}
            <Footer container={true} className="absolute">
                <Footer.Copyright href="/" by="fdblock.org" year={2022} />
                <Footer.LinkGroup>
                    <Footer.Link href="/">Home</Footer.Link>
                    <Footer.Link href="/bookings">Bookings</Footer.Link>
                    <Footer.Link href="/contact">Contact</Footer.Link>
                    <Footer.Link href="/about">About</Footer.Link>
                </Footer.LinkGroup>
            </Footer>
        </div>
    );
}
