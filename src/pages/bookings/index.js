import React, { useState, useContext, Suspense } from "react";
import { navigate } from "gatsby";
import { Button, Spinner } from "flowbite-react";

import Layout from "../../components/layout";
import CommunityHallImageSlider from "../../components/slider";
import Datepicker from "../../components/datepicker";

import { StdContext } from "../../context/StdContext";

export default function BookingsPage() {
    const { SignedIn } = useContext(StdContext);

    function Proceed(e) {
        if (SignedIn()) {
            const url_query = `?sd=${start_date.valueOf()}&ed=${end_date.valueOf()}`;
            navigate(`/bookings/complete-booking${url_query}`);
        } else {
            const booking_query = `sd%3D${start_date.valueOf()}%26ed%3D${end_date.valueOf()}`;
            const url_query = `?goto=%2Fbookings%2Fcomplete-booking%3F${booking_query}`;
            navigate(`/login${url_query}`);
        }
    }

    const [start_date, SetStartDate] = useState(new Date());
    const [end_date, SetEndDate] = useState(new Date());
    return (
        <Layout>
            <div className="text-4xl text-center pt-10 mb-10">Community Hall Booking</div>
            <div className="flex justify-center w-full mt-20 mb-14">
                <CommunityHallImageSlider className="min-w-[50%]" />
                <div className="flex flex-col items-center content-center justify-center w-full mb-14">
                    <Suspense fallback={<Spinner color="success" aria-label="Success spinner example" />}>
                        <Datepicker StartDate={start_date} SetStartDate={SetStartDate} EndDate={end_date} SetEndDate={SetEndDate} />
                    </Suspense>
                    <div className="flex justify-center w-full my-10">
                        <Button onClick={Proceed}>Proceed</Button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
