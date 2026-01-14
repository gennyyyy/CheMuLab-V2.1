// friends.js
// Simple friends UI + chat using Firestore. Works best when Firestore rules allow the needed reads/writes.
(function () {
    const $ = (sel) => document.querySelector(sel);
    let currentUser = null;
    let activeChat = null; // { friendUid, chatId }
    let messagesUnsub = null;

    function log(msg, ...args) { console.log('[friends]', msg, ...args); }

    async function init() {
        log('Friends module initializing...');

        // Wait for AuthService to be available (it's created in auth.js).
        // Note: auth.js defines `const AuthService = ...` which may not create `window.AuthService`.
        let attempts = 0;
        while ((typeof AuthService === 'undefined' || !AuthService) && !window.AuthService && attempts < 50) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        // Normalize reference: prefer window.AuthService but fall back to global `AuthService` binding.
        if (!window.AuthService && (typeof AuthService !== 'undefined' && AuthService)) {
            try { window.AuthService = AuthService; } catch (e) { /* ignore if not writable */ }
        }

        if (!window.AuthService) {
            log('AuthService not available after waiting');
            return;
        }

        // wait for firebase and auth to be ready
        if (!window.firebase || !firebase.firestore) {
            log('Firebase or Firestore not ready, waiting...');
            window.addEventListener('firebaseReady', init, { once: true });
            return;
        }

        log('Firebase and AuthService ready. Setting up UI...');
        setupUI();

        // wait for auth snapshot from AuthService
        const onUserReady = () => {
            const u = AuthService.getCurrentUser();
            log('Auth state changed. Current user:', u ? u.email : 'null');
            if (!u) {
                log('No user logged in');
                return;
            }
            currentUser = u;
            log('User authenticated:', u.email);
            if (typeof window.updateUserStatus === 'function') {
                window.updateUserStatus();
            }
            loadFriends();
            // start listening for incoming friend requests for this user
            try { listenForFriendRequests(); } catch (e) { console.warn('Failed to start friendRequests listener', e); }
            try { listenForOutgoingRequests(); } catch (e) { console.warn('Failed to start outgoing friendRequests listener', e); }
        };

        // Check current user immediately
        onUserReady();

        // Also listen for future auth changes
        window.addEventListener('userSignedIn', onUserReady);
        window.addEventListener('firebaseReady', onUserReady);

        // Poll for auth state in case events don't fire
        setInterval(() => {
            const u = AuthService.getCurrentUser();
            if (u && (!currentUser || currentUser.uid !== u.uid)) {
                log('Auth state poll detected change:', u.email);
                onUserReady();
            }
        }, 2000);
    }

    function setupUI() {
        $('#addFriendBtn').addEventListener('click', () => { addFriendByEmail($('#friendEmail').value.trim()); });
        $('#sendMsgBtn').addEventListener('click', sendMessage);
        $('#chatText').addEventListener('keyup', (e) => { if (e.key === 'Enter') sendMessage(); });

        // Profile Modal
        const profileModal = $('#friendProfileModal');
        const closeBtn = $('#closeProfileModal');
        if (closeBtn) closeBtn.onclick = () => profileModal.style.display = 'none';
        window.onclick = (e) => { if (e.target === profileModal) profileModal.style.display = 'none'; };

        const unfriendBtn = $('#unfriendBtn');
        if (unfriendBtn) unfriendBtn.onclick = async () => {
            if (activeChat && activeChat.friendUid) {
                if (confirm('Are you sure you want to unfriend this user? This will also delete your chat history with them.')) {
                    await unfriend(activeChat.friendUid);
                    profileModal.style.display = 'none';
                }
            }
        };
    }

    // Listen for incoming friend requests (toUid == currentUser.uid)
    function listenForFriendRequests() {
        if (!currentUser) return;
        const reqList = $('#friendRequestsList');
        if (!reqList) return;
        reqList.innerHTML = 'Loading...';

        // Use event delegation to avoid re-attaching listeners on every snapshot update
        reqList.addEventListener('click', async (e) => {
            if (e.target.classList.contains('accept-btn')) {
                const id = e.target.getAttribute('data-id');
                log('Accept button clicked for request:', id);
                await acceptFriendRequest(id);
            } else if (e.target.classList.contains('decline-btn')) {
                const id = e.target.getAttribute('data-id');
                log('Decline button clicked for request:', id);
                await declineFriendRequest(id);
            }
        });

        try {
            // Avoid server-side composite index requirement by filtering by toUid
            // and sorting client-side.
            const q = firebase.firestore().collection('friendRequests').where('toUid', '==', currentUser.uid);
            q.onSnapshot(snap => {
                reqList.innerHTML = '';
                if (snap.empty) { reqList.innerHTML = '<div class="muted">No pending requests.</div>'; return; }
                // Sort docs by createdAt desc on the client to avoid composite index requirement
                const docs = snap.docs.slice().sort((a, b) => {
                    const aTs = a.data().createdAt && a.data().createdAt.toMillis ? a.data().createdAt.toMillis() : (a.data().createdAt || 0);
                    const bTs = b.data().createdAt && b.data().createdAt.toMillis ? b.data().createdAt.toMillis() : (b.data().createdAt || 0);
                    return bTs - aTs;
                });
                docs.forEach(doc => {
                    const d = doc.data();
                    const div = document.createElement('div');
                    div.className = 'friend pending-request';
                    div.innerHTML = `<div class="friend-info"><strong>${escapeHtml(d.fromUsername || d.fromEmail || d.fromUid)}</strong><div class="muted small">Request from ${escapeHtml(d.fromEmail || '')}</div></div> <div class="friend-actions"><button data-id="${doc.id}" class="accept-btn">Accept</button> <button data-id="${doc.id}" class="decline-btn">Decline</button></div>`;
                    reqList.appendChild(div);
                });
            }, err => {
                console.error('Failed to listen for friendRequests', err);
                reqList.innerHTML = '<div class="muted">Unable to load requests (check permissions).</div>';
            });
        } catch (e) { console.error('listenForFriendRequests error', e); reqList.innerHTML = '<div class="muted">Unable to load requests.</div>'; }
    }

    // Listen for outgoing friend requests (fromUid == currentUser.uid)
    function listenForOutgoingRequests() {
        if (!currentUser) return;
        const outList = $('#outgoingRequestsList');
        if (!outList) return;
        outList.innerHTML = 'Loading...';

        // Use event delegation to avoid re-attaching listeners on every snapshot update
        outList.addEventListener('click', async (e) => {
            if (e.target.classList.contains('cancel-btn')) {
                const id = e.target.getAttribute('data-id');
                log('Cancel button clicked for request:', id);
                await cancelFriendRequest(id);
            }
        });

        try {
            const q = firebase.firestore().collection('friendRequests').where('fromUid', '==', currentUser.uid);
            q.onSnapshot(async snap => {
                outList.innerHTML = '';
                if (snap.empty) { outList.innerHTML = '<div class="muted">No outgoing requests.</div>'; return; }
                const docs = snap.docs.slice().sort((a, b) => {
                    const aTs = a.data().createdAt && a.data().createdAt.toMillis ? a.data().createdAt.toMillis() : (a.data().createdAt || 0);
                    const bTs = b.data().createdAt && b.data().createdAt.toMillis ? b.data().createdAt.toMillis() : (b.data().createdAt || 0);
                    return bTs - aTs;
                });
                let hasAcceptedRequests = false;
                // Process each doc using for...of to handle async properly
                for (const doc of docs) {
                    const d = doc.data();

                    // Check if request was accepted by recipient
                    if (d.acceptedAt) {
                        log('Request was accepted:', doc.id);
                        hasAcceptedRequests = true;
                        // Add recipient to sender's friends list
                        const toUid = d.toUid;
                        const toEmail = d.toEmail || null;
                        const chatId = d.chatId || makeChatId(currentUser.uid, toUid);

                        try {
                            // Fetch recipient's username from usernames collection
                            let recipientUsername = toEmail || toUid;
                            const userQuery = await firebase.firestore().collection('usernames')
                                .where('uid', '==', toUid).limit(1).get();
                            if (!userQuery.empty) {
                                recipientUsername = userQuery.docs[0].id;
                            }

                            // Add to sender's friends list
                            await firebase.firestore().collection('users').doc(currentUser.uid).collection('friends').doc(toUid).set({
                                uid: toUid,
                                email: toEmail,
                                username: recipientUsername,
                                chatId,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            }, { merge: true });
                            log('Added accepted request to friends:', toUid);

                            // Now delete the accepted request since both have it as friend
                            try {
                                await firebase.firestore().collection('friendRequests').doc(doc.id).delete();
                                log('Deleted accepted friend request:', doc.id);
                            } catch (e) {
                                log('Could not delete accepted request:', e);
                            }
                        } catch (e) {
                            log('Error processing accepted request:', e);
                        }
                        continue; // Don't render the request if it's been accepted
                    }

                    const div = document.createElement('div');
                    div.className = 'friend outgoing-request';

                    // Try to fetch username for toUid from usernames collection
                    let toUsername = d.toEmail || d.toUid || '';
                    try {
                        const userQuery = await firebase.firestore().collection('usernames')
                            .where('uid', '==', d.toUid).limit(1).get();
                        if (!userQuery.empty) {
                            toUsername = userQuery.docs[0].id; // username is the doc id
                        }
                    } catch (e) {
                        // Fall back to email if lookup fails
                        log('Could not fetch username for outgoing request', e);
                    }

                    div.innerHTML = `<div class="friend-info"><strong>${escapeHtml(toUsername)}</strong><div class="muted small">Request to ${escapeHtml(d.toEmail || '')}</div></div> <div class="friend-actions"><button data-id="${doc.id}" class="cancel-btn">Cancel</button></div>`;
                    outList.appendChild(div);
                }
                // Refresh friends list once if we processed any accepted requests
                if (hasAcceptedRequests) {
                    log('Processing accepted requests, refreshing friends list');
                    await loadFriends();
                }
            }, err => {
                console.error('Failed to listen for outgoing friendRequests', err);
                outList.innerHTML = '<div class="muted">Unable to load outgoing requests (check permissions).</div>';
            });
        } catch (e) { console.error('listenForOutgoingRequests error', e); outList.innerHTML = '<div class="muted">Unable to load outgoing requests.</div>'; }
    }

    async function cancelFriendRequest(requestId) {
        try {
            log('Cancelling outgoing friend request:', requestId);
            const reqRef = firebase.firestore().collection('friendRequests').doc(requestId);
            log('Request ref path:', reqRef.path);
            await reqRef.delete();
            log('Delete succeeded for request:', requestId);
            showMessage('Friend request canceled', false);
            // Refresh the friends list UI (though listener should auto-update)
            await loadFriends();
        } catch (e) {
            console.error('cancelFriendRequest failed:', e);
            console.error('Error code:', e.code);
            console.error('Error message:', e.message);
            showMessage('Failed to cancel request: ' + (e.message || e), true);
        }
    }

    function showMessage(text, err) {
        const el = $('#addFriendMsg');
        el.textContent = text;
        el.style.color = err ? 'crimson' : '';
    }

    async function loadFriends() {
        if (!currentUser || !window.firebase) return;
        const uid = currentUser.uid;
        const friendsList = $('#friendsList');
        friendsList.innerHTML = 'Loading...';

        try {
            const snap = await firebase.firestore().collection('users').doc(uid).collection('friends').orderBy('username', 'asc').get();
            friendsList.innerHTML = '';
            if (snap.empty) {
                friendsList.innerHTML = '<div class="muted">No friends yet. Add one by email.</div>';
                return;
            }

            // Map each friend doc to a promise that fetches their latest profile info
            const friendPromises = snap.docs.map(async doc => {
                const data = doc.data();
                const friendUid = data.uid;

                try {
                    // Fetch latest profile from source users collection
                    const profileDoc = await firebase.firestore().collection('users').doc(friendUid).get();
                    if (profileDoc.exists) {
                        const profile = profileDoc.data();
                        return {
                            ...data,
                            username: profile.username || data.username,
                            photoURL: profile.photoURL || data.photoURL || null
                        };
                    }
                } catch (e) {
                    log('Error syncing profile for friend', friendUid, e);
                }
                return data; // fallback to cached data
            });

            const syncedFriends = await Promise.all(friendPromises);

            syncedFriends.forEach(data => {
                const div = document.createElement('div');
                div.className = 'friend';

                const avatarUrl = data.photoURL || 'img/default-avatar.png';
                div.innerHTML = `
                    <div class="friend-icon" style="background-image: url('${avatarUrl}'); background-size: cover; background-position: center;"></div>
                    <div class="friend-info">
                        <strong>${escapeHtml(data.username || data.email || data.uid)}</strong>
                        <div class="muted small">${escapeHtml(data.email || '')}</div>
                    </div>
                    <button class="list-view-profile-btn" style="background: rgba(255,255,255,0.3); border: 1px solid rgba(0,0,0,0.1); padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 11px; margin-left: auto;">View</button>
                `;

                const viewBtn = div.querySelector('.list-view-profile-btn');
                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showFriendProfile(data);
                });

                div.addEventListener('click', () => openChat(data));
                friendsList.appendChild(div);
            });
        } catch (err) {
            console.error('Failed to load friends', err);
            friendsList.innerHTML = '<div class="muted">Unable to load friends (check permissions).</div>';
        }
    }

    function escapeHtml(s) { if (!s) return ''; return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

    async function addFriendByEmail(email) {
        showMessage('Looking up email...', false);
        if (!email) { showMessage('Enter an email', true); return; }
        if (!validateEmail(email)) { showMessage('Invalid email format', true); return; }
        try {
            // try to find user by querying usernames collection (docs created at registration in AuthService)
            log('Querying usernames collection for email:', email);
            const q = await firebase.firestore().collection('usernames').where('email', '==', email).get();
            log('Query result count:', q.size);
            if (q.empty) {
                log('No usernames found. Trying alternative lookup...');
                // Fallback: scan all usernames and check manually (less efficient but works if query doesn't)
                const allUsersSnap = await firebase.firestore().collection('usernames').get();
                log('Total usernames in collection:', allUsersSnap.size);
                let found = null;
                allUsersSnap.forEach(doc => {
                    const data = doc.data();
                    log('Username doc:', doc.id, data);
                    if (data.email === email) {
                        found = { id: doc.id, data: data };
                    }
                });
                if (!found) {
                    showMessage('No account found with that email.', true);
                    return;
                }
                const friendUid = found.data.uid;
                const friendUsername = found.id || found.data.username || email;
                log('Found friend via fallback:', friendUid, friendUsername);
                await proceedAddFriend(email, friendUid, friendUsername);
                return;
            }
            const found = q.docs[0].data();
            const friendUid = found.uid;
            const friendUsername = q.docs[0].id || found.username || email;
            log('Found friend via query:', friendUid, friendUsername);
            await proceedAddFriend(email, friendUid, friendUsername);
        } catch (err) {
            console.error('addFriendByEmail error', err);
            showMessage('Failed to add friend: ' + (err.message || err), true);
        }
    }

    async function proceedAddFriend(email, friendUid, friendUsername) {
        try {

            if (friendUid === currentUser.uid) { showMessage('That is your own account.', true); return; }

            // determine chatId (stable deterministic id)
            const chatId = makeChatId(currentUser.uid, friendUid);

            // Create a friend request for the recipient (they will accept/decline)
            // Do NOT create a local friend entry yet — wait for acceptance
            try {
                log('Creating friend request for recipient:', friendUid);
                const reqDoc = firebase.firestore().collection('friendRequests').doc();
                await reqDoc.set({ fromUid: currentUser.uid, toUid: friendUid, fromEmail: currentUser.email || null, fromUsername: currentUser.username || null, toEmail: email, chatId, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
                log('Friend request created:', reqDoc.id);
                showMessage('Friend request sent!', false);
                $('#friendEmail').value = '';
            } catch (e) {
                console.error('Could not create friend request:', e);
                showMessage('Failed to send friend request: ' + (e.message || e), true);
            }
        } catch (err) {
            console.error('proceedAddFriend error', err);
            showMessage('Failed to add friend: ' + (err.message || err), true);
        }
    }

    // Accept a friend request: create mutual friend entries and ensure chat exists, then update request with acceptedAt
    async function acceptFriendRequest(requestId) {
        try {
            log('Accepting friend request:', requestId);
            const reqRef = firebase.firestore().collection('friendRequests').doc(requestId);
            const reqSnap = await reqRef.get();
            if (!reqSnap.exists) { log('Friend request not found:', requestId); return; }
            const data = reqSnap.data();
            if (data.toUid !== currentUser.uid) { console.warn('Not authorized to accept this request'); return; }

            const fromUid = data.fromUid;
            const fromEmail = data.fromEmail || null;
            const fromUsername = data.fromUsername || null;
            const chatId = data.chatId || makeChatId(currentUser.uid, fromUid);

            // Fetch latest profile of the sender to get photoURL
            let fromPhotoURL = null;
            try {
                const fromProfile = await firebase.firestore().collection('users').doc(fromUid).get();
                if (fromProfile.exists) fromPhotoURL = fromProfile.data().photoURL || null;
            } catch (e) { log('Could not fetch sender profile', e); }

            // create friend doc for current user (recipient)
            await firebase.firestore().collection('users').doc(currentUser.uid).collection('friends').doc(fromUid).set({
                uid: fromUid,
                email: fromEmail,
                username: fromUsername,
                photoURL: fromPhotoURL,
                chatId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            log('Created friend doc for recipient:', currentUser.uid, '->', fromUid);

            // create global chat doc if possible
            try { await firebase.firestore().collection('chats').doc(chatId).set({ participants: [currentUser.uid, fromUid], updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true }); log('Ensured chat doc:', chatId); } catch (e) { console.warn('Could not ensure global chat doc', e); }

            // Update the friendRequest doc with acceptedAt so sender can detect acceptance
            // Don't delete it yet - let sender's listener detect the acceptance first
            try { await reqRef.update({ acceptedAt: firebase.firestore.FieldValue.serverTimestamp() }); log('Updated friend request with acceptedAt'); } catch (e) { log('Could not update friend request:', e); }

            showMessage('You are now friends.', false);
            loadFriends();
        } catch (e) { console.error('acceptFriendRequest failed', e); showMessage('Failed to accept request', true); }
    }

    async function declineFriendRequest(requestId) {
        try {
            log('Declining friend request:', requestId);
            const reqRef = firebase.firestore().collection('friendRequests').doc(requestId);
            await reqRef.delete();
            log('Deleted friend request:', requestId);
            showMessage('Request declined', false);
        } catch (e) {
            console.error('declineFriendRequest failed', e);
            showMessage('Failed to decline request', true);
        }
    }

    function validateEmail(email) { const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; return re.test(email); }

    function makeChatId(a, b) { return [a, b].sort().join('_'); }

    async function openChat(friendData) {
        activeChat = { friendUid: friendData.uid, chatId: friendData.chatId || makeChatId(currentUser.uid, friendData.uid), ...friendData };

        // Setup Chat Header with Profile Button
        $('#chatHeader').innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <span>${escapeHtml(friendData.username || friendData.email || 'Friend')}</span>
                <button id="viewProfileBtn" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(0,0,0,0.1); padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;">View Profile</button>
            </div>
        `;

        const viewProfileBtn = $('#viewProfileBtn');
        if (viewProfileBtn) {
            viewProfileBtn.onclick = (e) => {
                e.stopPropagation();
                showFriendProfile(activeChat);
            };
        }

        $('#chatMessages').innerHTML = '<div class="muted">Loading messages...</div>';

        if (messagesUnsub) { try { messagesUnsub(); } catch (e) { } messagesUnsub = null; }

        // prefer global chat collection if available
        const chatMessagesRef = firebase.firestore().collection('chats').doc(activeChat.chatId).collection('messages').orderBy('createdAt', 'asc');
        try {
            messagesUnsub = chatMessagesRef.onSnapshot(snap => {
                renderMessages(snap.docs.map(d => d.data()));
            }, err => {
                console.warn('Unable to listen to global chat messages; falling back', err);
                fallbackToLocalMessages();
            });
        } catch (e) {
            console.warn('Listening to global chat failed', e);
            fallbackToLocalMessages();
        }

        function fallbackToLocalMessages() {
            const localRef = firebase.firestore().collection('users').doc(currentUser.uid).collection('friends').doc(activeChat.friendUid).collection('messages').orderBy('createdAt', 'asc');
            try {
                messagesUnsub = localRef.onSnapshot(snap => renderMessages(snap.docs.map(d => d.data())), err => console.error(err));
            } catch (e) {
                console.error('Fallback messages listener failed', e);
                $('#chatMessages').innerHTML = '<div class="muted">Unable to load messages (check permissions).</div>';
            }
        }
    }

    function renderMessages(messages) {
        const el = $('#chatMessages');
        if (!messages || !messages.length) { el.innerHTML = '<div class="muted">No messages yet.</div>'; return; }
        el.innerHTML = '';
        messages.forEach(m => {
            const div = document.createElement('div');
            div.className = 'chat-message' + (m.fromUid === currentUser.uid ? ' me' : ' them');
            const time = m.createdAt && m.createdAt.toDate ? m.createdAt.toDate().toLocaleTimeString() : '';
            div.innerHTML = `<div class="chat-message-text">${escapeHtml(m.text)}</div><div class="chat-message-meta muted small">${escapeHtml(m.fromUsername || m.fromEmail || '')} ${time}</div>`;
            el.appendChild(div);
        });
        el.scrollTop = el.scrollHeight;
    }

    async function sendMessage() {
        const text = ($('#chatText').value || '').trim();
        if (!text || !activeChat) return;
        const payload = { text, fromUid: currentUser.uid, fromEmail: currentUser.email || null, fromUsername: currentUser.username || null, createdAt: firebase.firestore.FieldValue.serverTimestamp() };

        // attempt to write to global chat messages
        const chatMsgRef = firebase.firestore().collection('chats').doc(activeChat.chatId).collection('messages');
        try {
            await chatMsgRef.add(payload);
        } catch (e) {
            console.warn('Could not write to global chat messages, writing to local copy instead', e);
            try {
                await firebase.firestore().collection('users').doc(currentUser.uid).collection('friends').doc(activeChat.friendUid).collection('messages').add(payload);
            } catch (er) { console.error('Failed to write local message', er); }
        }

        // always write a local copy (so sender sees the message immediately even if global writes fail)
        try { await firebase.firestore().collection('users').doc(currentUser.uid).collection('friends').doc(activeChat.friendUid).collection('messages').add(payload); } catch (e) { console.warn('local copy failed', e); }

        // try to write mirror message into recipient's friend messages (best-effort)
        try { await firebase.firestore().collection('users').doc(activeChat.friendUid).collection('friends').doc(currentUser.uid).collection('messages').add(payload); } catch (e) { /* ignore: may be blocked by rules */ }

        $('#chatText').value = '';
    }

    async function unfriend(friendUid) {
        if (!currentUser) return;
        try {
            log('Unfriending:', friendUid);
            const db = firebase.firestore();
            const batch = db.batch();

            // 1. Remove from current user's friends
            const myFriendRef = db.collection('users').doc(currentUser.uid).collection('friends').doc(friendUid);
            batch.delete(myFriendRef);

            // 2. Remove from friend's friends (best effort, depends on rules)
            const theirFriendRef = db.collection('users').doc(friendUid).collection('friends').doc(currentUser.uid);
            batch.delete(theirFriendRef);

            await batch.commit();
            log('Unfriend successful');

            // Clear active chat
            activeChat = null;
            $('#chatHeader').textContent = 'Select a friend to chat';
            $('#chatMessages').innerHTML = '';

            showMessage('Friend removed', false);
            loadFriends();
        } catch (e) {
            log('Unfriend failed', e);
            showMessage('Failed to unfriend: ' + (e.message || e), true);
        }
    }

    async function showFriendProfile(data) {
        const modal = $('#friendProfileModal');
        const icon = $('#friendProfileIcon');
        const name = $('#friendProfileName');
        const email = $('#friendProfileEmail');
        const joinDate = $('#friendProfileJoinDate');
        const stats = $('#friendProfileStats');

        const avatarUrl = data.photoURL || 'img/default-avatar.png';
        icon.style.backgroundImage = `url('${avatarUrl}')`;
        name.textContent = data.username || 'No Name';
        email.textContent = data.email || 'No Email';
        joinDate.textContent = 'Loading join date...';
        stats.textContent = 'Loading progress...';

        modal.style.display = 'block';

        try {
            const db = firebase.firestore();

            // Fetch extra profile info (Join Date)
            const profileDoc = await db.collection('users').doc(data.uid).get();
            if (profileDoc.exists) {
                const p = profileDoc.data();
                const createdAt = p.registrationDate || p.createdAt || null;
                if (createdAt) {
                    const d = (typeof createdAt.toDate === 'function') ? createdAt.toDate() : new Date(createdAt);
                    joinDate.textContent = `Joined ${d.toLocaleDateString()}`;
                } else {
                    joinDate.textContent = 'Joined date unknown';
                }
            }

            // Fetch progress info
            const progressDoc = await db.collection('progress').doc(data.uid).get();
            if (progressDoc.exists) {
                const prog = progressDoc.data();
                const count = (prog.discoveries ? prog.discoveries.length : 0);
                stats.textContent = `${count} Discoveries`;
            } else {
                stats.textContent = '0 Discoveries';
            }

        } catch (e) {
            log('Error fetching extra profile details', e);
            joinDate.textContent = 'Error loading details';
            stats.textContent = 'Error loading progress';
        }
    }

    // init on script load
    log('Script loaded. Starting initialization...');
    init();

})();
