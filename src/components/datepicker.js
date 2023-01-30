import React, { useState, useEffect } from "react";
import { Spinner } from "flowbite-react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file

import { getFirestore, getDoc, doc } from "firebase/firestore";

// Internal
import { app } from "../config/firebase";
import { Collections, DocNames } from "../helpers/constants";

export default function Datepicker({ StartDate, SetStartDate, EndDate, SetEndDate, unblockedSetOfDates = null }) {
    const [blocked_dates, SetBlockedDates] = useState(null);
    const [local_state, SetLocalState] = useState([
        {
            startDate: StartDate,
            endDate: EndDate,
            key: "selection",
        },
    ]);

    useEffect(() => {
        SetStartDate(local_state[0]["startDate"]);
        SetEndDate(local_state[0]["endDate"]);
    }, [local_state]);

    const today = new Date();
    const unblock = unblockedSetOfDates !== null ? new Set([...unblockedSetOfDates]) : new Set();

    useEffect(() => {
        const GetBlockedDates = async () => {
            const db = getFirestore(app);
            const bd = doc(db, Collections.SYSTEM, DocNames.BLOCKED_DATES);
            const snap = await getDoc(bd);
            console.warn("Querying data");
            if (snap.exists()) {
                const data = snap.data();
                const dates = data ? data["dates"] : [];
                const filtered_dates = unblock.length === 0 ? dates : dates.filter(d => !unblock.has(d));
                const date_timestamps = filtered_dates.map(d => new Date(d));
                SetBlockedDates(date_timestamps);
            } else {
                SetBlockedDates([]);
            }
        };

        if (blocked_dates === null) GetBlockedDates();
    }, [unblockedSetOfDates]);

    if (blocked_dates === null) {
        return <Spinner />;
    } else {
        // For some reason, tightly binding 'onChange' and 'ranges' props of DateRange with the props of THIS
        // component fixed the DateRange view in place (months/years couldn't be changed). The combination of
        // local_state and using its changes to modify the state of the parent component addresses that.
        return (
            <div>
                <DateRange
                    editableDateInputs={true}
                    minDate={today}
                    onChange={item => SetLocalState([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={local_state}
                    disabledDates={blocked_dates}
                />
            </div>
        );
    }
}
