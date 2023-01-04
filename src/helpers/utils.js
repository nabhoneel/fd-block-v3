import { Timestamp } from "firebase/firestore";

const DateToString = d => {
    if (d instanceof Timestamp) {
        return DateToString(d.toDate());
    }

    const date = d.getDate().toString();
    const month = (d.getMonth() + 1).toString();
    const date_repr = `${date.padStart(2, "0")}-${month.padStart(2, "0")}-${d.getFullYear()}`;

    return date_repr;
};

const DateDiff = (d1, d2) => {
    if (d1 instanceof Timestamp && d2 instanceof Timestamp) {
        return DateDiff(d1.toDate(), d2.toDate());
    }

    const date_diff = Math.ceil(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24)) + 1;
    return date_diff;
};

export { DateToString, DateDiff };
