import React, { useContext } from "react";
import { useLocation } from "@reach/router";
import { Link } from "gatsby";
import { Navbar, Button, Spinner, Dropdown } from "flowbite-react";
import { SlUser } from "react-icons/sl";

import { getAuth } from "firebase/auth";

import { app } from "../config/firebase";
import { StdContext } from "../context/StdContext";
import fd_block_logo from "../assets/images/fdblock.png";

// Define the URLs and their page titles below
// TODO: Make this dynamic with graphql
const routes = new Map();
routes.set("home", ["/", "Home", true /* left side of navbar */]);
routes.set("bookings", ["/bookings", "Bookings", true /* left side of navbar */]);
routes.set("contact", ["/contact", "Contact", true /* left side of navbar */]);
routes.set("about", ["/about", "About", true /* left side of navbar */]);
routes.set("login", ["/login", "Login", false /* right side of navbar */]);

const Header = () => {
    const location = useLocation();
    const page_route = location?.pathname;
    const navbar_elements = [];
    routes.forEach((page_title, _) => {
        if (page_title[2]) {
            navbar_elements.push({
                route: page_title[0],
                title: page_title[1],
                active: page_title[0] === page_route,
            });
        }
    });

    const { user_id, user_phone_number } = useContext(StdContext);
    const auth = getAuth(app);
    return (
        <Navbar fluid={true} rounded={true}>
            <Navbar.Brand href="/">
                <img src={fd_block_logo} className="mr-3 h-6 sm:h-9" alt="fdblock.org logo" />
                <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">fdblock.org</span>
            </Navbar.Brand>
            <div className="flex md:order-2">
                {user_id === null ? (
                    <Spinner aria-label="Default status example" />
                ) : user_id?.length > 0 ? (
                    <div className="flex md:order-2">
                        <Dropdown arrowIcon={false} inline={true} label={<SlUser className="text-2xl" />}>
                            <Dropdown.Header>
                                <span className="block text-sm">New User</span>
                                <span className="block truncate text-sm font-medium">{user_phone_number}</span>
                            </Dropdown.Header>
                            <Dropdown.Item>
                                <Link to="/dashboard/profile">Profile</Link>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Link to="/dashboard/bookings">Bookings</Link>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Link to="/dashboard/block-dir">Block Directory</Link>
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={e => auth.signOut()}>Sign out</Dropdown.Item>
                        </Dropdown>
                        <Navbar.Toggle />
                    </div>
                ) : (
                    <Navbar.Link href={routes.get("login")[0]}>{routes.get("login")[1]}</Navbar.Link>
                )}
                <Navbar.Toggle />
            </div>
            <Navbar.Collapse>
                {navbar_elements.map(navbar_link => (
                    <Navbar.Link key={navbar_link.route} href={navbar_link.route} active={navbar_link.active}>
                        {navbar_link.title}
                    </Navbar.Link>
                ))}
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Header;
