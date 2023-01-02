import * as React from "react";
import { Card } from "flowbite-react";

import Layout from "../components/layout";
import HeroSectionImg from "../components/SvgCommunityGroup";

import Post1 from "../assets/images/post1.jpg";
import Post2 from "../assets/images/post2.jpg";

export default function IndexPage() {
    return (
        <Layout>
            <div className="container flex justify-center align-center content-center mt-10 mb-10 pb-10">
                <HeroSectionImg />
                <div className="flex min-w-[50%] justify-center flex-col text-5xl 2xl:text-6xl text-right font-semibold">
                    <span>Welcome to FD Block,</span>
                    <span>Salt Lake City!</span>
                </div>
            </div>

            <div className="flex flex-row justify-between">
                <div className="max-w-[47%]">
                    <Card imgSrc={Post1}>
                        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Durga Pujo 2022</h5>
                        <p className="font-normal text-gray-700 dark:text-gray-400">Here is how one of the biggest pandals in Salt Lake was arranged</p>
                    </Card>
                </div>

                <div className="max-w-[47%]">
                    <Card imgSrc={Post2}>
                        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Durga Pujo 2021</h5>
                        <p className="font-normal text-gray-700 dark:text-gray-400">Here is how one of the biggest pandals in Salt Lake was arranged</p>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
