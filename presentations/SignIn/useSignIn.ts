import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";

/**
 * SignIn ViewModel
 *
 * All auth logic, state management, and form handling live here.
 * The View only consumes returned state and handlers.
 */
export function useSignIn() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setIsLoading(true);
            setError("");

            const result = await signIn("credentials", {
                username,
                password,
                redirect: false,
            });
            
            console.log("[SignIn] Response:", result);

            if (result?.error) {
                setError("Invalid credentials. Try admin / admin123");
                setIsLoading(false);
            } else if (result?.ok) {
                // Manual redirect on success ensures the session is picked up correctly
                window.location.href = "/admin";
            }
        },
        [username, password]
    );

    return {
        username,
        setUsername,
        password,
        setPassword,
        isLoading,
        error,
        handleSubmit,
    };
}
