// Front end
import React, { createContext, useState, useEffect } from "react";

// Firebase
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDoc, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

// Internal
import { app } from "../config/firebase";

export const StdContext = createContext();

export const StdContextProvider = ({ children }) => {
    const ProcessUserData = d => {
        delete d.bookings;
        delete d.membershipStatus;
        return d;
    };

    const PopulateUserDataFromFirestore = async () => {
        const db = getFirestore(app);
        try {
            const user_ref = doc(db, "users", user_id);
            const user_doc = await getDoc(user_ref);
            if (user_doc.exists()) {
                const d = user_doc.data();
                const processed_data = ProcessUserData(d);
                SetUserDataFromFirebase(processed_data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const [user_signing_in, SetUserSigningIn] = useState(false); // Possible states: [true, false] (used as a semaphore of sorts)

    // 'user_id' and 'user_phone_number' have the following possible states:
    // 1. null (default)
    // 2. "" (no user logged in)
    // 3. <some ID/phone-number> (user is logged in)
    const [user_id, SetUserId] = useState(null);
    const [user_phone_number, SetUserPhoneNumber] = useState(null);
    const [user_data, SetUserData] = useState(null);
    const [user_data_from_firebase, SetUserDataFromFirebase] = useState(null);

    // 'user_is_admin' can have the following possible states:
    // 1. null (default)
    // 2. true (admin users have special functions through the webapp)
    // 3. false (standard users)
    // const [user_is_admin, SetUserIsAdmin] = useState(null);

    // Cache the user's phone number and other data into StdContext
    const auth = getAuth(app);
    useEffect(() => {
        let unsubscribe;
        const GetUserState = async () =>
            auth.onAuthStateChanged(async user => {
                if (user_signing_in) return;

                if (user) {
                    SetUserPhoneNumber(user.phoneNumber);
                    SetUserId(user.uid);
                    if (user_data !== null) {
                        return;
                    }

                    // If the user's data is NOT cached in the local storage, we need to fetch it and set it
                    const db = getFirestore(app);
                    const users_collection = collection(db, "users");
                    const q = query(users_collection, where("phoneNumber", "==", user_phone_number));
                    const snapshots = await getDocs(q);
                    let replace_doc_id = null;
                    let existing_doc_data = null;
                    snapshots.forEach(doc => {
                        console.warn("Querying data");
                        SetUserDataFromFirebase(doc.data());
                        if (doc.id === user_id) return;

                        // It will be ensured that the document's ID in the "users" collection will always be
                        // a Firebase generated user ID. In other cases (pre-filled docs, etc), we will fetch
                        // the existing doc's data, create a new doc with the doc ID set to the user ID, and
                        // remove the existing doc.
                        replace_doc_id = doc.id;
                        existing_doc_data = doc.data();
                    });

                    // This will be a one time operation for preloaded user info
                    if (replace_doc_id !== null) {
                        try {
                            await setDoc(doc(db, "users", user_id), existing_doc_data);
                            await deleteDoc(doc(db, "users", replace_doc_id));
                        } catch (err) {
                            console.error("Could not update existing user doc");
                            console.log(err);
                        }
                    }
                } else {
                    SetUserPhoneNumber("");
                    SetUserId("");
                }
            });

        GetUserState();
        return unsubscribe;
    });

    useEffect(() => {
        // Obtain the cached data in local storage (if available) and set it on StdContext.
        // The user's phone number and ID are obtained from the auth-flow in Firebase.
        // The complete data can be obtained only from Firestore. To prevent multiple db reads,
        // we will cache the data into local storage. When the user has signed in, and the
        // local storage is not yet populated, a query will be executed to fetch the data
        // and store it into 'user_data_from_firebase' (via SetUserDataFromFirebase).
        // Once 'user_data_from_firebase' has been populated, useEffect will get triggered,
        // which will lead to the population of local storage.
        // Reading the data from Firestore can get very expensive since this context (StdContext)
        // wraps around the entire web-app and will be triggered on every page reload.
        if (user_data_from_firebase !== null) {
            localStorage.setItem("user_data", JSON.stringify(user_data_from_firebase));
        }

        const ud = localStorage.getItem("user_data");
        const ud_parsed = ud !== null ? JSON.parse(ud) : null;
        SetUserData(ud_parsed);
    }, [user_data_from_firebase]);

    const IsSignedIn = () => {
        return user_id !== null && user_id.length > 0;
    };

    const HandleGetUserData = () => {
        if (!IsSignedIn()) return;

        if (user_data === null) {
            const local_storage_data = localStorage.getItem("user_data");
            if (local_storage_data === null) {
                PopulateUserDataFromFirestore();
            }
        }

        return user_data;
    };

    const HandleSignOut = v => {
        localStorage.setItem("user_data", null); // Invalidate the cached user data
        localStorage.clear(); // TODO: Maybe should not be so brute force?
        auth.signOut();
    };

    return (
        <StdContext.Provider
            value={{
                user_signing_in,
                SetUserSigningIn: SetUserSigningIn,

                user_id,
                user_phone_number,
                GetUserData: HandleGetUserData,
                NoData: () => user_id === null,
                SignedIn: IsSignedIn,
                SignOut: HandleSignOut,
            }}
        >
            {children}
        </StdContext.Provider>
    );
};

export const StdContextConsumer = ({ children }) => {
    return <StdContext.Consumer>{children}</StdContext.Consumer>;
};
