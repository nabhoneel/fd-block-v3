import React, { useState } from "react";
import { navigate } from "gatsby";
import { Button } from "flowbite-react";

import Layout from "../components/layout";
import CommunityHallImageSlider from "../components/slider";
import SimpleDatepicker from "../components/datepicker";

export default function BookingsPage() {
    function Proceed(e) {
        navigate(`/complete_booking?start_date=${Math.floor(date[0] / 1000)}&end_date=${Math.floor(date[1] / 1000)}`);
    }

    const [date, setDate] = useState([new Date(), new Date()]);
    return (
        <Layout>
            <div className="text-4xl text-center pt-10 mb-10">Community Hall Booking</div>
            <CommunityHallImageSlider></CommunityHallImageSlider>
            <div className="scale-125 flex justify-center w-full mt-20 mb-14">
                <SimpleDatepicker onChange={setDate} value={date}></SimpleDatepicker>
            </div>
            <div className="flex justify-center w-full my-10">
                <Button onClick={Proceed}>Proceed</Button>
            </div>
        </Layout>
    );
}
