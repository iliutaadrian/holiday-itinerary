from flask import Flask, request, jsonify, send_from_directory, render_template
import sqlite3
import os

app = Flask(__name__)
DATABASE = 'notes.db'

def init_db():
    if not os.path.exists(DATABASE):
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE notes (
                day INTEGER PRIMARY KEY,
                content TEXT
            )
        ''')
        conn.commit()
        conn.close()

@app.route('/')
def root():
    return render_template('index.html')

@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/itinerary.md')
def serve_markdown():
    return send_from_directory('.', 'itinerary.md')

@app.route('/save_note', methods=['POST'])
def save_note():
    data = request.json
    day = data['day']
    content = data['content']
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO notes (day, content) VALUES (?, ?)
    ''', (day, content))
    conn.commit()
    conn.close()
    
    return jsonify({'status': 'success'})

@app.route('/get_note/<int:day>', methods=['GET'])
def get_note(day):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('SELECT content FROM notes WHERE day = ?', (day,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return jsonify({'day': day, 'content': row[0]})
    else:
        return jsonify({'day': day, 'content': ''})

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)
