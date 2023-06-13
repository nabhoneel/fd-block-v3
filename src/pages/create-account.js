import React, { useContext, useState } from "react";
import { navigate } from "gatsby";
import { Button, Card, Label, TextInput, ToggleSwitch } from "flowbite-react";

import Layout from "../components/layout";

import { StdContext } from "../context/StdContext";
import User from "../helpers/User";

const CreateAccount = () => {
    const { GetUserData, UpdateUserData } = useContext(StdContext);
    const user_data = GetUserData();

    // const [email, SetEmail] = useState(""); // TODO: Future stuff
    const [name, SetName] = useState(user_data[User.KEY_NAME]);
    const [is_resident, SetIsResident] = useState(false);
    const [address, SetAddress] = useState("");
    const [address2, SetAddress2] = useState("");

    const SubmitDetails = async event => {
        const address = is_resident || !(address2.length > 0) ? address : address + " | " + address2;

        try {
            await User.Update(
                user_data[User.KEY_ID],
                {
                    [User.KEY_NAME]: name,
                    [User.KEY_ADDRESS]: address,
                    [User.KEY_IS_MEMBER]: is_resident,
                },
                true /* verify before giving residency status */
            );

            await UpdateUserData(true /* force */);
            navigate("/dashboard/profile");
        } catch (err) {
            // TODO: Issue an alert
            console.error("Could not update user account");
        }
    };

    return (
        <Layout>
            <div className="my-10 max-w-lg mx-auto">
                <Card>
                    {user_data ? (
                        <div className="flex flex-col max-w-lg">
                            <span className="pl-2 text-2xl mb-5">Create your basic profile</span>
                            <div className="px-5">
                                <div className="mt-2">
                                    <TextInput
                                        id="phone-number"
                                        value={user_data[User.KEY_PHONE_NUM]}
                                        type="tel"
                                        required={true}
                                        disabled={true}
                                    />
                                </div>
                            </div>
                            <div className="px-5">
                                <div className="mt-2">
                                    <TextInput
                                        value={name}
                                        onChange={event => {
                                            SetName(event.target.value);
                                        }}
                                        placeholder="full name"
                                        type="text"
                                        required={true}
                                    />
                                </div>
                            </div>
                            <div className="px-5">
                                <div className="mt-2">
                                    {is_resident ? (
                                        <TextInput
                                            value={address}
                                            onChange={event => {
                                                SetAddress(event.target.value);
                                            }}
                                            placeholder="plot number (FD 400/5)"
                                            type="text"
                                            required={true}
                                        />
                                    ) : (
                                        <>
                                            <TextInput
                                                value={address}
                                                onChange={event => {
                                                    SetAddress(event.target.value);
                                                }}
                                                placeholder="address line 1"
                                                type="text"
                                                required={true}
                                            />
                                            <div className="mt-2">
                                                <TextInput
                                                    value={address2}
                                                    onChange={event => {
                                                        SetAddress2(event.target.value);
                                                    }}
                                                    placeholder="address line 2"
                                                    type="text"
                                                    required={false}
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="mt-3">
                                        <ToggleSwitch
                                            checked={is_resident}
                                            label="FD Block resident?"
                                            onChange={state => {
                                                SetIsResident(state);
                                            }}
                                        />
                                        <div className="mt-3 test-xl text-black/50">
                                            Residency will need to be verified by administrators.
                                            <br />
                                            Some features such as booking of community hall will remain unavailable
                                            before verification.
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 px-5 ml-auto">
                                <Button onClick={SubmitDetails}>confirm details</Button>
                            </div>
                        </div>
                    ) : null}
                </Card>
            </div>
        </Layout>
    );
};

export default CreateAccount;
