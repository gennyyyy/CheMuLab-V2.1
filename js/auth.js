// Authentication and Data Management Service

const AuthService = {
    // Constants
    STORAGE_KEYS: {
        USERS: 'chemulab_users',
        CURRENT_USER: 'chemulab_current_user',
        USER_PROGRESS: 'chemulab_progress_'
    },

    // Initialize authentication system
    init() {
        // Create admin account if it doesn't exist
        const users = this.getAllUsers();
        if (!users.find(u => u.username === 'admin')) {
            this.createAdminAccount();
        }
    },

    // Create the default admin account
    createAdminAccount() {
        const adminUser = {
            username: 'admin',
            password: 'admin123', // In a real app, this should be hashed
            isAdmin: true
        };
        const users = this.getAllUsers();
        users.push(adminUser);
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    },

    // Get all registered users
    getAllUsers() {
        const users = localStorage.getItem(this.STORAGE_KEYS.USERS);
        return users ? JSON.parse(users) : [];
    },

    // Register a new user
    register(username, password) {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        const users = this.getAllUsers();
        
        // Check if username already exists
        if (users.find(u => u.username === username)) {
            throw new Error('Username already exists');
        }

        // Create new user
        const newUser = {
            username,
            password, // In a real app, this should be hashed
            isAdmin: false
        };

        users.push(newUser);
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

        // Initialize empty progress for new user
        this.initializeUserProgress(username);
        
        return true;
    },

    // Login user
    login(username, password) {
        const users = this.getAllUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (!user) {
            throw new Error('Invalid username or password');
        }

        // Set current user in session
        localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        return user;
    },

    // Logout current user
    logout() {
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    },

    // Get current logged in user
    getCurrentUser() {
        const user = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
        return user ? JSON.parse(user) : null;
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!this.getCurrentUser();
    },

    // Initialize progress storage for new user
    initializeUserProgress(username) {
        const progressKey = this.STORAGE_KEYS.USER_PROGRESS + username;
        if (!localStorage.getItem(progressKey)) {
            localStorage.setItem(progressKey, JSON.stringify({
                discoveredElements: [],
                completedCombinations: []
            }));
        }
    },

    // Get user's progress
    getUserProgress(username) {
        const progressKey = this.STORAGE_KEYS.USER_PROGRESS + username;
        const progress = localStorage.getItem(progressKey);
        return progress ? JSON.parse(progress) : null;
    },

    // Update user's progress
    updateUserProgress(username, progress) {
        const progressKey = this.STORAGE_KEYS.USER_PROGRESS + username;
        localStorage.setItem(progressKey, JSON.stringify(progress));
    }
};

// Initialize authentication system
AuthService.init();