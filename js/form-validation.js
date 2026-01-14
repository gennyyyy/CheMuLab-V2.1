// Real-time form validation helpers for CheMuLab

const FormValidator = {
    // Email validation
    validateEmailFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Username validation
    validateUsername(username) {
        if (!username || username.length < 3 || username.length > 20) {
            return { valid: false, message: 'Username must be 3-20 characters' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { valid: false, message: 'Only letters, numbers, and underscores allowed' };
        }
        return { valid: true, message: '' };
    },

    // Password validation
    validatePassword(password) {
        if (!password || password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters' };
        }
        return { valid: true, message: '' };
    },

    // Create validation message element
    createValidationMessage(inputElement, message, isError = true) {
        // Remove existing message
        const existingMsg = inputElement.parentElement.querySelector('.validation-message');
        if (existingMsg) {
            existingMsg.remove();
        }

        if (!message) return;

        const msgElement = document.createElement('div');
        msgElement.className = `validation-message ${isError ? 'error' : 'success'}`;
        msgElement.textContent = message;
        msgElement.style.fontSize = '12px';
        msgElement.style.marginTop = '4px';
        msgElement.style.color = isError ? '#ff0000' : '#008000';
        
        inputElement.parentElement.appendChild(msgElement);
    },

    // Add real-time validation to an input
    addRealtimeValidation(inputElement, validationType) {
        inputElement.addEventListener('blur', () => {
            const value = inputElement.value.trim();
            
            switch(validationType) {
                case 'email':
                    if (value && !this.validateEmailFormat(value)) {
                        inputElement.classList.add('input-error');
                        this.createValidationMessage(inputElement, 'Please enter a valid email address');
                    } else {
                        inputElement.classList.remove('input-error');
                        this.createValidationMessage(inputElement, '');
                    }
                    break;
                    
                case 'username':
                    if (value) {
                        const result = this.validateUsername(value);
                        if (!result.valid) {
                            inputElement.classList.add('input-error');
                            this.createValidationMessage(inputElement, result.message);
                        } else {
                            inputElement.classList.remove('input-error');
                            this.createValidationMessage(inputElement, '');
                        }
                    }
                    break;
                    
                case 'password':
                    if (value) {
                        const result = this.validatePassword(value);
                        if (!result.valid) {
                            inputElement.classList.add('input-error');
                            this.createValidationMessage(inputElement, result.message);
                        } else {
                            inputElement.classList.remove('input-error');
                            this.createValidationMessage(inputElement, '');
                        }
                    }
                    break;
            }
        });

        // Clear error on input
        inputElement.addEventListener('input', () => {
            if (inputElement.classList.contains('input-error')) {
                inputElement.classList.remove('input-error');
                this.createValidationMessage(inputElement, '');
            }
        });
    },

    // Check email availability with Firebase
    async checkEmailAvailability(email, feedbackElement) {
        if (!email || !this.validateEmailFormat(email)) {
            return;
        }

        try {
            feedbackElement.textContent = 'Checking email availability...';
            feedbackElement.style.color = '#666';
            
            const exists = await AuthService.checkEmailExists(email);
            
            if (exists) {
                feedbackElement.textContent = '✗ This email is already registered';
                feedbackElement.style.color = '#ff0000';
                return false;
            } else {
                feedbackElement.textContent = '✓ Email is available';
                feedbackElement.style.color = '#008000';
                return true;
            }
        } catch (error) {
            feedbackElement.textContent = '';
            console.error('Error checking email:', error);
            return true; // Allow to proceed if check fails
        }
    },

    // Check username availability with Firebase
    async checkUsernameAvailability(username, feedbackElement) {
        const validation = this.validateUsername(username);
        if (!validation.valid) {
            return;
        }

        try {
            feedbackElement.textContent = 'Checking username availability...';
            feedbackElement.style.color = '#666';
            
            const exists = await AuthService.checkUsernameExists(username);
            
            if (exists) {
                feedbackElement.textContent = '✗ This username is already taken';
                feedbackElement.style.color = '#ff0000';
                return false;
            } else {
                feedbackElement.textContent = '✓ Username is available';
                feedbackElement.style.color = '#008000';
                return true;
            }
        } catch (error) {
            feedbackElement.textContent = '';
            console.error('Error checking username:', error);
            return true; // Allow to proceed if check fails
        }
    }
};

// Make globally available
window.FormValidator = FormValidator;
