 const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('registerErrorMessage');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // ... (get username, email, password)

        try {
            // Await register then login, and only redirect after success
            await AuthService.register(username, email, password);
            const user = await AuthService.login(email, password);
            
            // ... (success redirection logic)

        // START MODIFICATION HERE
        } catch (error) {
            // Default message from the error object
            let message = error.message || String(error);

            // Check the specific Firebase error code for an existing email
            if (error.code === 'auth/email-already-in-use') {
                message = '⚠️ This email is already registered! Please sign in with your password or use a different email address.';
            } 
            // The custom check for a taken *username* from auth.js is also caught here:
            // e.g., "The username '...' is already taken. Please choose another one."

            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
        // END MODIFICATION HERE
    });

