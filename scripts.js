document.addEventListener('DOMContentLoaded', function() {
    const customerForm = document.getElementById('customerForm');
    const customerTableBody = document.querySelector('#customerTable tbody');
    const updateButton = document.getElementById('updateCustomer');
    const searchButton = document.getElementById('searchButton');
    const searchQueryInput = document.getElementById('searchQuery');

    fetchCustomers();

    function fetchCustomers() {
        fetch('/get_customers')
            .then(response => response.json())
            .then(data => {
                customerTableBody.innerHTML = '';
                data.forEach(customer => {
                    addCustomerRow(customer);
                });
            });
    }

    function addCustomerRow(customer) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer[0]}</td>
            <td>${customer[1]}</td>
            <td>${customer[2]}</td>
            <td>${customer[3]}</td>
            <td>${customer[4]}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editCustomer(${customer[0]})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${customer[0]})">Delete</button>
            </td>
        `;
        customerTableBody.appendChild(row);
    }

    customerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const customerId = document.getElementById('customerId').value;

        if (customerId) {
            updateCustomer(customerId, { name, email, phone, address });
        } else {
            addCustomer({ name, email, phone, address });
        }
    });

    searchButton.addEventListener('click', function() {
        const query = searchQueryInput.value.trim();
        if (query) {
            searchButton.classList.remove('btn-primary');
            searchButton.classList.add('btn-success');

            fetch(`/search_customer?query=${query}`)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        // Customer found, display their details in a prompt
                        const customer = data[0]; // Assuming we're showing the first match
                        alert(`Customer Found:\n\nName: ${customer[1]}\nEmail: ${customer[2]}\nPhone: ${customer[3]}\nAddress: ${customer[4]}`);
                    } else {
                        // No customer found, display a different prompt
                        alert('No customer found with that name.');
                    }
                })
                .finally(() => {
                    // Revert the search button color back to blue
                    searchButton.classList.remove('btn-success');
                    searchButton.classList.add('btn-primary');
                });
        } else {
            alert('Please enter a name to search.');
        }
    });

    function addCustomer(customerData) {
        fetch('/add_customer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                window.location.reload();
            } else {
                alert(data.error);
            }
        });
    }

    window.editCustomer = function(id) {
        fetch(`/get_customers`)
            .then(response => response.json())
            .then(data => {
                const customer = data.find(c => c[0] === id);
                if (customer) {
                    document.getElementById('customerId').value = customer[0];
                    document.getElementById('name').value = customer[1];
                    document.getElementById('email').value = customer[2];
                    document.getElementById('phone').value = customer[3];
                    document.getElementById('address').value = customer[4];
                    updateButton.style.display = 'inline-block';
                }
            });
    };

    function updateCustomer(id, customerData) {
        fetch(`/edit_customer/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            window.location.reload();
        });
    }

    window.deleteCustomer = function(id) {
        if (confirm('Are you sure you want to delete this customer?')) {
            fetch(`/delete_customer/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                window.location.reload();
            });
        }
    };
});
