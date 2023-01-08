import React, { useEffect } from "react";
import { Card } from "flowbite-react";

import DashboardLayout from "../../../components/dashboard-layout";
import ListBookings from "../../../components/ListBookings";

const Bookings = () => {
    return (
        <DashboardLayout>
            <div className="w-full">
                <Card>
                    <h3 className="text-xl">My Bookings</h3>
                    <ListBookings /* listAll = false, i.e., user only */ />
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Bookings;
