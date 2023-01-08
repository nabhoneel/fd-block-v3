import React, { useState, useEffect } from "react";
import { Card, Spinner } from "flowbite-react";
import { useLocation } from "@reach/router";

import { getFirestore, doc, getDoc } from "firebase/firestore";

import EditBooking from "../../../components/EditBooking";
import DashboardLayout from "../../../components/dashboard-layout";

import { app } from "../../../config/firebase";
import Booking from "../../../helpers/Booking";
import { Collections } from "../../../helpers/constants";

const EditBookingPage = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const booking_id = params.get("id");

    const [booking_obj, SetBookingObj] = useState(null);

    useEffect(() => {
        if (booking_obj !== null) return;

        const GetBookingDetails = async () => {
            const db = getFirestore(app);
            const booking_ref = doc(db, Collections.BOOKINGS, booking_id);
            const booking_doc = await getDoc(booking_ref.withConverter(Booking.FirestoreConverter));
            if (booking_doc.exists()) {
                console.warn("Querying data");
                SetBookingObj(booking_doc.data()); // Booking object will get set
            } else {
                // TODO: Issue an alert
                console.error("Could not find any booking doc");
                SetBookingObj({});
            }
        };

        GetBookingDetails();
    });

    // TODO: Create spinner, change title inside EditBooking
    return (
        <DashboardLayout>
            <div className="w-full">
                <Card>{booking_obj === null ? <Spinner /> : <EditBooking editMode={true} startDate={booking_obj.start_date} endDate={booking_obj.end_date} bookingObject={booking_obj} />}</Card>
            </div>
        </DashboardLayout>
    );
};

export default EditBookingPage;
