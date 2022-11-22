import React, { useState } from "react";
import Layout from "../components/layout";
import CommunityHallImageSlider from "../components/slider";
import SimpleDatepicker from "../components/datepicker";
import { Button } from "flowbite-react";

export default function BookingsPage() {
    const [date, setDate] = useState([new Date(), new Date()]);
    return (
        <Layout>
            <div className="text-4xl text-center pt-10 mb-10">
                Community Hall Booking
            </div>
            <CommunityHallImageSlider></CommunityHallImageSlider>
            <div className="scale-125 flex justify-center w-full mt-20 mb-14">
                <SimpleDatepicker></SimpleDatepicker>
            </div>
            <div className="flex justify-center w-full my-10">
                <Button>Proceed</Button>
            </div>
        </Layout>
    );
}
