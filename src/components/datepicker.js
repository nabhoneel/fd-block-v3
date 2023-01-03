import React, { useContext, useState, useEffect } from "react";
import { Spinner } from "flowbite-react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file

import { StdContext } from "../context/StdContext";

export default function Datepicker({ StartDate, SetStartDate, EndDate, SetEndDate }) {
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
    const { blocked_dates } = useContext(StdContext);
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
