import React, { useState, Suspense } from "react";
// import { navigate } from "gatsby";
import { Button, Spinner } from "flowbite-react";

import Layout from "../components/layout";
import CommunityHallImageSlider from "../components/slider";
import Datepicker from "../components/datepicker";

export default function BookingsPage() {
    function Proceed(e) {
        console.log(start_date);
        console.log(end_date);
        // navigate(`/complete_booking?start_date=${Math.floor(date[0] / 1000)}&end_date=${Math.floor(date[1] / 1000)}`);
    }

    const [start_date, SetStartDate] = useState(new Date());
    const [end_date, SetEndDate] = useState(new Date());
    return (
        <Layout>
            <div className="text-4xl text-center pt-10 mb-10">Community Hall Booking</div>
            <CommunityHallImageSlider />
            <div className="scale-125 flex justify-center w-full mt-20 mb-14">
                <Suspense fallback={<Spinner color="success" aria-label="Success spinner example" />}>
                    <Datepicker StartDate={start_date} SetStartDate={SetStartDate} EndDate={end_date} SetEndDate={SetEndDate} />
                </Suspense>
            </div>
            <div className="flex justify-center w-full my-10">
                <Button onClick={Proceed}>Proceed</Button>
            </div>
        </Layout>
    );
}
