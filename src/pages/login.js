import React, { useEffect, useState } from "react";
import "../config/firebase";
import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "firebase/auth";

import { Button, Card, Label, TextInput, Checkbox } from "flowbite-react";

import Layout from "../components/layout";

export default function IndexPage() {
    const [phone_number, SetPhoneNumber] = useState("xxxxx-xxxxx");
    const [status, SetStatus] = useState({
        recaptcha_solved: false,
        phone_submitted: false,
        otp_submitted: false,
        enable_otp_field: false,
    });

    useEffect(() => {
        if (!status.recaptcha_solved && status.phone_submitted) {
            try {
                console.log("recaptcha solving...");
                const auth = getAuth();
                const recaptcha_verifier = new RecaptchaVerifier(
                    "recaptcha-container",
                    {
                        size: "invisible",
                        badge: "inline",
                        callback: response => {
                            console.log(response);
                            console.log("Recaptcha verified!");
                            SetStatus({ ...status, recaptcha_solved: true });
                        },
                        "expired-callback": response => {
                            console.warn("Recaptcha expired!");
                        },
                        "error-callback": response => {
                            console.warn("Something went wrong!");
                        },
                    },
                    auth
                );
            } catch (err) {
                console.error(err);
            }
        }

        // if (status.phone_submitted) {
        // signInWithPhoneNumber(auth, phone_number, recaptcha_verifier)
        // .then(confirmation_result => {
        // // SMS sent. Prompt user to type the code from the message, then sign the
        // // user in with confirmation_result.confirm(code).
        // // confirmation_result = confirmation_result;
        // // ...
        // })
        // .catch(error => {
        // // Error; SMS not sent
        // // ...
        // });
        // }
    });

    const HandleGenerateOtp = event => {
        SetStatus({ ...status, phone_submitted: true });
    };

    return (
        <Layout>
            <div className="max-w-sm">
                <Card>
                    <form className="flex flex-col gap-4">
                        <div>
                            <div className="mb-2 block">
                                <Label
                                    htmlFor="phone-number"
                                    value="Registered phone number"
                                />
                            </div>
                            <TextInput
                                id="phone-number"
                                type="tel"
                                placeholder="(+91) xxxxx-xxxxx"
                                required={true}
                                value={phone_number}
                                onChange={event =>
                                    SetPhoneNumber(event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="otp" value="OTP" />
                            </div>
                            <TextInput
                                id="otp"
                                type="number"
                                required={true}
                                disabled={!status.enable_otp_field}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="remember" />
                            <Label htmlFor="remember">Remember me</Label>
                        </div>
                        <Button onClick={HandleGenerateOtp}>
                            Generate OTP
                        </Button>
                        <div id="recaptcha-container" />
                    </form>
                </Card>
            </div>
        </Layout>
    );
}
