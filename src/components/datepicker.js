import React from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file

export default function Datepicker({ StartDate, SetStartDate, EndDate, SetEndDate }) {
    const HandleDateChange = item => {
        SetStartDate(item.selection?.startDate);
        SetEndDate(item.selection?.endDate);
    };

    return (
        <div>
            <DateRange editableDateInputs={true} onChange={HandleDateChange} moveRangeOnFirstSelection={false} ranges={[{ startDate: StartDate, endDate: EndDate, key: "selection" }]} />
        </div>
    );
}
