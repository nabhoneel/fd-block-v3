// Front end
import React from "react";
import { useLocation } from "@reach/router";

import EditBooking from "../../components/EditBooking";
import DashboardLayout from "../../components/dashboard-layout";

const CompleteBooking = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const sd = params.get("sd");
    const ed = params.get("ed");
    const start_date = new Date(parseInt(sd));
    const end_date = new Date(parseInt(ed));

    return (
        <DashboardLayout showSidebar={false} enableBackgroundPattern={true}>
            <EditBooking startDate={start_date} endDate={end_date} editMode={false} />;
        </DashboardLayout>
    );
};

export default CompleteBooking;
