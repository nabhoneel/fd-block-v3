import React, { useContext } from "react";
import { Sidebar } from "flowbite-react";
import { BiListUl, BiBuoy, BiUser, BiCalendarEvent } from "react-icons/bi";

import Layout from "./layout";
import { StdContext } from "../context/StdContext";

export default function DashboardLayout({ children, className = "" }) {
    const style_classes = `flex container mx-auto ${className}`;
    return (
        <Layout>
            <div className={style_classes}>
                <div className="w-fit mr-5">
                    <Sidebar aria-label="Sidebar with content separator example">
                        <Sidebar.Items>
                            <Sidebar.ItemGroup>
                                <Sidebar.Item href="/dashboard/profile" icon={BiUser}>
                                    <span className="text-sm">Profile</span>
                                </Sidebar.Item>
                                <Sidebar.Item href="/dashboard/bookings" icon={BiCalendarEvent}>
                                    <span className="text-sm">My Bookings</span>
                                </Sidebar.Item>
                                <Sidebar.Item href="/dashboard/block-dir" icon={BiListUl}>
                                    <span className="text-sm">Block Directory</span>
                                </Sidebar.Item>
                            </Sidebar.ItemGroup>
                            <Sidebar.ItemGroup>
                                <Sidebar.Item href="/help" icon={BiBuoy}>
                                    Help
                                </Sidebar.Item>
                            </Sidebar.ItemGroup>
                        </Sidebar.Items>
                    </Sidebar>
                </div>
                {children}
            </div>
        </Layout>
    );
}
