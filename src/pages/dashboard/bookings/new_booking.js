import React from "react";
import { useLocation } from "@reach/router";

import DashboardLayout from "../../../components/dashboard-layout";

const Bookings = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const request_id = params.get("request_id");

    return (
        <DashboardLayout>
            <div className="flex flex-col">
                <h5 className="text-lg">New Booking Request Created</h5>
                <span className="">ID: {request_id}</span>
            </div>
        </DashboardLayout>
    );
};

export default Bookings;
