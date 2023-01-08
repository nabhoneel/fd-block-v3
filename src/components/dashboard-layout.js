import React, { useContext } from "react";
import { navigate } from "gatsby";
import { Sidebar } from "flowbite-react";
import { BiBuoy } from "react-icons/bi";
import { CgPullClear, CgUserList } from "react-icons/cg";
import { FcBusinessContact, FcDataSheet, FcCalendar } from "react-icons/fc";

import Layout from "./layout";
import LoadingCenterSpinnner from "./loading-center";
import { StdContext } from "../context/StdContext";

export default function DashboardLayout({ children, enableBackgroundPattern = true, className = "", showSidebar = true }) {
    const { NoData, SignedIn, GetUserData } = useContext(StdContext);
    const user_data = GetUserData();

    if (NoData()) {
        return <LoadingCenterSpinnner />;
    }

    if (!SignedIn()) {
        navigate("/login");
    }

    if (SignedIn()) {
        const style_classes = `${showSidebar ? "flex" : ""} container mt-10 mx-auto ${className}`;
        return (
            <Layout enableBackgroundPattern={enableBackgroundPattern}>
                <div className={style_classes}>
                    {showSidebar ? (
                        <div className="w-fit mr-5">
                            <Sidebar aria-label="Sidebar with content separator example">
                                <Sidebar.Items>
                                    <Sidebar.ItemGroup>
                                        <Sidebar.Item href="/dashboard/profile" icon={FcBusinessContact}>
                                            <span className="text-sm tracking-tight font-semibold text-slate-500 uppercase">Profile</span>
                                        </Sidebar.Item>
                                        <Sidebar.Item href="/dashboard/bookings" icon={FcCalendar}>
                                            <span className="text-sm tracking-tight font-semibold text-slate-500 uppercase">My Bookings</span>
                                        </Sidebar.Item>
                                        <Sidebar.Item href="/dashboard/block-dir" icon={FcDataSheet}>
                                            <span className="text-sm tracking-tight font-semibold text-slate-500 uppercase">Block Directory</span>
                                        </Sidebar.Item>
                                    </Sidebar.ItemGroup>
                                    {user_data.is_admin ? (
                                        <Sidebar.ItemGroup>
                                            <Sidebar.Item href="/dashboard/admin/manage-bookings" icon={CgPullClear}>
                                                <span className="text-sm tracking-tight font-semibold text-slate-500 uppercase">Manage Bookings</span>
                                            </Sidebar.Item>
                                            <Sidebar.Item href="/dashboard/admin/manage-users" icon={CgUserList}>
                                                <span className="text-sm tracking-tight font-semibold text-slate-500 uppercase">Manage Users</span>
                                            </Sidebar.Item>
                                        </Sidebar.ItemGroup>
                                    ) : null}
                                    <Sidebar.ItemGroup>
                                        <Sidebar.Item href="/help" icon={BiBuoy}>
                                            Help
                                        </Sidebar.Item>
                                    </Sidebar.ItemGroup>
                                </Sidebar.Items>
                            </Sidebar>
                        </div>
                    ) : (
                        ""
                    )}
                    {children}
                </div>
            </Layout>
        );
    }
}
