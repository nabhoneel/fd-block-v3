import React, { useContext } from "react";
import Header from "./header";
import { Footer } from "flowbite-react";

import { getAuth } from "firebase/auth";

import { app } from "../config/firebase";
import { StdContext } from "../context/StdContext";

export default function Layout({ children, className = "" }) {
    // Cache the user's phone number and Firebase generated ID into StdContext
    const context = useContext(StdContext);
    const auth = getAuth(app);
    auth.onAuthStateChanged(user => {
        if (context.user_signing_in) return;

        if (user) {
            context.SetUserPhoneNumber(user.phoneNumber);
            context.SetUserId(user.uid);
        } else {
            context.SetUserPhoneNumber("");
            context.SetUserId("");
        }
    });

    const style_classes = `max-w-[75%] container mx-auto ${className}`;
    return (
        <div className={style_classes}>
            <Header />
            {children}
            <div>
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
