import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import './profile.css';
import './home.css';
import NavButton from './navbutton.jsx';
import ProfileContent from './profileContent';

const Profile = () => {
    const { username } = useParams(); // Get the username from the URL
    const [navBarOpen, setNavBarOpen] = useState(false);
    const [externalUser, setExternalUser] = useState(null);
    const [userImages, setUserImages] = useState([]);
    const [friends, setFriends] = useState([]);
    const user = useSelector((state) => state.user.user); // Access logged-in user
    const [isOwnProfile, setIsOwnProfile] = useState(false);


    // Function to fetch images
    const fetchUserImages = async (targetUsername) => {
        const imagesPerPage = 10; // Adjust as needed
        try {
            //console.log("this is: ", targetUsername);
            const response = await fetch(`http://127.0.0.1:8000/gallery?uploader=${targetUsername}&limit=${imagesPerPage}&page=1`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                //console.log('Fetched Images Data:', data.images);
                setUserImages(data.images); // Store the fetched images in state
            } else {
                console.error('Failed to fetch images:', data.message);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    // function to fetch friends
    const fetchFriends = async (targetUsername) => {
        //console.log("getting friends of ", targetUsername);
        try {
            // First get the user's data to get their friends array
            const response = await fetch(`http://127.0.0.1:8000/get_friends`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: targetUsername
                })
            });
            
            const data = await response.json();
            if (response.ok) {
                setFriends(data.friends);
                //console.log('Fetched Friends:', data.friends);
            } else {
                console.error('Failed to fetch friends:', data.message);
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const isOwn = (tabname, loginname) => {
        if(user?.name){
            setIsOwnProfile(tabname === loginname);
            if(!username){
                setIsOwnProfile(true);
            }/*
            console.log("check own: ", isOwnProfile);
            console.log("username is: ", tabname);
            console.log("user.name is: ", loginname);
            */
        }
        else{
            setIsOwnProfile(false);
        }
    }

    
    useEffect(() => {
        isOwn(username, user.name);
        if (username) {
            //console.log("username: " + username);
            setExternalUser({ id: 1, name: username, friends: [1, 3, 7] });
            fetchUserImages(username); // Fetch images for external user
            //console.log("useImages: ", userImages);
        } else if (user?.name) {
            //console.log("name of user: " + user.name);
            fetchUserImages(user.name); // Fetch images for logged-in user
            fetchFriends(user.name); // Add this line
            //console.log(userImages);
            //console.log(friends);
        }
        else{
            //console.log("not ready yet");
        }
    }, [username, user?.name]); 

    if (username && externalUser) {
        //console.log("passing")
        return (
            <div className="profile-div" data-nav={navBarOpen.toString()}>
                <ProfileContent user={externalUser} isOwnProfile={isOwnProfile} images = {userImages} friends = {friends}/>
                <NavButton classname="nav-section" setNavBarOpen={setNavBarOpen} navBarOpen={navBarOpen} />
            </div>
        );
    }

    // Show the logged-in user's profile if no username is specified
    if (!username && (!user || user.id === null)) {
        return (
            <div className="profile-div" data-nav={navBarOpen.toString()}>
                <main
                    className="w-full h-screen bg-cover bg-center bg-no-repeat flex justify-center items-center custom-main1">
                    <h1 className="font-roboto text-white m-0 font-medium uppercase text-4xl sm:text-5xl lg:text-6xl xl:text-4xl absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-auto text-shadow text-center">
                        Please Login
                    </h1>
                </main>
                <NavButton classname="nav-section" setNavBarOpen={setNavBarOpen} navBarOpen={navBarOpen} />
            </div>
        );
    }


    // Default: Show the logged-in user's profile
    return (
        <div className="profile-div bg-white w-full" data-nav={navBarOpen.toString()}>
            <ProfileContent user={user} images={userImages} friends={friends} isOwnProfile={isOwnProfile}/>
            <NavButton classname="nav-section" setNavBarOpen={setNavBarOpen} navBarOpen={navBarOpen} />
        </div>
    );
};

export default Profile;
