from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import os
import glob
import base64
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import uuid

load_dotenv()

app = Flask(__name__)

CORS(app)


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


@app.route('/signup', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE Username = %s;", (username,))
        users = cursor.fetchall()
        if(len(users)>0):
            return jsonify({"message": "Username taken!", "users":[],"status":401}),401

        else:
            cursor.execute(
                "INSERT INTO users (Username, Password, Friends) VALUES (%s, %s, %s);",
                (username, password, [])
            )
            conn.commit()
            cursor.execute("SELECT * FROM users WHERE Username = %s;", (username,))
            new_user = cursor.fetchone()
            users = [
                [new_user[0], new_user[1], new_user[2]]
            ]
            return jsonify({"message": "Database connection successful", "users": users, "status":200}), 200

    except Exception as e:
        pass
    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')   
    #added conneciton and cursor to SQL
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE Username = %s;", (username,))
        users = cursor.fetchall()

        if (len(users)==0):
            # Username not found in the database
            return jsonify({"message": "User not found", "status": 401}), 401
        elif  (users[0][2]==password):
            #I think users is the whole users object with the number, username, password, 
            #and friendslist right? Probably ok to just return the object itself for future reference
            return jsonify({"message": "Login successful", "status": 200, "users":users}), 200
        else:
            # Username found but password is incorrect
            return jsonify({"message": "Login failed", "status": 401}), 401

    except Exception as e:
        #for now just print e
        print(e)
        

    #deactivate cursors
    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()

@app.route('/prompt_recv', methods=['GET','POST'])
def prompt():
    prompt = request.get_json()
    prompt = prompt.get('prompt')
    #print(prompt)

    if os.name == 'nt':  
        python_executable = os.path.abspath(os.path.join('venv', 'Scripts', 'python.exe'))
    else:  
        python_executable = os.path.abspath(os.path.join('venv', 'bin', 'python'))

    script_path = os.path.abspath('fastsdcpu/src/app.py')

    # Don't forget to add chmod +x fastsdcpu/src/app.py in readme 

    subprocess.run(
       [python_executable, script_path, '--prompt', prompt],
       check=True
    )

    #print("script successful")

    image_folder = "./fastsdcpu/results/*.png"

    files = glob.glob(image_folder) 
    your_image = max(files, key=os.path.getctime)

    with open(your_image, "rb") as img_file:
        my_string = base64.b64encode(img_file.read()).decode("utf-8")

    return jsonify({"Generated Image": 1, "image":my_string})


# --------------- Add friend function ----------------------------#

@app.route('/add-friend', methods=['POST'])
def add_friend():
    data = request.get_json()
    current_username = data.get('username')  # The user adding a friend
    friend_username = data.get('friend_username')  # The friend to be added

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Get the IDs of the current user and the friend
        cursor.execute("SELECT userid FROM users WHERE username = %s;", (current_username,))
        current_user = cursor.fetchone()

        cursor.execute("SELECT userid FROM users WHERE username = %s;", (friend_username,))
        friend_user = cursor.fetchone()

        if not current_user:
            return jsonify({"message": "Current user not found", "status": 404}), 404

        if not friend_user:
            return jsonify({"message": "Friend user not found", "status": 404}), 404

        current_user_id = current_user[0]
        friend_user_id = friend_user[0]

        # Get the current friends list of the user
        cursor.execute("SELECT friends FROM users WHERE userid = %s;", (current_user_id,))
        result = cursor.fetchone()
        friends_list = result[0]

        if friends_list is None:
            friends_list = []
        else:
            friends_list = list(friends_list)

        if friend_user_id in friends_list:
            return jsonify({"message": "Friend already added", "status": 400}), 400

        # Add the friend's user ID to the friends list
        friends_list.append(friend_user_id)

        # Update the user's friends list in the database
        cursor.execute("UPDATE users SET friends = %s WHERE userid = %s;", (friends_list, current_user_id))
        conn.commit()

        return jsonify({"message": "Friend added successfully", "status": 200, "friend_id": friend_user_id}), 200

    except Exception as e:
        #print(f"Error adding friend: {e}")
        return jsonify({"message": "Failed to add friend", "error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Hello, World!"})

# --------------- Get friend function ----------------------------#

@app.route('/get_friends', methods=['POST'])
def get_friends():
    data = request.get_json()
    username = data.get('username')
    
    conn = None
    cursor = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First get the user's friends array
        cursor.execute(
            "SELECT friends FROM users WHERE username = %s;",
            (username,)
        )
        result = cursor.fetchone()
        
        if not result or not result[0]:
            return jsonify({"friends": [], "message": "No friends found"}), 200
            
        friend_ids = result[0]  # This is the array of friend IDs
        
        # Now get the usernames for all these IDs
        friend_ids_tuple = tuple(friend_ids)  # Convert list to tuple for SQL IN clause
        if len(friend_ids) == 1:
            # Special case for single ID to avoid SQL syntax error
            cursor.execute("SELECT username FROM users WHERE userid = %s", (friend_ids[0],))
        else:
            cursor.execute("SELECT username FROM users WHERE userid IN %s", (friend_ids_tuple,))
        
        friends = [row[0] for row in cursor.fetchall()]
        
        return jsonify({"friends": friends}), 200
        
    except Exception as e:
        #print(f"Error fetching friends: {e}")
        return jsonify({"message": "Failed to fetch friends", "error": str(e)}), 500
        
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/id-to-username', methods=['POST'])
def id_to_username():
    data = request.get_json()    
    ids = data.get('ids')
    if not ids:
        return jsonify({"message": "No IDs provided"}), 400
    usernames = []
    conn = None 
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        for id in ids:
            cursor.execute("SELECT username FROM users WHERE userid = %s;", (id,))
            result = cursor.fetchone()
            if result:
                usernames.append(result[0])
        return jsonify({"usernames": usernames}), 200
    except Exception as e:
        return jsonify({"message": "Failed to fetch usernames", "error": str(e)}), 500
# ----------------- Community Gallery Endpoints ----------------- #

@app.route('/upload_image', methods=['POST'])
def upload_image():
    """
    Endpoint to upload an image along with its metadata.
    Expects form-data with 'image' (file), 'title', 'description', and 'uploader'.
    """
    if 'image' not in request.files:
        return jsonify({"message": "No image part in the request"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    title = request.form.get('title')
    description = request.form.get('description')
    uploader = request.form.get('uploader')

    if not all([title, description, uploader]):
        return jsonify({"message": "Missing metadata"}), 400

    try:
        # Secure the filename
        filename = secure_filename(file.filename)
        # Read binary data
        binary_data = file.read()

        # Generate a unique ID for the image
        image_id = str(uuid.uuid4())

        # Insert into the database
        conn = get_db_connection()
        cursor = conn.cursor()

        insert_query = """
            INSERT INTO images (id, image_data, title, description, uploader)
            VALUES (%s, %s, %s, %s, %s);
        """
        cursor.execute(insert_query, (image_id, psycopg2.Binary(binary_data), title, description, uploader))
        conn.commit()

        return jsonify({"message": "Image uploaded successfully", "image_id": image_id}), 201

    except Exception as e:
        logger.error(f"Error uploading image: {e}", exc_info=True)
        return jsonify({"message": "Failed to upload image", "error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/gallery', methods=['GET'])
def get_gallery():
    """
    Endpoint to retrieve all images in the gallery.
    Supports optional search by title and uploader.
    Query Parameters:
        - title: (optional) string to search in image titles.
        - uploader: (optional) string to search by uploader's name.
        - page: (optional) integer for pagination (default=1).
        - limit: (optional) integer for items per page (default=10).
    Returns a list of images with metadata and Base64-encoded image data.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        title_search = request.args.get('title', '').strip()
        uploader_search = request.args.get('uploader', '').strip()
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit

        conditions = []
        params = []

        if title_search:
            conditions.append("title ILIKE %s")
            params.append(f"%{title_search}%")

        if uploader_search:
            conditions.append("uploader ILIKE %s")
            params.append(f"%{uploader_search}%")

        where_clause = ""
        if conditions:
            where_clause = "WHERE " + " AND ".join(conditions)

        select_query = sql.SQL("""
            SELECT id, image_data, title, description, uploader, timestamp
            FROM images
            {where_clause}
            ORDER BY timestamp DESC
            LIMIT %s OFFSET %s;
        """).format(where_clause=sql.SQL(where_clause))

        params.extend([limit, offset])

        cursor.execute(select_query, params)
        rows = cursor.fetchall()

        images = []
        for row in rows:
            image_id, image_data, title, description, uploader, timestamp = row
            base64_image = base64.b64encode(image_data).decode('utf-8')
            images.append({
                "id": image_id,
                "image": base64_image,
                "title": title,
                "description": description,
                "uploader": uploader,
                "timestamp": timestamp
            })

        count_query = sql.SQL("""
            SELECT COUNT(*) FROM images
            {where_clause};
        """).format(where_clause=sql.SQL(where_clause))

        cursor.execute(count_query, params[:-2])
        total_count = cursor.fetchone()[0]
        total_pages = (total_count + limit - 1) // limit

        return jsonify({
            "images": images,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "total_count": total_count
        }), 200

    except Exception as e:
        logger.error(f"Error retrieving gallery: {e}", exc_info=True)
        return jsonify({"message": "Failed to retrieve gallery", "error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# ----------------- End of Gallery Endpoints ----------------- #

if __name__ == '__main__':
    app.run(debug=True, port=8000)
