import {
    Timestamp,
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    writeBatch,
} from "firebase/firestore";

import { app } from "../config/firebase";
import { Collections } from "./constants";

class User {
    static LOCAL_STORAGE_USER_ITEM = "user_data";

    static IsLocalStorageUpdated = user_id => {
        const local_data = localStorage.getItem(this.LOCAL_STORAGE_USER_ITEM);
        if (local_data?.id === user_id) return true;
        return false;
    };

    static GetUserObj = user_data => {
        if (!user_data) return null;

        const user = {
            name: user_data?.name,
            phone_number: user_data?.phone_number,
            address: user_data?.address,
            is_member: user_data?.is_member,
            membership_status: user_data?.membership_status,
            created_on: user_data?.created_on,
            id: user_data?.id,
        };

        return user;
    };

    static RestoreFromLocalStorage = () => {
        const local_data = localStorage.getItem(this.LOCAL_STORAGE_USER_ITEM);
        if (local_data) return this.GetUserObj(JSON.parse(local_data));
        return null;
    };

    static UpdateLocalStorage = user_data => {
        this.ClearLocalStorage();
        const local_data = this.GetUserObj(user_data);
        if (local_data) localStorage.setItem(this.LOCAL_STORAGE_USER_ITEM, JSON.stringify(local_data));
    };

    static ClearLocalStorage = () => {
        localStorage.removeItem(this.LOCAL_STORAGE_USER_ITEM);
    };

    static GetDataFromFirestore = async user_id => {
        if (!user_id) return null;

        const db = getFirestore(app);
        try {
            const user_ref = doc(db, Collections.USERS, user_id);
            const user_doc = await getDoc(user_ref);
            if (user_doc.exists()) {
                const d = user_doc.data();
                return this.GetUserObj(d);
            }
        } catch (err) {
            console.error(err);
        }

        return null;
    };

    static FindExistingUserOrCreateNew = async (user_id, user_phone_number) => {
        if (!user_id) return {};

        const db = getFirestore(app);
        const users_collection = collection(db, Collections.USERS);
        const q = query(users_collection, where("phone_number", "==", user_phone_number));
        const snapshots = await getDocs(q);
        if (snapshots.empty) {
            console.debug("Creating new user");
            // Create a standard user document
            const new_user = {
                name: "",
                phone_number: user_phone_number,
                address: "" /* address */,
                is_member: false,
                membership_status: false,
                created_on: new Date(),
                bookings: [],
                id: user_id,
            };

            const db = getFirestore(app);
            const users_collection = doc(db, Collections.USERS, new_user.id);
            try {
                await setDoc(users_collection, new_user);
                return new_user;
            } catch (err) {
                // TODO: Issue an alert
                console.error(err);
            }

            return {};
        }

        // This person's entry might have been inserted into the users collection by an administrator,
        // in the form of a general document (document's ID does not match with the user's ID). In such
        // a case, we have to set the user's document ID to the user ID.
        let user_doc_id = null;
        let user_doc_data = null;
        snapshots.forEach(doc => {
            console.warn("Querying data");
            if (doc.id === user_id) {
                console.error("ASSERT");
                return {};
            }

            // It will be ensured that the document's ID in the "users" collection will always be
            // a Firebase generated user ID. In other cases (pre-filled docs, etc), we will fetch
            // the existing doc's data, create a new doc with the doc ID set to the user ID, and
            // remove the existing doc.
            user_doc_id = doc.id;
            user_doc_data = doc.data();
        });

        // This will be a one time operation for preloaded user info ; this needs to be an atomic operation
        if (user_doc_id !== null) {
            try {
                const batch = writeBatch(db);
                const old_user_doc = doc(db, Collections.USERS, user_doc_id);
                const new_user_doc = doc(db, Collections.USERS, user_id);
                batch.set(new_user_doc, user_doc_data);
                batch.delete(old_user_doc);
                await batch.commit();
                return this.GetUserObj(user_doc_data);
            } catch (err) {
                console.error("Could not update existing user doc");
                console.log(err);
            }
        }

        return {};
    };
}

export default User;
