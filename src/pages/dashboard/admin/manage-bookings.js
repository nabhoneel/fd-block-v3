import React from "react";
import { Card} from "flowbite-react";

import DashboardLayout from "../../../components/dashboard-layout";
import ListBookings from "../../../components/ListBookings";

const Dashboard = () => {
    return (
        <DashboardLayout>
            <div className="w-full">
                <Card>
                    <h3 className="text-xl">Manage Bookings</h3>
                    <ListBookings listAll={true} />
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
