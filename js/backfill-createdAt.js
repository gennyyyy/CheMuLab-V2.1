// Backfill script: set users/{uid}.createdAt from Auth metadata.creationTime
// Usage: include this script in a page after firebase-init (or open DevTools and run it in console).

(function() {
    if (!window.firebase) {
        console.error('Firebase not available. Include this script after firebase-init.');
        return;
    }

    async function backfillCurrentUserCreatedAt() {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.warn('No signed-in user. Sign in first to run backfill.');
            return;
        }

        const uid = user.uid;
        const usersRef = firebase.firestore().collection('users').doc(uid);

        try {
            const snap = await usersRef.get();
            const data = snap.exists ? snap.data() : {};

            if (data && data.createdAt) {
                console.log('users/' + uid + ' already has createdAt:', data.createdAt);
                return { updated: false, reason: 'already-present', value: data.createdAt };
            }

            // Try to use Auth metadata.creationTime first (client timestamp)
            let creationTime = null;
            try {
                if (user.metadata && user.metadata.creationTime) {
                    const parsed = new Date(user.metadata.creationTime);
                    if (!isNaN(parsed.getTime())) creationTime = parsed;
                }
            } catch (e) {
                console.warn('Failed to parse auth metadata.creationTime', e);
            }

            if (creationTime) {
                const ts = firebase.firestore.Timestamp.fromDate(creationTime);
                await usersRef.set({ createdAt: ts }, { merge: true });
                console.log('Wrote createdAt from auth.metadata.creationTime for users/' + uid, ts.toDate().toISOString());
                return { updated: true, method: 'auth-metadata', value: ts };
            }

            // Fallback: write server timestamp
            await usersRef.set({ createdAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
            console.log('Wrote serverTimestamp createdAt for users/' + uid);
            return { updated: true, method: 'server-timestamp' };

        } catch (err) {
            console.error('Backfill failed for users/' + uid, err);
            return { updated: false, reason: 'error', error: err };
        }
    }

    // Auto-run on auth state change (useful when included on a page)
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) return;
        // small delay to ensure firebase init + tokens ready
        await new Promise(r => setTimeout(r, 250));
        console.log('Running backfill-createdAt for uid:', user.uid);
        const res = await backfillCurrentUserCreatedAt();
        console.log('Backfill result:', res);
    });

    // Expose function for manual invocation
    window.backfillCurrentUserCreatedAt = backfillCurrentUserCreatedAt;
})();
