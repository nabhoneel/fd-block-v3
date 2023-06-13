import React, { useState, useEffect, useContext } from "react";
import { navigate } from "gatsby";
import { Table, Spinner, Card, Button, Modal, Alert, Textarea } from "flowbite-react";
import { useLocation } from "@reach/router";

import { getFirestore, doc, getDoc, updateDoc, deleteDoc, arrayRemove } from "firebase/firestore";

import DashboardLayout from "../../../components/dashboard-layout";
import { PriceSummary } from "../../../components/EditBooking";

import { app } from "../../../config/firebase";
import { StdContext } from "../../../context/StdContext";
import { BlockDates, UnblockDates } from "../../../helpers/utils";
import { cost_table } from "../../../helpers/community_hall_rates.js";
import { Constants, Collections } from "../../../helpers/constants";
import Booking from "../../../helpers/Booking";

// TODO: Share the booking object via context. Use it by verifying proper details. Clear it at the proper time.
// If it is not available, fetch and set it on the context

const BookingDetails = ({ booking, display_user = false }) => {
    const { GetUserData } = useContext(StdContext);
    const user_data = GetUserData();
    const resident = user_data && user_data["isMember"] === true ? "residents" : "non_residents";
    const event = booking.GetEventType();
    const floor = booking.GetFloorOption();
    const event_floor_unit_cost = cost_table[resident][event][floor];
    const refundable_deposit_cost = cost_table[resident][event]["security_deposit"];
    const date_diff = booking.GetDuration();

    return (
        <div className="flex space-x-4">
            <Table>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell>
                            <div className="flex flex-col text-black">
                                <span className="text-lg font-semibold">Booking date</span>
                                <span className="text-base">{booking.GetStartDateString()}</span>
                            </div>
                            <hr className="my-3" />
                            <div className="flex flex-col text-black">
                                <span className="text-lg font-semibold">Duration</span>
                                <span className="text-base">{booking.GetDuration()} days</span>
                            </div>
                            <hr className="my-3" />
                            <div className="flex flex-col text-black">
                                <span className="text-lg font-semibold">Purpose</span>
                                <span className="text-base">{booking.GetEventString()}</span>
                            </div>
                            <hr className="my-3" />
                            <div className="flex flex-col text-black">
                                <span className="text-lg font-semibold">Number of floors booked</span>
                                <span className="text-base">{booking.GetFloorOptionString()}</span>
                            </div>
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
            <div className="flex flex-col">
                <Table>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>
                                <div className="flex flex-col text-black">
                                    <span className="text-lg font-semibold">Booking code</span>
                                    <span className="text-base">{booking.GetBookingCode()}</span>
                                </div>
                            </Table.Cell>
                            <Table.Cell>
                                <div className="border-l-1 border-solid border-black h-2"></div>
                                <div className="flex flex-col text-black">
                                    <span className="text-lg font-semibold">Status</span>
                                    <span className="text-base">{booking.GetStatusString()}</span>
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
                <PriceSummary
                    eventFloorUnitCost={event_floor_unit_cost}
                    refundableDepositCost={refundable_deposit_cost}
                    dateDiff={date_diff}
                    show_heading={false}
                    styles="text-base"
                />
            </div>
        </div>
    );
};

