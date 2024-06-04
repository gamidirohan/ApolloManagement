from flask import Flask, render_template, request, jsonify
import mysql.connector

app = Flask(__name__)

# Database configuration
db_config = {
    'user': 'root',
    'password': '',
    'host': 'localhost',
    'database': 'apollo_tyres'
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/notifications')
def notifications():
    return render_template('notifications.html')

@app.route('/inventory')
def inventory():
    return render_template('inventory.html')

@app.route('/process', methods=['POST', 'GET'])
def process():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    
    if request.method == 'POST':
        model = request.form['model']
        name = request.form['name']
        quantity = int(request.form['quantity'])
        serial = request.form['serial']
        alert_threshold = request.form.get('alert_threshold', None)
        
        if alert_threshold == 'custom':
            alert_threshold = request.form.get('custom_alert_threshold', None)
        
        cursor.execute("SELECT * FROM tyres WHERE model=%s AND name=%s AND serial=%s", (model, name, serial))
        result = cursor.fetchone()
        
        if result:
            new_quantity = result['quantity'] + quantity
            cursor.execute("UPDATE tyres SET quantity=%s WHERE model=%s AND name=%s AND serial=%s", (new_quantity, model, name, serial))
            if new_quantity <= result['alert_threshold']:
                cursor.execute("UPDATE tyres SET last_alerted=NOW() WHERE model=%s AND name=%s AND serial=%s", (model, name, serial))
        else:
            cursor.execute("INSERT INTO tyres (model, name, quantity, serial, alert_threshold, last_alerted) VALUES (%s, %s, %s, %s, %s, NOW())", (model, name, quantity, serial, alert_threshold))

        
        conn.commit()
        cursor.close()
        conn.close()
        return "Inventory updated successfully"
    
    elif request.method == 'GET':
        query = request.args.get('query')
        type_ = request.args.get('type')
        column = 'model' if type_ == 'model' else 'name'
        
        cursor.execute(f"SELECT DISTINCT {column} FROM tyres WHERE {column} LIKE %s", (f'%{query}%',))
        results = [row[column] for row in cursor.fetchall()]
        
        cursor.close()
        conn.close()
        return jsonify(results)

@app.route('/fetch_notifications', methods=['GET'])
def fetch_notifications():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT model, name, serial, SUM(quantity) as quantity, alert_threshold, last_alerted 
        FROM tyres 
        WHERE alert_threshold IS NOT NULL 
        GROUP BY model, name, serial
        HAVING SUM(quantity) <= alert_threshold
        ORDER BY last_alerted DESC
    """)
    
    notifications = cursor.fetchall()
    formatted_notifications = []
    
    for tyre in notifications:
        formatted_notifications.append({
            'model': tyre['model'],
            'name': tyre['name'],
            'serial': tyre['serial'],
            'quantity': tyre['quantity'],
            'alert_threshold': tyre['alert_threshold'],
            'last_alerted': tyre['last_alerted'].strftime('%Y-%m-%d %H:%M:%S')
        })
    
    cursor.close()
    conn.close()
    
    return jsonify(formatted_notifications)

@app.route('/fetch_inventory', methods=['GET'])
def fetch_inventory():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT model, name, serial, quantity FROM tyres ORDER BY RIGHT(serial, 2), LEFT(serial, 2)")
    inventory = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify(inventory)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)