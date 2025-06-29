import {
    signIn,
    signUp,
    signOut,
    confirmSignUp,
    fetchAuthSession,
    resetPassword,
    confirmResetPassword,
    resendSignUpCode
} from 'aws-amplify/auth';
import {toast} from "react-toastify";

export const login = async (form: { email: string, password: string }) => {
    try {
        const user = await signIn({ username: form.email, password: form.password });
        if (user.isSignedIn) {
            return { success: true };
        }
        if (user.nextStep?.signInStep === "DONE") {
            return { success: true };
        }
        return { success: false, error: "UserNotFullySignedIn" };
    } catch (err) {
        const error = err as Error;
        if (error.name === "UserAlreadyAuthenticatedException") {
            return { success: false, error: "UserAlreadyAuthenticatedException" };
        }
        return { success: false, error: "IncorrectCredentials" };
    }
};

export const register = async (form: { email: string, password: string }) => {
    try {
        const {nextStep} = await signUp({
            username: form.email,
            password: form.password,
            options: {
                userAttributes: {
                    email: form.email,
                },
                autoSignIn: true,
            }
        });
        toast.success("Register successful!");
        sessionStorage.setItem('temp_auth_password', form.password);
        sessionStorage.setItem('temp_auth_email', form.email);
        return nextStep.signUpStep == 'CONFIRM_SIGN_UP'
    } catch (err) {
        await signUpErrorHandler(err as Error);
    }
}

export const logout = async () => {
    try {
        await signOut()
    } catch (err) {
        console.error("SignOut error", err);
    }
}

export const confirmUserAccount = async (code: string) => {
    try {
        const email = sessionStorage.getItem('temp_auth_email');
        const password = sessionStorage.getItem('temp_auth_password');
        if (!email || !password) {
            throw new Error('Missing stored credentials');
        }
        const {isSignUpComplete} = await confirmSignUp({
            username: email,
            confirmationCode: code,
        });

        if (isSignUpComplete) {
            await login({email: email, password: password});
        }
        sessionStorage.removeItem('temp_auth_password');
        sessionStorage.removeItem('temp_auth_email');
        toast.success('Account confirmed successfully!');
        return true;
    } catch (err) {
        console.error("ConfirmSignUp error", err);
        const error = err as Error;
        if (error.name === 'ExpiredCodeException') {
            toast.error("Code expired, requesting new code...")
        }
        toast.error("Confirm sign up error")
        return false;
    }
}

export const forgotPassword = async (email: string) => {
    try {
        const {nextStep, isPasswordReset} = await resetPassword({
            username: email
        });
        sessionStorage.setItem('temp_auth_email', email);
        return {nextStep, isPasswordReset};
    } catch (err ) {
        console.error("ForgotPasswordError", err);
        const error = err as Error;
        toast.error(error.message);
    }
}

export const resetUserPassword = async (form: {password: string, confirmationCode: string, }) => {
    try {
        const email = sessionStorage.getItem('temp_auth_email');
        if (!email) {
            throw new Error('Missing stored credentials');
        }

        await confirmResetPassword({
            username: email,
            confirmationCode: form.confirmationCode,
            newPassword: form.password,
        });
        toast.success('Password reset successfully!');
    } catch (err) {
        console.error("ResetPasswordError", err);
        toast.error("Reset password error");
    }
}

export const getAuthHeaders = async () => {
    try {
        const session = await fetchAuthSession();
        if (!session || !session.tokens) {
            return {};
        }
        const idToken = session.tokens?.idToken;

        return {authorization: `Bearer ${idToken}`} as HeadersInit | undefined
    } catch (err) {
        return {};
        console.warn(err)
    }
}

export const resendConfirmation = async (email: string) => {
    try {
   await resendSignUpCode({
            username: email,
        })
        toast.success('Confirmation email resent successful!');
    }catch (err) {
        console.error("ResendConfirmationError", err);
    }
}

export const signUpErrorHandler = async (error: Error) => {
    switch (error.name) {
        case "UsernameExistsException":
            toast.warning("An account with this email already exists.");
            break;

        case "InvalidPasswordException":
            toast.error("Password must be at least 5 characters long and include uppercase, lowercase, a number, and a special character.");
            break;

        case "InvalidParameterException":
            toast.error("Invalid signup input. Please check all fields.");
            break;

        case "LimitExceededException":
            toast.warning("Too many attempts. Please try again later.");
            break;

        default:
            toast.error("Signup failed. Please try again.");
            console.error("Unhandled signup error:", error);
    }
}
