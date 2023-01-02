import React, { useContext } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file

import { StdContext } from "../context/StdContext";

export default function Datepicker({ StartDate, SetStartDate, EndDate, SetEndDate }) {
    const HandleDateChange = item => {
        SetStartDate(item.selection?.startDate);
        SetEndDate(item.selection?.endDate);
    };

    const today = new Date();
    const { blocked_dates } = useContext(StdContext);
    return (
        <div>
            <DateRange
                editableDateInputs={true}
                minDate={today}
                onChange={HandleDateChange}
                moveRangeOnFirstSelection={false}
                ranges={[{ startDate: StartDate, endDate: EndDate, key: "selection" }]}
                disabledDates={blocked_dates}
            />
        </div>
    );
}
