'use client'
import { auth } from '@/lib/firebaseClient';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import React, { useEffect } from 'react'

function OtpLogin() {
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [otp, setOtp] = React.useState('');
    const [isOtpSent, setIsOtpSent] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [resendCount, setResendCount] = React.useState(0);

    const recaptchaRef = React.useRef<RecaptchaVerifier | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && !recaptchaRef.current) {
            recaptchaRef.current = new RecaptchaVerifier(
                auth,
                'recaptcha-container',
                {
                    size: 'invisible',
                    callback: (response: any) => {
                        // reCAPTCHA solved
                    },
                },
                
            );
            recaptchaRef.current.render();
        }
    }, []);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError('');
        setSuccess('');

        // Basic phone number validation (E.164 format)
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setError('Please enter a valid phone number in E.164 format, e.g. +919876543210');
            return;
        }

        try {
            if (!recaptchaRef.current) throw new Error('reCAPTCHA not initialized');
            const confirmationResult: ConfirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaRef.current);
            setIsOtpSent(true);
            setSuccess('OTP sent successfully');
        } catch (error: any) {
            console.error('Error sending OTP:', error);
            setError(error?.message || 'Failed to send OTP');
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
