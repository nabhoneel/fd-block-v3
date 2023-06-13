import {
    Timestamp,
    collection,
    doc,
    getFirestore,
    updateDoc,
    arrayUnion,
    writeBatch,
    runTransaction,
    arrayRemove,
} from "firebase/firestore";

import { Constants, DocNames } from "./constants";
import { DateToString, DateDiff, IsEqual, UnblockDates, BlockDates } from "./utils";
import { event_types, floor_options } from "./community_hall_rates";
import { Collections } from "./constants";
import { app } from "../config/firebase";

class Booking {
    static REJECTION_REASON_KEY = "rejection_reason";

    constructor(
        user_id,
        booking_reference_id,
        is_block_member,
        start_date,
        end_date,
        event_type,
        floor_option,
        status,
        created_on = new Date(),
        modified_by = [],
        comments = {},
        id = null
    ) {
        this.user_id = user_id;
        this.booking_reference_id = booking_reference_id;
        this.is_block_member = is_block_member;
        this.start_date = start_date;
        this.end_date = end_date;
        this.event_type = event_type;
        this.floor_option = floor_option;
        this.status = status;
        this.created_on = created_on;
        this.id = id;
        this.modified_by = modified_by;
        this.comments = comments;
    }

    GetEventType() {
        return this.event_type;
    }

    GetFloorOption() {
        return this.floor_option;
    }

    IsRequest() {
        return this.status === Constants.STATUS_REQUEST;
    }

    IsRejected() {
        return this.status === Constants.STATUS_REJECTED;
    }

    IsConfirmed() {
        return this.status === Constants.STATUS_CONFIRMED;
    }

    IsUpcoming() {
        const today = new Date();
        return today <= this.end_date;
    }

    IsPast() {
        return !this.IsUpcoming();
    }

    GetStartDateString() {
        return DateToString(this.start_date);
    }

    GetDuration() {
        return DateDiff(this.start_date, this.end_date);
    }

    GetEventString() {
        return event_types[this.event_type];
    }

    GetFloorOptionString() {
        return floor_options[this.event_type][this.floor_option];
    }

    GetBookingCode() {
        return this.booking_reference_id;
    }

    GetStatusString() {
        if (this.IsRequest()) return "Request";
        if (this.IsRejected()) return "Rejected";

        const today = new Date();
        if (today <= this.end_date) return "Upcoming";

        return "Past";
    }

    IsSameStartDate(d) {
        if (!(d instanceof Date)) return false;
        return IsEqual(d, this.start_date);
    }

    IsSameEndDate(d) {
        if (!(d instanceof Date)) return false;
        return IsEqual(d, this.end_date);
    }

    IsSameEvent(e) {
        return e === this.event_type;
    }

    IsSameFloorOption(f) {
        return f === this.floor_option;
    }

    static async CreateDoc({
        user_id,
        is_block_member,
        start_date,
        end_date,
        event_type,
        floor_option,
        status = Constants.STATUS_REQUEST,
    }) {
        const db = getFirestore(app);
        try {
            // TODO: Blocking of dates can be merged into a transaction/batched-write with other related operations
            // Step 1: Block this range of dates in the system collection (this will also check whether they can be blocked)
            const blocking_status = await BlockDates(start_date, end_date);
            if (blocking_status) {
                const bookings_collection = collection(db, Collections.BOOKINGS);
                const booking_request_ref = doc(bookings_collection).withConverter(this.FirestoreConverter);
                const counters_ref = doc(db, Collections.SYSTEM, DocNames.COUNTERS);
                const user_ref = doc(db, Collections.USERS, user_id);
                await runTransaction(db, async transaction => {
                    const counters_doc = await transaction.get(counters_ref);
                    if (!counters_doc.exists()) {
                        console.error("Counters document does not exist!");
                        return;
                    }

                    // We need to obtain the latest counter value of each respective booking code ("MA", "MFT", etc)
                    // and then increase it by 1. This value will be used as a part of the booking reference ID
                    const counter = counters_doc.data()["bookings"] + 1;
                    transaction.update(counters_ref, { ["bookings"]: counter });

                    const booking_data = new Booking(
                        user_id,
                        "BOOK" + counter.toString().padStart(5, "0"),
                        is_block_member,
                        start_date,
                        end_date,
                        event_type,
                        floor_option,
                        status
                    );

                    // Step 2: Create the booking request
                    await transaction.set(booking_request_ref, booking_data);

                    // Step 3: Add the booking request to the user's document
                    await transaction.update(user_ref, { bookings: arrayUnion(booking_request_ref) });
                });

                return booking_request_ref.id;
            }
        } catch (err) {
            await UnblockDates(start_date, end_date);
            console.error(err);
        }

        return null;
    }

