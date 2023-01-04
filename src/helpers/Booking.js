import { Timestamp } from "firebase/firestore";
import { Constants } from "./constants";
import { DateToString, DateDiff } from "./utils";
import { event_types, floor_options } from "./community_hall_rates";

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

        const today = new Date();
        if (today <= this.end_date) return "Upcoming";

        return "Past";
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
