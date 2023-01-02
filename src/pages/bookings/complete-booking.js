// Front end
import React, { useState, Suspense, useContext, useEffect } from "react";
import { useLocation } from "@reach/router";
import { navigate } from "gatsby";
import { Button, Modal, Card, Select, Spinner, Table } from "flowbite-react";

// Firebase
import { Timestamp, arrayUnion, getFirestore, collection, doc, addDoc, updateDoc } from "firebase/firestore";

// Internal UI components
import LoadingCenterSpinnger from "../../components/loading-center";
import DashboardLayout from "../../components/dashboard-layout";
import Datepicker from "../../components/datepicker";

// Internal data utils
import { event_types, floor_options, cost_table } from "../../assets/data/community_hall_rates.js";
import { StdContext } from "../../context/StdContext";
import { app } from "../../config/firebase";

const CompleteBooking = () => {
    const { BlockDates, NoData, SignedIn, user_data, user_id } = useContext(StdContext);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const sd = params.get("sd");
    const ed = params.get("ed");

    ////////////////////////////////////////////////////////////////////////////////
    // Utility functions
    ////////////////////////////////////////////////////////////////////////////////
    const CreateOptions = obj => {
        const options = [];
        for (const [k, v] of Object.entries(obj)) {
            options.push(
                <option key={k} value={k}>
                    {v}
                </option>
            );
        }

        return options;
    };

    const MoneyFormat = s => {
        let amount = `${s}`;
        let formatted_string = amount.slice(-3);
        amount = amount.slice(0, -3);
        while (amount?.length > 0) {
            formatted_string = amount.slice(-2) + "," + formatted_string;
            amount = amount.slice(0, -2);
        }

        return `₹${formatted_string}`;
    };
    ////////////////////////////////////////////////////////////////////////////////

    const [start_date, SetStartDate] = useState(new Date(parseInt(sd)));
    const [end_date, SetEndDate] = useState(new Date(parseInt(ed)));
    const [event, SetEvent] = useState(Object.keys(event_types)[0]);
    const [floor, SetFloor] = useState(Object.keys(floor_options[event])[0]);
    const [show_modal, SetShowModal] = useState(false);
    const [request_handle_in_process, SetRequestHandleInProcess] = useState(false);

    const event_types_element = CreateOptions(event_types);
    const [floor_options_element, SetFloorOptionsElement] = useState(CreateOptions(floor_options[event]));

    ////////////////////////////////////////////////////////////////////////////////
    // Event handlers
    ////////////////////////////////////////////////////////////////////////////////
    const HandleEventTypeChange = e => {
        const event_type = e.target.value;
        SetEvent(event_type);

        // This is messy: FIRST: we have to reset the list of options ; THEN: we have to repopulate it with the respective options.
        // Otherwise, the floor-option which was chosen for the previous event-type might stay selected for the newly selected event-type,
        // even though the internal value of the floor-option has been reset to the first available one (by state changes).
        SetFloorOptionsElement(<option aria-label="no-option"></option>);
    };

    const HandleFloorChange = e => {
        const floor = e.target.value;
        SetFloor(floor);
    };

    const HandleProceed = async e => {
        SetRequestHandleInProcess(true);
        const db = getFirestore(app);
        const booking_requests_collection = collection(db, "booking_requests");
        const booking_data = {
            user_id: user_id,
            is_block_member: user_data && user_data["isMember"] === true,
            booking_range: { start_date: Timestamp.fromDate(start_date), end_date: Timestamp.fromDate(end_date) },
            event: event,
            floor: floor,
        };

        try {
            // Step 1: Block this range of dates in the system collection (this will also check whether they can be blocked)
            const status = BlockDates(start_date, end_date);
            if (status) {
                // Step 2: Create the booking request
                const booking_request_ref = await addDoc(booking_requests_collection, booking_data);

                // Step 3: Add the booking request to the user's document
                const user_doc = doc(db, "users", user_id);
                await updateDoc(user_doc, {
                    booking_requests: arrayUnion(booking_request_ref),
                });

                setTimeout(() => {
                    SetRequestHandleInProcess(false);
                    SetShowModal(false);
                    const booking_id = booking_request_ref.id;
                    navigate(`/dashboard/bookings/new_booking?request_id=${booking_id}`);
                }, 1000);
            }
        } catch (err) {
            // TODO: Issue an alert
            console.error("Could not create booking");
            console.error(err);
        }
    };
    ////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        SetFloor(Object.keys(floor_options[event])[0]);
    }, [event]);

    useEffect(() => {
        SetFloorOptionsElement(CreateOptions(floor_options[event])); // Do not use 'event', it might not have been modified yet
    }, [event, floor]);

    // Calculate the number of days to be booked:
    const diff = Math.abs(start_date - end_date);
    const date_diff = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;

    // Costs are different for block-residents and non-residents, for which we first have to determine what kind of user we are dealing with
    const resident = user_data && user_data["isMember"] === true ? "residents" : "non_residents";

    // Fetch data from the cost table
    const event_floor_unit_cost = cost_table[resident][event][floor];
    const refundable_deposit_cost = cost_table[resident][event]["security_deposit"];

    if (NoData()) {
        // When the user's logged in state is yet to be determined, show a loading animation
        return <LoadingCenterSpinnger />;
    }

    if (!SignedIn()) {
        // Display a redirecting message and navigate on timeout
        navigate("/bookings");
    }

    return (
        <DashboardLayout showSidebar={false} enableBackgroundPattern={true}>
            <div className="text-4xl text-center mb-10">Complete your booking</div>
            <Card>
                <div className="flex flex-col mt-7">
                    {/***** End of calendar and billing details *****/}
                    <div className="flex justify-evenly">
                        <Suspense fallback={<Spinner color="success" aria-label="Success spinner example" />}>
                            <Datepicker StartDate={start_date} SetStartDate={SetStartDate} EndDate={end_date} SetEndDate={SetEndDate} />
                        </Suspense>
                        <div>
                            {/***** Event type dropdown menu *****/}
                            <div className="mb-2 block">
                                <span className="text-xl">Purpose of booking</span>
                            </div>
                            <div className="mt-3">
                                <Select onChange={HandleEventTypeChange} id="event-type" required={true}>
                                    {event_types_element}
                                </Select>
                            </div>
                            {/***** End of event type dropdown menu *****/}

                            {/***** Floor dropdown menu *****/}
                            <div className="mb-2 block mt-7">
                                <span className="text-xl">Number of floors</span>
                            </div>
                            <div className="mt-3">
                                <Select onChange={HandleFloorChange} required={true}>
                                    {floor_options_element}
                                </Select>
                            </div>
                            {/***** End of floor dropdown menu *****/}

                            {/***** Price summary *****/}
                            <div className="mb-2 block mt-7">
                                <span className="text-xl">Summary</span>
                            </div>
                            <div className="mt-5">
                                <Table>
                                    <Table.Body className="divide-y text-black text-base">
                                        <Table.Row className="">
                                            <Table.Cell>Cost</Table.Cell>
                                            <Table.Cell>
                                                {MoneyFormat(event_floor_unit_cost)} &times; {date_diff} day{date_diff > 1 ? "s" : ""}
                                            </Table.Cell>
                                            <Table.Cell>{MoneyFormat(event_floor_unit_cost * date_diff)}</Table.Cell>
                                        </Table.Row>
                                        <Table.Row className="">
                                            <Table.Cell>Refundable deposit</Table.Cell>
                                            <Table.Cell></Table.Cell>
                                            <Table.Cell>{MoneyFormat(refundable_deposit_cost)}</Table.Cell>
                                        </Table.Row>
                                        <Table.Row className="">
                                            <Table.Cell>Total</Table.Cell>
                                            <Table.Cell></Table.Cell>
                                            <Table.Cell>{MoneyFormat(event_floor_unit_cost * date_diff + refundable_deposit_cost)}</Table.Cell>
                                        </Table.Row>
                                    </Table.Body>
                                </Table>
                            </div>
                            {/***** End of price summary *****/}

                            {/***** Proceed button *****/}
                            <div className="mt-7 flex">
                                <div className="ml-auto">
                                    <Button
                                        onClick={() => {
                                            SetShowModal(true);
                                        }}
                                    >
                                        Request to reserve
                                    </Button>
                                </div>
                            </div>
                            {/***** End of proceed button *****/}
                        </div>
                    </div>
                    {/***** End of calendar and billing details *****/}

                    {/***** Cancellation and security deposite details *****/}
                    <span className="mt-14">
                        <hr />
                    </span>
                    <div className="flex justify-evenly mt-14 mb-7">
                        <div className="text-slate-500">
                            <h5 className="text-lg font-semibold">Cancellation Policy</h5>
                            <ul className="list-none mt-5">
                                <li>Prior to three days before event: 75% of the cost</li>
                                <li>One to three days before event: 50% of the cost</li>
                                <li>On the day of the event: ₹0 will be refunded</li>
                                <li>Nothing will be deducted from the security deposit</li>
                            </ul>
                        </div>
                        <div className="text-slate-500">
                            <h5 className="text-lg font-semibold">Security Deposit</h5>
                            <ul className="list-none mt-5">
                                <li>Electricity consumption will be deducted</li>
                                <li>Lift usage cost will be deducted (₹500 per every 12 hours)</li>
                                <li>Note: A lift operator will be provided</li>
                            </ul>
                        </div>
                    </div>
                    {/***** End of cancellation and security deposite details *****/}
                </div>
            </Card>
            <Modal
                show={show_modal}
                size="md"
                popup={true}
                disabled={request_handle_in_process}
                onClose={() => {
                    SetShowModal(false);
                }}
            >
                <Modal.Header />
                <Modal.Body>
                    {request_handle_in_process === false ? (
                        <div className="text-center">
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Confirm this booking request?</h3>
                            <div className="flex justify-center gap-4">
                                <Button color="success" onClick={HandleProceed}>
                                    Yes, I'm sure
                                </Button>
                                <Button
                                    color="gray"
                                    onClick={() => {
                                        SetShowModal(false);
                                    }}
                                >
                                    No, cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col text-center">
                            <span className="mb-5 text-lg">Creating booking request</span>
                            <Spinner size="xl" />
                        </div>
                    )}
                    <div className="text-slate-500 mt-10">
                        <hr />
                        <h5 className="text-base font-semibold mt-5 text-left">Note</h5>
                        <ul className="list-none text-sm mt-2 text-left">
                            <li>This request will be notified to the block committee.</li>
                            <li>Once they approve this booking, payment options will be presented which when completed will confirm these dates to your name.</li>
                        </ul>
                    </div>
                </Modal.Body>
            </Modal>
        </DashboardLayout>
    );
};

export default CompleteBooking;
