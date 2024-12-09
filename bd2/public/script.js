
document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    // Ensure the form exists before attaching the event listener
    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // Prevent the default form submission
            const formData = new FormData(registerForm);
            const data = {
                username: formData.get('username'),
                email: formData.get('email'),
                phone_number: formData.get('phone_number'),
                blood_type: formData.get('blood_type'),
                password: formData.get('password'),
                role: formData.get('role')
            };
            try {
                // Make a POST request to the backend API
                const response = await fetch('http://localhost:5000/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                const result = await response.json();
            
                if (response.ok) { // Check if the response status is in the 2xx range
                    alert(result.message); // Show success message
                    window.location.href = 'login.html'; // Redirect to login page
                } else {
                    alert(result.message); // Show error message from the server
                }
            } catch (error) {
                console.error('Error during registration:', error);
                alert('An error occurred while processing your request. Please try again.');
            }
        });
    } else {
        console.error("Register form element not found.");
    }
});

  
 document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from submitting the default way
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    try {
        const response = await fetch('http://localhost:5000/api/login', {  
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        if (response.ok) {
          const data = await response.json();
                    localStorage.setItem('jwtToken', data.token);
                    localStorage.setItem('userRole', data.role);  // Assuming 'role' is returned
                    if (data.role === 'admin') {
                        window.location.href = '/admin-dashboard.html';  // Admin dashboard
                    } else  if (data.role === 'patient') {
                        window.location.href = '/patient-dashboard.html';   // Regular user dashboard
                    }
                    else if (data.role === 'donor'){
                      window.location.href = '/donor-dashboard.html'; 
                    }
                  } 
                  else {
          const error = await response.json();
          alert(error.message);}
  }
   catch (err) {
        console.error( err);
        alert('An unexpected error occurred.');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.addEventListener('submit', async function (event) {
          console.log("Form submission intercepted.");
          event.preventDefault();
            const formData = new FormData(donationForm);
            const data = {
                name: formData.get('name'),
                age: parseInt(formData.get('age'), 10),
                disease_status: formData.get('disease_status') || 'None',
                address: formData.get('address'),
                phone_number: formData.get('phone_number'),
                blood_type: formData.get('blood_type'),
                quantity: parseInt(formData.get('quantity'), 10),
                donation_date: formData.get('donation_date'),
            };
            try {
                const response = await fetch('http://localhost:5000/api/donor/request-donation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body:JSON.stringify(data),
                });
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Error during donation submission:', error);
                alert('An error occurred while processing your request. Please try again.');
            }
        });
    } else {
        console.error("Donation form element not found.");
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
        requestForm.addEventListener('submit', async function (event) {
          console.log("Form submission intercepted.");
          event.preventDefault();
            const formData = new FormData(requestForm);
            const data = {
                name: formData.get('name'),
                age: parseInt(formData.get('age'), 10),
                reason: formData.get('reason') || 'None',
                address: formData.get('address'),
                phone_number: formData.get('phone_number'),
                blood_type: formData.get('blood_type'),
                quantity: parseInt(formData.get('quantity'), 10),
                request_date: formData.get('request_date'),
            };
            try {
                const response = await fetch('http://localhost:5000/api/patient/request-blood', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body:JSON.stringify(data),
                });
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Error during request submission:', error);
                alert('An error occurred while processing your request. Please try again.');
            }
        });
    } else {
        console.error("form element not found.");
    }
});