import React, { useState } from "react";
// import DatePicker from "react-date-picker";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import "./datepicker.css";

export default function Datepicker() {
    const [value, onChange] = useState([new Date(), new Date()]);

    return (
        <div>
            <DateRangePicker
                closeCalendar={false}
                isOpen={true}
                onChange={onChange}
                value={value}
                selectRange={true}
                showDoubleView={true}
                allowPartialRange={true}
            />
        </div>
    );
}
