import React, { createContext, useState } from "react";

export const StdContext = createContext();

export const StdContextProvider = ({ children }) => {
    const [user_signing_in, SetUserSigningIn] = useState(false); // Possible states: [true, false] (used as a semaphore of sorts)

    // 'user_id' and 'user_phone_number' have the following possible states:
    // 1. null (default)
    // 2. "" (no user logged in)
    // 3. <some ID/phone-number> (user is logged in)
    const [user_id, SetUserId] = useState(null);
    const [user_phone_number, SetUserPhoneNumber] = useState(null);

    // 'user_is_admin' can have the following possible states:
    // 1. null (default)
    // 2. true (admin users have special functions through the webapp)
    // 3. false (standard users)
    const [user_is_admin, SetUserIsAdmin] = useState(null);

    return (
        <StdContext.Provider
            value={{
                user_signing_in,
                SetUserSigningIn: SetUserSigningIn,

                user_id,
                SetUserId: SetUserId,

                user_phone_number,
                SetUserPhoneNumber: SetUserPhoneNumber,
            }}
        >
            {children}
        </StdContext.Provider>
    );
};

export const StdContextConsumer = ({ children }) => {
    return <StdContext.Consumer>{children}</StdContext.Consumer>;
};
