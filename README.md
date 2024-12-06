# FluxDiffusionImageGen
Full-Stack application with python + flask + pytorch backend, react + JS frontend + tailwind CSS

# Acknowledgments
  The backend diffusion model is from: https://github.com/rupeshs/fastsdcpu

# Getting Started
Currently, the project has basic react and flask implementation. You will need a seperate terminal to run server and client

1. ```cd client```
2. ```npm install```
3. ```npm start```

In a seperate terminal:

1. ```cd server```
2. ```python3.11 -m venv venv```
3. ```source venv/bin/activate```
4. ```pip install -r requirements.txt```
5. ```python main.py```

You can see the frontend in http://localhost:3000/ , and the backend at http://127.0.0.1:8000/

# To Do:
1. Come up with frontend design
2. Setup flask endpoints for backend
3. Decide on Database option (SQLite, MongoDB, something else online)
4. Login/Logout features
5. 2 other features
6. Ale + Kyle setup Image generation pipeline through backend