    async UpdateDoc({ start_date, end_date, event_type, floor_option }) {
        if (this.id === null) {
            console.error("Cannot update document without ID");
            return;
        }

        let updates = {};
        if (this.IsSameStartDate(start_date) && this.IsSameEndDate(end_date)) {
            // No need to Unblock/Block dates
        } else {
            // TODO: optimize this: add conditions for just blocking/unblocking dates (and not both the operations every time)
            try {
                await UnblockDates(this.start_date, this.end_date);
                await BlockDates(start_date, end_date);
                updates.start_date = start_date;
                updates.end_date = end_date;
            } catch (err) {
                // TODO: Issue an alert
                console.error(err);
                console.error("Could not block/unblock dates");
            }
        }

        if (!this.IsSameEvent(event_type)) {
            updates.event_type = event_type;
        }

        if (!this.IsSameFloorOption(floor_option)) {
            updates.floor_option = floor_option;
        }

        if (Object.keys(updates).length > 0) {
            console.warn("Updating document");
            const db = getFirestore(app);
            try {
                await runTransaction(db, async transaction => {
                    const booking_requests_ref = doc(db, Collections.BOOKINGS, this.id);
                    await transaction.update(booking_requests_ref, updates);
                });

                for (const key in Object.keys(updates)) {
                    this[key] = updates[key];
                }
            } catch (err) {
                console.error("Could not update booking");
                console.error(err);
            }
        } else {
            // TODO: Issue an alert
            console.info("Nothing needed to be updated");
        }
    }

    async DeleteDoc() {
        const start_date = this.start_date;
        const end_date = this.end_date;
        const db = getFirestore(app);
        const booking_ref = doc(db, Collections.BOOKINGS, this.id);
        const user_ref = doc(db, Collections.USERS, this.user_id);
        const batch = writeBatch(db);

        // Step 1: Remove booking reference from user's document
        batch.update(user_ref, {
            bookings: arrayRemove(booking_ref),
        });

        // Step 2: Delete the booking document
        batch.delete(booking_ref);

        await batch.commit();

        UnblockDates(start_date, end_date);
    }

    async SetBookingStatus(status, modifier_id, comments = "") {
        const db = getFirestore(app);
        const booking_requests_ref = doc(db, Collections.BOOKINGS, this.id);
        const modifier_ref = doc(db, Collections.USERS, modifier_id);
        let updated_doc = {
            status: status,
            modified_by: arrayUnion({
                modifier: modifier_ref,
                status: status,
                timestamp: Timestamp.fromDate(new Date()),
            }),
        };

        if (status === Constants.STATUS_REJECTED) {
            updated_doc.comments = { ...this.comments, rejection_reason: comments };
        }

        await updateDoc(booking_requests_ref, updated_doc);
    }

    static FirestoreConverter = {
        toFirestore: booking => {
            return {
                user_id: booking.user_id,
                booking_reference_id: booking.booking_reference_id,
                is_block_member: booking.is_block_member,
                start_date: Timestamp.fromDate(booking.start_date),
                end_date: Timestamp.fromDate(booking.end_date),
                event_type: booking.event_type,
                floor_option: booking.floor_option,
                status: booking.status,
                created_on: Timestamp.fromDate(booking.created_on),
                modified_by: booking.modified_by?.map(m => ({
                    modifier: m.modifier,
                    status: m.status,
                    timestamp: m.toDate(),
                })),
                comments: booking.comments,
            };
        },

        fromFirestore: (snapshot, options) => {
            const data = snapshot.data(options);
            return new Booking(
                data.user_id,
                data.booking_reference_id,
                data.is_block_member,
                data.start_date.toDate(),
                data.end_date.toDate(),
                data.event_type,
                data.floor_option,
                data.status,
                data.created_on.toDate(),
                data.modified_by,
                data.comments === undefined ? {} : data.comments,
                snapshot.id
            );
        },
    };
}

export default Booking;
