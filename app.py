from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

# Create a connection to the database
def create_connection():
    conn = sqlite3.connect('customers.db')
    return conn

# Initialize the database
def init_db():
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT,
            address TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Route for the home page
@app.route('/')
def index():
    return render_template('index.html')

# Route to get all customers
@app.route('/get_customers', methods=['GET'])
def get_customers():
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM customers')
    customers = cursor.fetchall()
    conn.close()
    return jsonify(customers)

# Route to add a new customer
@app.route('/add_customer', methods=['POST'])
def add_customer():
    data = request.get_json()
    name = data['name']
    email = data['email']
    phone = data.get('phone', '')
    address = data.get('address', '')
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO customers (name, email, phone, address)
            VALUES (?, ?, ?, ?)
        ''', (name, email, phone, address))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Customer added successfully'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400

# Route to edit an existing customer
@app.route('/edit_customer/<int:id>', methods=['PUT'])
def edit_customer(id):
    data = request.get_json()
    name = data['name']
    email = data['email']
    phone = data.get('phone', '')
    address = data.get('address', '')
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE customers
        SET name = ?, email = ?, phone = ?, address = ?
        WHERE id = ?
    ''', (name, email, phone, address, id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Customer updated successfully'})

# Route to delete a customer
@app.route('/delete_customer/<int:id>', methods=['DELETE'])
def delete_customer(id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM customers WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Customer deleted successfully'})

# Route to search for customers by name
@app.route('/search_customer', methods=['GET'])
def search_customer():
    query = request.args.get('query', '')
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM customers
        WHERE name LIKE ?
    ''', (f'%{query}%',))
    customers = cursor.fetchall()
    conn.close()
    return jsonify(customers)

# Initialize the database when the app starts
if __name__ == '__main__':
    init_db()
    app.run(debug=True)
