import React from "react";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import "./datepicker.css";

export default function Datepicker({ onChange, value }) {
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
