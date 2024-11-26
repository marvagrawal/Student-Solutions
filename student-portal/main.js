
 // Firebase configuration
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyA9wR0Z7VQu9sNLe0sCR6IR8HssXRW5ymU",
        authDomain: "issue-main.firebaseapp.com",
        databaseURL: "https://issue-main-default-rtdb.firebaseio.com",
        projectId: "issue-main",
        storageBucket: "issue-main.firebasestorage.app",
        messagingSenderId: "82925288305",
        appId: "1:82925288305:web:e96dd159cadeeae90c14d0",
        measurementId: "G-49BR1S1KZF"
      };
      
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
      
      
          // Initialize Firebase
          firebase.initializeApp(firebaseConfig);
      
          // Show or hide sections
          function showSection(sectionId) {
            document.querySelectorAll('.container').forEach(section => section.classList.add('hidden'));
            document.getElementById(sectionId).classList.remove('hidden');
          }
      
          // Tab switching
          function showTab(tabId) {
            document.querySelectorAll('.issues-container').forEach(tab => tab.classList.add('hidden'));
            document.querySelectorAll('.tabs button').forEach(button => button.classList.remove('active'));
            document.getElementById(tabId).classList.remove('hidden');
            document.getElementById(`${tabId}-tab`).classList.add('active');
          }
      
          // Authentication functions
          function login() {
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;
            firebase.auth().signInWithEmailAndPassword(email, password)
              .then(() => {
                showSection('issue-page');
                loadIssues();
              })
              .catch(error => alert('Login failed: ' + error.message));
          }
      
          function register() {
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;
            firebase.auth().createUserWithEmailAndPassword(email, password)
              .then(() => {
                alert('Registration successful! Please log in.');
              })
              .catch(error => alert('Registration failed: ' + error.message));
          }
      
          function logout() {
            firebase.auth().signOut()
              .then(() => {
                showSection('auth-page');
              })
              .catch(error => alert('Logout failed: ' + error.message));
          }
      
          // Submit an issue
          function submitIssue() {
            const issueText = document.getElementById('issue-text').value;
            const user = firebase.auth().currentUser; // Get the logged-in user
            if (!issueText) {
              alert('Please enter an issue.');
              return;
            }
            firebase.database().ref('issues').push({ // Save to "issues" node in Firebase
              text: issueText,
              author: user.email,
              comments: [] // Initialize with an empty comments array
            });
            document.getElementById('issue-text').value = ''; // Clear the input field
            loadIssues(); // Reload issues to update the UI
          }
      
          // Load all issues and filter "My Issues"
          function loadIssues() {
            const user = firebase.auth().currentUser;
            const allIssuesDiv = document.getElementById('all-issues');
            const myIssuesDiv = document.getElementById('my-issues');
            allIssuesDiv.innerHTML = '';
            myIssuesDiv.innerHTML = '';
      
            firebase.database().ref('issues').on('value', snapshot => {
              const issues = snapshot.val();
              for (let id in issues) {
                const issue = issues[id];
                const issueDiv = document.createElement('div');
                issueDiv.className = 'issue';
                issueDiv.innerHTML = `
                  <p><strong>${issue.author}:</strong> ${issue.text}</p>
                  <div>
                    <textarea placeholder="Write a comment..." id="comment-${id}"></textarea>
                    <button onclick="submitComment('${id}')">Comment</button>
                  </div>
                  <div id="comments-${id}">
                    ${issue.comments ? issue.comments.map(comment => `<div class="comment">${comment}</div>`).join('') : ''}
                  </div>
                `;
      
                // Append to appropriate tab
                allIssuesDiv.appendChild(issueDiv);
                if (issue.author === user.email) {
                  myIssuesDiv.appendChild(issueDiv.cloneNode(true));
                }
              }
            });
          }
      
          // Submit a comment
          function submitComment(issueId) {
            const commentInput = document.getElementById(`comment-${issueId}`);
            const commentText = commentInput.value;
            if (!commentText) {
              alert('Please enter a comment.');
              return;
            }
            firebase.database().ref(`issues/${issueId}/comments`).once('value', snapshot => {
              const comments = snapshot.val() || [];
              comments.push(commentText);
              firebase.database().ref(`issues/${issueId}/comments`).set(comments);
              commentInput.value = '';
              loadIssues();
            });
          }
      
          // Show login page initially
          firebase.auth().onAuthStateChanged(user => {
            if (user) {
              showSection('issue-page');
              loadIssues();
            } else {
              showSection('auth-page');
            }
          });