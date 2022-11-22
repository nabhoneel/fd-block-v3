import React from "react";
import { useLocation } from "@reach/router";
import { Navbar, Button } from "flowbite-react";
import logo from "../assets/images/fdblock.png";

// Define the URLs and their page titles below
// TODO: Make this dynamic with graphql
const routes = new Map();
routes.set("/", "Home");
routes.set("/bookings", "Bookings");
routes.set("/contact", "Contact");
routes.set("/about", "About");

const Header = () => {
    const location = useLocation();
    const page_route = location?.pathname;
    const navbar_elements = [];
    routes.forEach((page_title, route) => {
        navbar_elements.push({
            route: route,
            title: page_title,
            active: route === page_route,
        });
    });

    return (
        <Navbar fluid={true} rounded={true}>
            <Navbar.Brand href="/">
                <img
                    src={logo}
                    className="mr-3 h-6 sm:h-9"
                    alt="fdblock.org logo"
                />
                <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                    fdblock.org
                </span>
            </Navbar.Brand>
            <div className="flex md:order-2">
                <Button size="md">Login</Button>
                <Navbar.Toggle />
            </div>
            <Navbar.Collapse>
                {navbar_elements.map(navbar_link => (
                    <Navbar.Link
                        key={navbar_link.route}
                        href={navbar_link.route}
                        active={navbar_link.active}
                    >
                        {navbar_link.title}
                    </Navbar.Link>
                ))}
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Header;
