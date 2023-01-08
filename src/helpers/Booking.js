import { Timestamp, doc, getFirestore, updateDoc } from "firebase/firestore";
import { Constants } from "./constants";
import { DateToString, DateDiff, IsEqual, UnblockDates, BlockDates } from "./utils";
import { event_types, floor_options } from "./community_hall_rates";
import { Collections } from "./constants";
import { app } from "../config/firebase";

class Booking {
    constructor(user_id, is_block_member, start_date, end_date, event_type, floor_option, status, created_on = new Date(), id = null) {
        this.user_id = user_id;
        this.is_block_member = is_block_member;
        this.start_date = start_date;
        this.end_date = end_date;
        this.event_type = event_type;
        this.floor_option = floor_option;
        this.status = status;
        this.created_on = created_on;
        this.id = id;
    }

    IsRequest() {
        return this.status === Constants.STATUS_REQUEST;
    }

    IsRejected() {
        return this.status === Constants.STATUS_REJECTED;
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
                this.start_date = start_date;
                this.end_date = end_date;
                updates.start_date = start_date;
                updates.end_date = end_date;
            } catch (err) {
                // TODO: Issue an alert
                console.error(err);
                console.error("Could not block/unblock dates");
            }
        }

        if (!this.IsSameEvent(event_type)) {
            this.event_type = event_type;
            updates.event_type = event_type;
        }

        if (!this.IsSameFloorOption(floor_option)) {
            this.floor_option = floor_option;
            updates.floor_option = floor_option;
        }

        if (Object.keys(updates).length > 0) {
            console.warn("Updating document");
            const db = getFirestore(app);
            const booking_requests_ref = doc(db, Collections.BOOKINGS, this.id);
            await updateDoc(booking_requests_ref, updates);
        } else {
            // TODO: Issue an alert
            console.info("Nothing needed to be updated");
        }
    }

    static FirestoreConverter = {
        toFirestore: city => {
            return {
                user_id: city.user_id,
                is_block_member: city.is_block_member,
                start_date: Timestamp.fromDate(city.start_date),
                end_date: Timestamp.fromDate(city.end_date),
                event_type: city.event_type,
                floor_option: city.floor_option,
                status: city.status,
                created_on: Timestamp.fromDate(city.created_on),
            };
        },
        fromFirestore: (snapshot, options) => {
            const data = snapshot.data(options);
            return new Booking(
                data.user_id,
                data.is_block_member,
                data.start_date.toDate(),
                data.end_date.toDate(),
                data.event_type,
                data.floor_option,
                data.status,
                data.created_on.toDate(),
                snapshot.id
            );
        },
    };
}

export default Booking;