const Bookings = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const booking_id = params.get("id");

    const { GetUserData, NoData, user_id } = useContext(StdContext);
    const user_data = GetUserData();

    ////////////////////////////////////////////////////////////////////////////////
    // States in this component
    ////////////////////////////////////////////////////////////////////////////////
    const [booking_obj, SetBookingObj] = useState(null);
    const [rejection_reason, SetRejectionReason] = useState("");

    // UI stuff
    const [booking_deletion_in_progress, SetBookingDeletionInProgress] = useState(false);
    const [booking_acceptance_in_progress, SetBookingAcceptanceInProgress] = useState(false);
    const [booking_rejection_in_progress, SetBookingRejectionInProgress] = useState(false);

    const [show_unauthorized_access, SetShowUnauthorizedAccess] = useState(false);
    const [show_delete_confirmation, SetShowDeleteConfirmation] = useState(false);
    const [show_cancel_booking_request, SetShowCancelBookingRequest] = useState(false);
    const [show_accept_booking_request, SetShowAcceptBookingRequest] = useState(false);
    ////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (booking_obj !== null) return;

        const GetBookingDetails = async () => {
            if (NoData()) return;

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
                    console.warn("Preventing unauthorized access");
                    SetShowUnauthorizedAccess(true);
                    setTimeout(() => {
                        navigate(-1);
                    }, 2000);
                }
            } else {
                // TODO: Issue an alert
                console.error("Could not find any booking doc");
            }

            SetBookingObj({});
        };

        GetBookingDetails();
    }, [user_data, user_id]);

    const HandleEditBooking = () => {
        navigate(`/dashboard/bookings/edit_booking?id=${booking_obj.id}`);
    };

    const HandleBookingDeletion = async () => {
        SetBookingDeletionInProgress(true);
        await booking_obj.DeleteDoc();
        setTimeout(() => {
            SetBookingDeletionInProgress(false);
            SetShowDeleteConfirmation(false);
            console.debug("Deleted!");
            navigate("/dashboard/bookings");
        }, 1000);
    };

    const HandleBookingAcceptance = async () => {
        SetBookingAcceptanceInProgress(true);
        await booking_obj.SetBookingStatus(Constants.STATUS_CONFIRMED, user_id);
        await BlockDates(booking_obj.start_date, booking_obj.end_date);
        setTimeout(() => {
            SetBookingAcceptanceInProgress(false);
            SetShowAcceptBookingRequest(false);
            navigate(-1);
        }, 1000);
    };

    const HandleBookingRejection = async () => {
        SetBookingRejectionInProgress(true);
        await booking_obj.SetBookingStatus(Constants.STATUS_REJECTED, user_id, rejection_reason);
        await UnblockDates(booking_obj.start_date, booking_obj.end_date);
        setTimeout(() => {
            SetBookingRejectionInProgress(false);
            SetShowCancelBookingRequest(false);
            navigate(-1);
        }, 1000);
    };

    /* TODO: SHOW REJECTION REASON (in case request has been rejected) */
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
                                <BookingDetails booking={booking_obj} />
                            )}
                        </div>
                        <hr />
                        {booking_obj === null || Object.keys(booking_obj).length === 0 ? null : (
                            <div className="mt-5 flex justify-end">
                                {booking_obj.IsConfirmed() || booking_obj.user_id !== user_id ? null : (
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
                                        {booking_obj.IsRequest() || booking_obj.IsRejected() ? (
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
                                        ) : null}
                                        {(booking_obj.IsRequest() || booking_obj.IsConfirmed()) &&
                                        booking_obj.user_id !== user_id ? (
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
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                Confirm deleting this booking request
                            </h3>
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

            <Modal
                show={show_accept_booking_request}
                size="md"
                popup={true}
                onClose={() => {
                    SetShowAcceptBookingRequest(false);
                }}
            >
                <Modal.Header />
                <Modal.Body>
                    {booking_acceptance_in_progress === false ? (
                        <div className="text-center">
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                Sure you want to accept this booking request?
                            </h3>
                            <div className="flex justify-center gap-4">
                                <Button color="success" onClick={HandleBookingAcceptance}>
                                    Yes, I'm sure
                                </Button>
                                <Button
                                    color="gray"
                                    onClick={() => {
                                        SetShowAcceptBookingRequest(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col text-center">
                            <span className="mb-5 text-lg">Accepting booking request</span>
                            <Spinner color="success" size="xl" />
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            <Modal
                show={show_cancel_booking_request}
                size="md"
                popup={true}
                onClose={() => {
                    SetShowCancelBookingRequest(false);
                }}
            >
                <Modal.Header />
                <Modal.Body>
                    {booking_rejection_in_progress === false ? (
                        <div className="text-center">
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                Sure you want to cancel this booking request?
                            </h3>
                            <div className="flex flex-col">
                                <div className="mb-5">
                                    <Textarea
                                        placeholder="Leave a comment..."
                                        value={rejection_reason}
                                        onChange={e => {
                                            const text = e.target.value;
                                            SetRejectionReason(text);
                                        }}
                                        required={true}
                                        rows={4}
                                    />
                                </div>
                                <div className="flex justify-center gap-4">
                                    <Button
                                        color="failure"
                                        disabled={rejection_reason?.trim()?.length === 0}
                                        onClick={HandleBookingRejection}
                                    >
                                        Yes, cancel
                                    </Button>
                                    <Button
                                        color="gray"
                                        onClick={() => {
                                            SetShowCancelBookingRequest(false);
                                        }}
                                    >
                                        No, don't cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col text-center">
                            <span className="mb-5 text-lg">Cancelling booking request</span>
                            <Spinner color="warning" size="xl" />
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </DashboardLayout>
    );
};

export default Bookings;
