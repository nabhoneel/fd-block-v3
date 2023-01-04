import React from "react";
import { Card } from "flowbite-react";
import { useLocation } from "@reach/router";

import DashboardLayout from "../../../components/dashboard-layout";

const Bookings = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const request_id = params.get("id");

    return (
        <DashboardLayout>
            <div className="w-full">
                <Card>
                    <div className="h-full flex flex-col">
                        <h5 className="text-lg">Booking Details</h5>
                        <span className="">ID: {request_id}</span>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Bookings;
