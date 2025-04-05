fetch('/userinfo')
            .then(response => response.json())
            .then(data => {
                document.getElementById('username').textContent = data.username;
                if (data.role === 'admin') {
                    // Show the "Users" action card if the user is an admin
                    document.getElementById('userActionCard').style.display = 'block';
                } else {
                    // Hide the "Users" action card if the user is not an admin
                    document.getElementById('userActionCard').style.display = 'none';
                }
            })
            .catch(err => {
                console.error('Error fetching user info:', err);
                // Hide the "Users" action card in case of an error
                document.getElementById('userActionCard').style.display = 'none';
            });