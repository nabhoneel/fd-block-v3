import React from "react";
import { Card } from "flowbite-react";

import DashboardLayout from "../../../components/dashboard-layout";

const Dashboard = () => {
    return (
        <DashboardLayout>
            <Card>
                <h3 className="text-xl">Manage Users</h3>
            </Card>
        </DashboardLayout>
    );
};

export default Dashboard;
