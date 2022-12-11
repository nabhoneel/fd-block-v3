import React from "react";
import Header from "./header";
import { Footer } from "flowbite-react";

export default function Layout({ children, className = "" }) {
    const style_classes = `max-w-[75%] container mx-auto ${className}`;
    return (
        <div className={style_classes}>
            <Header />
            {children}
            <div className="mt-7">
                <Footer container={true}>
                    <Footer.Copyright href="/" by="fdblock.org" year={2022} />
                    <Footer.LinkGroup>
                        <Footer.Link href="/">Home</Footer.Link>
                        <Footer.Link href="/bookings">Bookings</Footer.Link>
                        <Footer.Link href="/contact">Contact</Footer.Link>
                        <Footer.Link href="/about">About</Footer.Link>
                    </Footer.LinkGroup>
                </Footer>
            </div>
        </div>
    );
}
