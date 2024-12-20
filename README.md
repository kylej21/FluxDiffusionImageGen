# FluxDiffusionImageGen
Full-Stack application with python + flask + pytorch backend, react + JS frontend + tailwind CSS

# Acknowledgments
  The backend diffusion model is from: https://github.com/rupeshs/fastsdcpu

# Getting Started
First, clone the repo:
```git clone git@github.com:kylej21/FluxDiffusionImageGen.git```
or 
```git clone https://github.com/kylej21/FluxDiffusionImageGen.git```

Next, fill out .env variables with generated keys and authentication tokens. Refer to the .env.example files
which show where each .env file should go, and what variable names they must have. 

For the frontend .env, put the url that your backend will be running on: http://127.0.0.1:8000/

For the backend .env, since the keys are all secure, you will need to generate your own values.

We used Supabase for our database so to replicate this you will need to go to their page and setup a cloud DB
1. Go to supabase.com and sign up for an account.
2. Create a project
3. Navigate to the SQL editor tab
4. In the SQL query input prompt, run the 2 following queries.
```
CREATE TABLE users (
    userid SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    friends INT[]
);
```
then,
```
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_data BYTEA NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    uploader TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```
5. In supabase, go to the home tab, find and click the green connect button, and find the connection string.
This is where you will find your .env values. 
For DB_HOST, put the aws link ending in supabase.com  
For DB_NAME, put postgres
For DB_USER, put the postgres.username, which comes right after the :// until the : at the start of the connection string
For DB_PASSWORD, put whatever you chose to be your password

Next, for DB_API_KEY, you will have to X out of the Connect pop up, and scroll down on the home page. There will be a section
that gives you an API Key, just copy paste this. 
*Note: There may not be an API Key available if you didn't enable RLS*

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
