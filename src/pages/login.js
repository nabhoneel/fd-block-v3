/* global grecaptcha */

import React, { useState, useContext } from "react";
import { navigate } from "gatsby";
import { app } from "../config/firebase";
import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "firebase/auth";

import {
    Button,
    Card,
    Label,
    TextInput,
    Checkbox,
    Spinner,
} from "flowbite-react";

import Layout from "../components/layout";
import { StdContext, StdContextConsumer } from "../context/StdContext";

export default function IndexPage() {
    const [phone_number, SetPhoneNumber] = useState("");
    const [otp, SetOtp] = useState("");
    const [confirmation_result, SetConfirmationResult] = useState(null);
    const [status, SetStatus] = useState({
        recaptcha_solved: false,
        phone_submitted: false,
        otp_submitted: false,
        enable_otp_field: false,
    });

    const context = useContext(StdContext);
    if (context.user_id?.length > 0) {
        // The user_id will be populated only when any user is signed in ; in that case, it will not be null or ""
        navigate("/");
    }

    const HandleGenerateOtp = async event => {
        console.info("HandleGenerateOtp");
        try {
            const auth = getAuth(app);
            const recaptcha_verifier = new RecaptchaVerifier(
                "recaptcha-container",
                {
                    badge: "inline",
                    callback: response => {
                        console.info("Recaptcha verified!");
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

            let widget_id;
            recaptcha_verifier.render().then(wi => (widget_id = wi));

            /*
             * From Firebase docs (https://firebase.google.com/docs/auth/web/phone-auth#web-version-9_6):
             * The signInWithPhoneNumber method issues the reCAPTCHA challenge to the user, and if the user passes the challenge,
             * requests that Firebase Authentication send an SMS message containing a verification code to the user's phone.
             */
            try {
                const sign_in = await signInWithPhoneNumber(
                    auth,
                    phone_number,
                    recaptcha_verifier
                );

                SetConfirmationResult(sign_in);
                SetStatus({ ...status, enable_otp_field: true });
            } catch (err) {
                grecaptcha.reset(widget_id);
            }
        } catch (err) {}
    };

    const HandleSubmitOtp = async event => {
        console.info("HandleSubmitOtp");
        console.assert(
            confirmation_result,
            "Confirmation object cannot be null"
        );

        try {
            const creds = await confirmation_result.confirm(otp);
            if (creds.user?.phoneNumber === phone_number) {
                context.SetUserSigningIn(false);
            }
        } catch (err) {
            console.error("Could not confirm OTP");
        }
    };

    if (context.user_id === null) {
        // When the user's logged in state is yet to be determined, show a loading animation
        return (
            <Layout>
                <Spinner aria-label="Extra large spinner example" size="xl" />
            </Layout>
        );
    } else if (context.user_id === "") {
        console.log("Rendering login");
        // Render the login form only if the user is signed out
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
                                    disabled={status.enable_otp_field}
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
                                <StdContextConsumer>
                                    {global_state => (
                                        <TextInput
                                            id="otp"
                                            type="number"
                                            required={true}
                                            disabled={!status.enable_otp_field}
                                            value={otp}
                                            onChange={event => {
                                                SetOtp(event.target.value);
                                                // Sort of a semaphore for blocking user-related operations during this flow
                                                global_state.SetUserSigningIn(
                                                    true
                                                );
                                            }}
                                        />
                                    )}
                                </StdContextConsumer>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="remember" />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>
                            <Button
                                onClick={HandleGenerateOtp}
                                style={{
                                    display: status.enable_otp_field
                                        ? "none"
                                        : "block",
                                }}
                            >
                                Generate OTP
                            </Button>
                            <Button
                                onClick={HandleSubmitOtp}
                                style={{
                                    display: status.enable_otp_field
                                        ? "block"
                                        : "none",
                                }}
                            >
                                Submit OTP
                            </Button>
                            <div id="recaptcha-container" />
                        </form>
                    </Card>
                </div>
            </Layout>
        );
    }
}
