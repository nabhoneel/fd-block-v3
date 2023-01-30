import { Timestamp, getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

import { app } from "../config/firebase";
import { Collections, DocNames } from "../helpers/constants";

const MoneyFormat = s => {
    let amount = `${s}`;
    let formatted_string = amount.slice(-3);
    amount = amount.slice(0, -3);
    while (amount?.length > 0) {
        formatted_string = amount.slice(-2) + "," + formatted_string;
        amount = amount.slice(0, -2);
    }

    return `₹${formatted_string}`;
};

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

const GetSetOfDates = (d1, d2) => {
    const start_date = d1 <= d2 ? d1 : d2;
    const end_date = start_date === d1 ? d2 : d1;
    let runner = new Date(start_date);
    let set_of_dates = new Set();
    while (runner <= end_date) {
        const epoch = Math.ceil(runner.getTime());
        console.debug(`${epoch} -> ${runner}`);
        set_of_dates.add(epoch);
        runner.setDate(runner.getDate() + 1);
    }

    return set_of_dates;
};

const IsEqual = (a, b) => {
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }
};

const BlockDates = async (start_date, end_date) => {
    const prev_blocked_dates = new Set();
    const db = getFirestore(app);
    const bd = doc(db, Collections.SYSTEM, DocNames.BLOCKED_DATES);
    const bd_doc = await getDoc(bd);
    if (bd_doc.exists()) {
        const data = bd_doc.data();
        const dates = data ? data["dates"] : [];
        dates.forEach(d => prev_blocked_dates.add(d));
    } else {
        console.warn("Creating new blocked dates document");
        setDoc(bd, { dates: [] });
    }

    console.info(`Blocking ${start_date} to ${end_date}`);
    let add_dates = new Set(prev_blocked_dates);
    const dates_to_be_blocked = GetSetOfDates(start_date, end_date);
    dates_to_be_blocked.forEach(d => add_dates.add(d));

    if (add_dates.size === prev_blocked_dates.size) {
        console.warn("No new dates were blocked");
        return;
    }

    let ret_val = false;
    try {
        await updateDoc(bd, {
            dates: arrayUnion(...add_dates),
        });

        ret_val = true;
    } catch (err) {
        console.error("Could not block dates");
        console.error(err);
    }

    return ret_val;
};

const UnblockDates = async (start_date, end_date) => {
    console.info(`Unblocking ${start_date} to ${end_date}`);
    let remove_dates = GetSetOfDates(start_date, end_date);
    let ret_val = false;
    try {
        const db = getFirestore(app);
        const bd = doc(db, Collections.SYSTEM, DocNames.BLOCKED_DATES);
        await updateDoc(bd, {
            dates: arrayRemove(...remove_dates),
        });

        ret_val = true;
    } catch (err) {
        console.error("Could not unblock dates");
        console.error(err);
    }

    return ret_val;
};

export { MoneyFormat, DateToString, DateDiff, GetSetOfDates, IsEqual, UnblockDates, BlockDates };
