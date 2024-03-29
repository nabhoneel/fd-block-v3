import React, { useState, useContext, useEffect } from "react";
import { Link } from "gatsby";
import { Tabs, Table, Spinner } from "flowbite-react";

import { getFirestore, doc, getDoc, getDocs, collection } from "firebase/firestore";

import { app } from "../config/firebase";
import { StdContext } from "../context/StdContext";
import { Constants, Collections } from "../helpers/constants";
import Booking from "../helpers/Booking";

const ListBookings = ({ listAll = false }) => {
    const { NoData, user_id } = useContext(StdContext);
    const [bookings, SetBookings] = useState(null);

    // On obtaining the user_id from context, fetch the user's booking data-set
    useEffect(() => {
        if (NoData()) return;

        const FetchBookingData = async Populate => {
            const db = getFirestore(app);
            if (listAll) {
                let booking_data_set = [];
                const bookings_collection = collection(db, Collections.BOOKINGS).withConverter(Booking.FirestoreConverter);
                const bookings = await getDocs(bookings_collection);
                bookings.forEach(booking_doc => {
                    const booking_obj = booking_doc.data();
                    booking_data_set.push(booking_obj);
                });

                SetBookings(booking_data_set);
                return;
            }

            const user_ref = doc(db, Collections.USERS, user_id);
            const user_data = await getDoc(user_ref);
            if (user_data.exists()) {
                let booking_data_set = [];
                const data = user_data.data();
                const bookings = data.bookings;
                if (bookings === undefined) {
                    SetBookings({});
                    return;
                }

                // Not using forEach since it sort of runs asynchronously, which leads to booking_data_set being empty
                // Not sure why this happens
                for (let idx = 0; idx < bookings.length; idx++) {
                    const booking_doc = await getDoc(bookings[idx].withConverter(Booking.FirestoreConverter));
                    if (booking_doc.exists()) {
                        const booking_obj = booking_doc.data();
                        booking_data_set.push(booking_obj);
                    }
                }

                SetBookings(booking_data_set);
            } // no else block since user-data should exist at this point
        };

        FetchBookingData();
    });

    const CreateTableHeader = (show_status = true) => {
        return (
            <>
                <Table.HeadCell>#</Table.HeadCell>
                <Table.HeadCell>Date</Table.HeadCell>
                <Table.HeadCell>Duration</Table.HeadCell>
                <Table.HeadCell>Purpose</Table.HeadCell>
                {show_status === true ? <Table.HeadCell>Status</Table.HeadCell> : null}
                <Table.HeadCell></Table.HeadCell>
            </>
        );
    };

    const REQUESTS = Constants.STATUS_REQUEST;
    const UPCOMING = "upcoming";
    const PAST = "past";
    const CreateBookingsRows = (filter = null) => {
        if (bookings === null) return null;

        let rows = [];
        for (let i = 0; i < bookings.length; i++) {
            const booking_obj = bookings[i];
            const is_request = booking_obj.IsRejected() || booking_obj.IsRequest();
            if (filter === REQUESTS && !is_request) continue;
            if (filter === PAST && (is_request || !booking_obj.IsPast())) continue;
            if (filter === UPCOMING && (is_request || !booking_obj.IsUpcoming())) continue;

            rows.push(
                <Table.Row key={booking_obj.id}>
                    <Table.Cell>{i + 1}</Table.Cell>
                    <Table.Cell>{booking_obj.GetStartDateString()}</Table.Cell>
                    <Table.Cell>{booking_obj.GetDuration()} days</Table.Cell>
                    <Table.Cell>{booking_obj.GetEventString()}</Table.Cell>
                    {filter === null || filter === REQUESTS ? <Table.Cell>{booking_obj.GetStatusString()}</Table.Cell> : null}
                    <Table.Cell>
                        <Link to={`/dashboard/bookings/view_booking?id=${booking_obj.id}`}>
                            <span className="text-blue-500">View</span>
                        </Link>
                    </Table.Cell>
                </Table.Row>
            );
        }

        return rows;
    };

    return (
        <div>
            <div className="h-full">
                {bookings === null ? (
                    <div className="w-full text-center">
                        <Spinner />
                    </div>
                ) : (
                    <Tabs.Group style="underline">
                        <Tabs.Item active={true} title="All">
                            <Table>
                                <Table.Head>{CreateTableHeader()}</Table.Head>
                                <Table.Body>{CreateBookingsRows()}</Table.Body>
                            </Table>
                        </Tabs.Item>
                        <Tabs.Item title="Requests">
                            <Table>
                                <Table.Head>{CreateTableHeader()}</Table.Head>
                                <Table.Body>{CreateBookingsRows(REQUESTS)}</Table.Body>
                            </Table>
                        </Tabs.Item>
                        <Tabs.Item title="Upcoming">
                            <Table>
                                <Table.Head>{CreateTableHeader(false)}</Table.Head>
                                <Table.Body>{CreateBookingsRows(UPCOMING)}</Table.Body>
                            </Table>
                        </Tabs.Item>
                        <Tabs.Item title="Past">
                            <Table>
                                <Table.Head>{CreateTableHeader(false)}</Table.Head>
                                <Table.Body>{CreateBookingsRows(PAST)}</Table.Body>
                            </Table>
                        </Tabs.Item>
                    </Tabs.Group>
                )}
            </div>
        </div>
    );
};

export default ListBookings;
