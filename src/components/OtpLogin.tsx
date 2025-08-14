'use client'
import { auth } from '@/lib/firebaseClient';
import axios from 'axios';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import React, { useEffect } from 'react';

function OtpLogin() {
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [confirmationResult, setConfirmationResult] = React.useState<ConfirmationResult | null>(null);
    const [otpInput, setOtpInput] = React.useState('');
    const [userInfo, setUserInfo] = React.useState<{ uid?: string; email?: string; phone_number?: string } | null>(null);
    const [idToken, setIdToken] = React.useState('');
    const recaptchaRef = React.useRef<RecaptchaVerifier | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && !recaptchaRef.current) {
            recaptchaRef.current = new RecaptchaVerifier(
                auth,
                'recaptcha-container',
                {
                    size: 'invisible',
                    callback: () => {
                        // reCAPTCHA solved
                    },
                },
                
            );
            recaptchaRef.current.render();
        }
    }, []);

    const handleSendOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError('');
        setSuccess('');
        setUserInfo(null);

        // Basic phone number validation (E.164 format)
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setError('Please enter a valid phone number in E.164 format, e.g. +919876543210');
            return;
        }

        try {
            if (!recaptchaRef.current) throw new Error('reCAPTCHA not initialized');
            const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaRef.current);
            setConfirmationResult(result);
            setSuccess('OTP sent successfully');
        } catch (error) {
            const errMsg = (error && typeof error === 'object' && 'message' in error) ? (error as { message?: string }).message : undefined;
            console.error('Error sending OTP:', error);
            setError(errMsg || 'Failed to send OTP');
        }
    };

    const handleVerifyOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError('');
        setSuccess('');
        setUserInfo(null);
        if (!confirmationResult) {
            setError('OTP not sent yet.');
            return;
        }
        if (!otpInput) {
            setError('Please enter the OTP.');
            return;
        }
        try {
            const userCred = await confirmationResult.confirm(otpInput);
            const token = await userCred.user.getIdToken();
            setIdToken(token);
            setSuccess('OTP verified successfully. You can now verify authentication.');
        } catch (error) {
            const errMsg = (error && typeof error === 'object' && 'message' in error) ? (error as { message?: string }).message : undefined;
            console.error('Error verifying OTP:', error);
            setError(errMsg || 'Failed to verify OTP');
        }
    };

    const handleVerifyAuth = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError('');
        setSuccess('');
        setUserInfo(null);
        if (!idToken) {
            setError('Please enter the ID token.');
            return;
        }
        try {
            const response = await axios.post('/api/auth/verify', { idToken });
            if (response.status === 200) {
                setUserInfo(response.data);
                setSuccess('User verified successfully');
            } else {
                setError(response.data.error || 'Failed to verify user');
            }
        } catch (error) {
            const errMsg = (error && typeof error === 'object' && 'message' in error) ? (error as { message?: string }).message : undefined;
            console.error('Error verifying user:', error);
            setError(errMsg || 'Failed to verify user');
        }
    };

    return (
        <div>
            <h1>OTP Login</h1>
            <form onSubmit={handleSendOtp}>
                <input
                    type="text"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <button type="submit">Send OTP</button>
            </form>
            {confirmationResult && (
                <form onSubmit={handleVerifyOtp} style={{ marginTop: 16 }}>
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                    />
                    <button type="submit">Verify OTP</button>
                </form>
            )}
            <div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
                {userInfo && (
                    <div style={{ marginTop: 16 }}>
                        <h3>User Info</h3>
                        <pre>{JSON.stringify(userInfo, null, 2)}</pre>
                    </div>
                )}
            </div>

            <div>
                <h2>Verify Auth</h2>
                <form onSubmit={handleVerifyAuth}>
                    <input
                        type="text"
                        placeholder="Enter ID Token"
                        value={idToken}
                        onChange={(e) => setIdToken(e.target.value)}
                    />
                    <button type="submit">Verify</button>
                </form>
            </div>
            <div id="recaptcha-container" />
        </div>
    );
}

export default OtpLogin;
