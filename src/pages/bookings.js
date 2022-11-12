import * as React from "react";
import Layout from "../components/layout";
import Slider from "../components/slider";

export default function BookingsPage() {
    return (
        <Layout>
            <div className="text-4xl text-center pt-10">
                Community Hall Booking
                <Slider></Slider>
            </div>
        </Layout>
    );
}
