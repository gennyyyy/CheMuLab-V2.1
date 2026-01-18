function updatePageHeaders() {
    // List of all pages
    const pages = [
        'index.html',
        'your_lab.html',
        'elements.html',
        'progress_tracker.html',
        'about.html'
    ];

    pages.forEach(async page => {
        try {
            // Add scripts to head
            const scriptTags = `
    <script src="js/auth.js"></script>
    <script src="js/route-protection.js"></script>`;

            // Update sign-in button to div
            const oldSignIn = `<a href="sign_in.html" class="sign-in">
                <div class="sidebar-icon">&#128100;</div> Sign In
            </a>`;
            
            const newSignIn = `<div id="userStatus" class="sign-in">
                <div class="sidebar-icon">&#128100;</div>
                <span id="userStatusText">Sign In</span>
            </div>`;

            await replaceInFile(page, '</head>', `${scriptTags}\n</head>`);
            await replaceInFile(page, oldSignIn, newSignIn);
        } catch (error) {
            console.error(`Error updating ${page}:`, error);
        }
    });
}

// Helper function to replace content in files
async function replaceInFile(filePath, oldContent, newContent) {
    const content = await fs.readFile(filePath, 'utf8');
    const updated = content.replace(oldContent, newContent);
    await fs.writeFile(filePath, updated);
}