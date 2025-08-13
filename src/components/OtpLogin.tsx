'use client'
import { auth } from '@/lib/firebaseClient';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import React, { useEffect } from 'react'

function OtpLogin() {
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [otp, setOtp] = React.useState('');
    const [isOtpSent, setIsOtpSent] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [resendCount, setResendCount] = React.useState(0);

    const [recaptchaVerifier, setRecaptchaVerifier] = React.useState(null);

    useEffect(() => {
        const recaptchaVerifier = new RecaptchaVerifier(
            auth, "recaptcha-container", {
            size: "invisible",
        }
        )
        setRecaptchaVerifier(recaptchaVerifier);
    }, []);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        try {
            console.log('Sending OTP to:', phoneNumber);
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
            console.log('OTP sent successfully', confirmationResult);
            setSuccess('OTP sent successfully');
        } catch (error) {
            console.error('Error sending OTP:', error);
            setError('Failed to send OTP');
        }

    }

    return (
        <div>
            <h1>OTP Login</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <button type="submit">Send OTP</button>
            </form>

            <div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </div>


            <div id="recaptcha-container" />


        </div>
    )
}

export default OtpLogin
