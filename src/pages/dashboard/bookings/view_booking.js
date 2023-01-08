import React, { useState, useEffect, useContext } from "react";
import { navigate } from "gatsby";
import { Spinner, Card, Button, Modal, Alert } from "flowbite-react";
import { useLocation } from "@reach/router";

import { getFirestore, doc, getDoc, updateDoc, deleteDoc, arrayRemove } from "firebase/firestore";

import DashboardLayout from "../../../components/dashboard-layout";

import { app } from "../../../config/firebase";
import { StdContext } from "../../../context/StdContext";
import { UnblockDates } from "../../../helpers/utils";
import { Collections } from "../../../helpers/constants";
import Booking from "../../../helpers/Booking";

// TODO: Share the booking object via context. Use it by verifying proper details. Clear it at the proper time.
// If it is not available, fetch and set it on the context
const Bookings = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const booking_id = params.get("id");

    const { GetUserData, user_id } = useContext(StdContext);
    const user_data = GetUserData();

    const [booking_obj, SetBookingObj] = useState(null);
    const [show_delete_confirmation, SetShowDeleteConfirmation] = useState(false);
    const [booking_deletion_in_progress, SetBookingDeletionInProgress] = useState(false);
    const [show_unauthorized_access, SetShowUnauthorizedAccess] = useState(false);
    const [show_cancel_booking_request, SetShowCancelBookingRequest] = useState(false);
    const [show_accept_booking_request, SetShowAcceptBookingRequest] = useState(false);

    useEffect(() => {
        if (booking_obj !== null) return;

        const GetBookingDetails = async () => {
            const db = getFirestore(app);
            const booking_ref = doc(db, Collections.BOOKINGS, booking_id);
            const booking_doc = await getDoc(booking_ref.withConverter(Booking.FirestoreConverter));
            if (booking_doc.exists()) {
                console.warn("Querying data");
                const booking_data = booking_doc.data();
                if (user_data?.is_admin || booking_data.user_id === user_id) {
                    SetShowUnauthorizedAccess(false); // Just in case it was enabled due to some unexpected state-change
                    SetBookingObj(booking_doc.data()); // Booking object will get set
                    return;
                } else {
                    SetShowUnauthorizedAccess(true);
                    setTimeout(() => {
                        navigate("/dashboard/bookings");
                    }, 2000);
                }
            } else {
                // TODO: Issue an alert
                console.error("Could not find any booking doc");
            }

            SetBookingObj({});
        };

        GetBookingDetails();
    });

    const HandleEditBooking = () => {
        navigate(`/dashboard/bookings/edit_booking?id=${booking_obj.id}`);
    };

    const HandleBookingDeletion = async () => {
        SetBookingDeletionInProgress(true);
        const start_date = booking_obj.start_date;
        const end_date = booking_obj.end_date;
        const db = getFirestore(app);
        const booking_ref = doc(db, Collections.BOOKINGS, booking_obj.id);
        const user_ref = doc(db, Collections.USERS, booking_obj.user_id);
        await updateDoc(user_ref, {
            bookings: arrayRemove(booking_ref),
        });

        await deleteDoc(booking_ref);
        UnblockDates(start_date, end_date);

        setTimeout(() => {
            SetBookingDeletionInProgress(false);
            SetShowDeleteConfirmation(false);
            navigate("/dashboard/bookings");
        }, 1000);
    };

    return (
        <DashboardLayout>
            <div className="w-full">
                <Card>
                    <div className="h-full flex flex-col">
                        <h5 className="text-xl mb-5">Booking Details</h5>
                        <hr />
                        <div className="my-5">
                            {show_unauthorized_access ? (
                                <Alert color="failure">
                                    <span>
                                        {/* TODO: Do not make an empty threat, record this activity into 'system' */}
                                        <span className="font-bold">Unauthorized access!</span> This will be reported
                                    </span>
                                </Alert>
                            ) : null}

                            {booking_obj === null ? (
                                <div className="w-full text-center">
                                    <Spinner size="xl" />
                                </div>
                            ) : Object.keys(booking_obj).length === 0 ? null : (
                                <div className="flex flex-col">
                                    <div className="flex justify-start">
                                        <div className="mr-10">
                                            <h3 className="text-lg">User</h3>
                                            <span className="text-base">{booking_obj.user_id}</span>
                                        </div>
                                        <div className="mr-10">
                                            <h3 className="text-lg">Reference number</h3>
                                            <span className="text-base">{booking_obj.id}</span>
                                        </div>
                                        <div className="mx-10">
                                            <h3 className="text-lg">Date of booking</h3>
                                            <span className="text-base">{booking_obj.GetStartDateString()}</span>
                                        </div>
                                        <div className="mx-10">
                                            <h3 className="text-lg">Duration</h3>
                                            <span className="text-base">{booking_obj.GetDuration()} days</span>
                                        </div>
                                    </div>
                                    <div className="mt-5 flex justify-start">
                                        <div className="mr-10">
                                            <h3 className="text-lg">Purpose</h3>
                                            <span className="text-base">{booking_obj.GetEventString()}</span>
                                        </div>
                                        <div className="mx-10">
                                            <h3 className="text-lg">Number of floors booked</h3>
                                            <span className="text-base">{booking_obj.GetFloorOptionString()}</span>
                                        </div>
                                        <div className="mx-10">
                                            <h3 className="text-lg">Booking status</h3>
                                            <span className="text-base capitalize">{booking_obj.GetStatusString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <hr />
                        {booking_obj === null || Object.keys(booking_obj).length === 0 ? null : (
                            <div className="mt-5 flex justify-end">
                                {booking_obj.user_id !== user_id ? null : (
                                    <>
                                        <span className="mr-5">
                                            <Button color="light" onClick={HandleEditBooking}>
                                                Edit booking request
                                            </Button>
                                        </span>
                                        <span className="">
                                            <Button
                                                color="failure"
                                                onClick={() => {
                                                    SetShowDeleteConfirmation(true);
                                                }}
                                            >
                                                Delete booking request
                                            </Button>
                                        </span>
                                    </>
                                )}
                                {user_data?.is_admin ? (
                                    <>
                                        <span className="mx-5">
                                            <Button
                                                color="success"
                                                onClick={() => {
                                                    SetShowAcceptBookingRequest(true);
                                                }}
                                            >
                                                Accept booking request
                                            </Button>
                                        </span>
                                        {booking_obj.user_id !== user_id ? (
                                            <span className="">
                                                <Button
                                                    color="failure"
                                                    onClick={() => {
                                                        SetShowCancelBookingRequest(true);
                                                    }}
                                                >
                                                    Reject booking request
                                                </Button>
                                            </span>
                                        ) : null}
                                    </>
                                ) : null}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <Modal
                show={show_delete_confirmation}
                size="md"
                popup={true}
                onClose={() => {
                    SetShowDeleteConfirmation(false);
                }}
            >
                <Modal.Header />
                <Modal.Body>
                    {booking_deletion_in_progress === false ? (
                        <div className="text-center">
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Confirm deleting this booking request</h3>
                            <div className="flex justify-center gap-4">
                                <Button color="failure" onClick={HandleBookingDeletion}>
                                    Yes, I'm sure
                                </Button>
                                <Button
                                    color="gray"
                                    onClick={() => {
                                        SetShowDeleteConfirmation(false);
                                    }}
                                >
                                    No, don't delete
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col text-center">
                            <span className="mb-5 text-lg">Deleting booking request</span>
                            <Spinner color="failure" size="xl" />
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </DashboardLayout>
    );
};

export default Bookings;
