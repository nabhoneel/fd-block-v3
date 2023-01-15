import { Timestamp, getFirestore, doc, setDoc } from "firebase/firestore";

import { Collections } from "./constants";

class User {
    constructor(
        name,
        phone_number,
        address,
        is_member,
        membership_status,
        created_on = new Date(),
        bookings = [],
        id = null
    ) {
        this.name = name;
        this.phone_number = phone_number;
        this.address = address;
        this.is_member = is_member;
        this.membership_status = membership_status;
        this.created_on = created_on;
        this.bookings = bookings;
        this.id = id;
    }

    static FirestoreConverter = {
        toFirestore: user => {
            return {
                name: name,
                phone_number: phone_number,
                address: address,
                is_member: is_member,
                membership_status: membership_status,
                created_on: created_on,
                bookings: bookings,
            };
        },

        fromFirestore: (snapshot, options) => {
            const data = snapshot.data(options);
            return new User(
                data.name,
                data.phone_number,
                data.address,
                data.is_member,
                data.membership_status,
                data.created_on,
                data.bookings,
                snapshot.id
            );
        },
    };

    static WriteNewUser = async user => {
        if (user === null || user.id === null) return;

        const db = getFirestore(app);
        const users_collection = doc(db, Collections.USERS, user.id).withConverter(FirestoreConverter);
        try {
            await setDoc(users_collection, user);
        } catch (err) {
            // TODO: Issue an alert
            console.error(err);
        }
    };
}

export default User;
