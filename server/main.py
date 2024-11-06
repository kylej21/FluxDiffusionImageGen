from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import os
import glob
import base64
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv


app = Flask(__name__)

CORS(app)

'''
# temporary local login DB
logins = {
    "kylecj21": 'password',
    "AleHuerta" : 'IRunSlow',
    "Smallberg" : 'I<3C++'
}

# Database connection parameters
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'database': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'port': int(os.getenv('DB_PORT'))
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

@app.route('/test_db', methods=['GET'])
def test_db():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Query for users with the username 'kylecj21'
        cursor.execute("SELECT * FROM users WHERE Username = %s;", ('kylecj21',))
        users = cursor.fetchall()

        return jsonify({"message": "Database connection successful", "users": users}), 200

    except Exception as e:
        return jsonify({"message": "Error connecting to the database", "error": str(e)}), 500

    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()

'''            

@app.route('/signup', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username in logins:
        return jsonify({"message": "Username taken", "status": 401}), 401
    else:
        logins[username] = password
        return jsonify({"message": "Registration successful", "status": 200}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')   
    print(logins)
    if username not in logins:
        return jsonify({"message": "User not found", "status": 401}), 401
    elif username in logins and logins[username] == password:
        return jsonify({"message": "Login successful", "status": 200}), 200
    else:
        return jsonify({"message": "Login failed", "status": 401}), 401

@app.route('/prompt_recv', methods=['GET','POST'])
def prompt():
    prompt = request.get_json()
    prompt = prompt.get('prompt')
    print(prompt)

    if os.name == 'nt':  
        python_executable = os.path.abspath(os.path.join('venv', 'Scripts', 'python.exe'))
    else:  
        python_executable = os.path.abspath(os.path.join('venv', 'bin', 'python'))

    script_path = os.path.abspath('fastsdcpu/src/app.py')

    #dont forget to add chmod +x fastsdcpu/src/app.py
    #in readme 

    subprocess.run(
       [python_executable, script_path, '--prompt', prompt],
       check=True
    )

    print("script successful")

    image_folder = "./fastsdcpu/results/*.png"

    files = glob.glob(image_folder) 
    your_image = max(files, key=os.path.getctime)

    with open(your_image, "rb") as img_file:
        my_string = base64.b64encode(img_file.read()).decode("utf-8")

    return jsonify({"Generated Image": 1, "image":my_string})



@app.route('/')
def home():
    return jsonify({"message": "Hello, World!"})


if __name__ == '__main__':
    app.run(debug=True)
