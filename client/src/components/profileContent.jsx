import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, clearUser } from '../store/reducers/userReducer';

const ProfileContent = ({ user, images, friends, isOwnProfile }) => {
    const [activeTab, setActiveTab] = useState('recentImages'); // 'recentImages' or 'friends'
    const [friendUsername, setFriendUsername] = useState(''); // State for the search input
    const { username } = useParams();
    const { enqueueSnackbar } = useSnackbar(); // Access snackbar for notifications
    const location = useLocation();
    const dispatch = useDispatch();

    const storedUser = useSelector((state) => state.user.user); 
    const [updatedUsers, setUpdatedUsers] = useState([])
    const getRandomPastelColor = (username) => {
        const colors = {
            red: '#FFB3B3',
            orange: '#FFD9B3',
            yellow: '#FFFFB3',
            green: '#B3FFB3',
            blue: '#B3D9FF',
            indigo: '#B3B3FF',
            purple: '#D9B3FF',
            pink: '#FFCCE5',
            teal: '#B3FFF0',
            lavender: '#E6B3FF',
            peach: '#FFE5B3',
            mint: '#B3FFE0',
            skyBlue: '#B3E6FF',
            lime: '#D9FFB3',
            apricot: '#FFD9C2',
            coral: '#FFC2B3',
            periwinkle: '#C2B3FF',
        };
        
        
        // Use the username to consistently pick a color
        const colorKeys = Object.keys(colors);
        const index = username
            .toLowerCase()
            .charCodeAt(0) % colorKeys.length; // Map the first letter to a color index
        return colors[colorKeys[index]];
    };
    
    // redux store houses a list of IDs of friends. need to map them to usernames by fetching info
    const toNames = async () => {
        const backendUrl = 'http://127.0.0.1:8000/id-to-username';

        try {
            const response = await fetch(`${backendUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ids: storedUser.friends,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                return data.usernames
            } else {
                console.error('Failed to fetch friends:', data.message);
                enqueueSnackbar('Failed to fetch friends.', { variant: 'error', autoHideDuration: 3000 });
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
            enqueueSnackbar('An error occurred. Please try again.', { variant: 'error', autoHideDuration: 3000 });
        }
    }

    useEffect(() => {
        toNames().then((usernames) => {
            setUpdatedUsers(usernames)
        })
    }, [storedUser.friends])

    // Function to search and add a friend
    const handleSearchFriend = async () => {
        if (!friendUsername) {
            enqueueSnackbar('Please enter a username to search.', { variant: 'error', autoHideDuration: 3000 });
            return;
        }

        const backendUrl = 'http://127.0.0.1:8000';

        try {
            const response = await fetch(`${backendUrl}/add-friend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: user?.name,
                    friend_username: friendUsername,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                enqueueSnackbar('Friend added successfully!', { variant: 'success', autoHideDuration: 3000 });
                setUpdatedUsers((prevUsers) => [...prevUsers, friendUsername]);
                
            } else {
                enqueueSnackbar(data.message || 'Failed to add friend.', { variant: 'error', autoHideDuration: 3000 });
            }
        } catch (error) {
            console.error('Error searching friend:', error.message || error);
            enqueueSnackbar('An error occurred. Please try again.', { variant: 'error', autoHideDuration: 3000 });
        }
    };

    useEffect(() => {
        setActiveTab('recentImages');
    }, [location.pathname]);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md mx-auto w-screen h-screen">
            {/* Profile Header */}
            <div className="flex flex-col items-start">
                <div
                    className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center text-black text-xl font-bold`}
                    style={{
                        backgroundColor: getRandomPastelColor(user.name),
                    }}
                >
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-2xl font-bold mb-4">{user.name}</h1>
                    

                {/* Search for Friend */}
                {isOwnProfile === true && activeTab === 'friends' && (
                    <div className="flex items-center w-full mb-6">
                        <input
                            type="text"
                            placeholder="Search to add friends..."
                            value={friendUsername}
                            onChange={(e) => setFriendUsername(e.target.value)}
                            className="p-2 border border-gray-300 rounded flex-1"
                        />
                        <button
                            onClick={handleSearchFriend}
                            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Add Friend
                        </button>
                    </div>
                )}
            </div>
            <div className=" border-gray-200 mb-4">
            {/* Button to navigate to own profile */}
            
            {!isOwnProfile && (
                <>
                <Link to={`/profile`} >
                    <button
                        className="px-4 py-2 font-semibold text-gray-500 border border-gray-300 rounded-md hover:bg-gray-200 transition duration-200"
                    >
                        Go back to my profile
                    </button>
                 </Link>
                 </>
            )}
            </div>
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-4">
                <button
                    className={`px-4 py-2 font-semibold ${activeTab === 'recentImages' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('recentImages')}
                >
                    Recent Images
                </button>
                {isOwnProfile && (
                    <button
                        className={`px-4 py-2 font-semibold ${activeTab === 'friends' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('friends')}
                    >
                        Friends
                    </button>
                )}

            </div>
            
            {/* Tab Content */}
            <div className="grid grid-cols-3 gap-4">
                {activeTab === 'recentImages' && (
                    <div className="col-span-3 h-[400px] overflow-y-auto">
                        <div className="grid grid-cols-3 gap-4">
                            {images && images.length > 0 ? (
                                images.map((image, idx) => (
                                    <div key={image.id || idx} className="h-80 w-full bg-gray-200 rounded overflow-hidden relative">
                                        {image.image ? (
                                            <img
                                                src={`data:image/jpeg;base64,${image.image}`}
                                                alt={image.title || `Image ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex justify-center items-center">
                                                Image {idx + 1}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="col-span-3 text-center text-gray-500">No images uploaded yet.</p>
                            )}
                        </div>
                    </div>
                )}
                {isOwnProfile === true && activeTab === 'friends' && (
                    <div className="col-span-3 h-[400px] overflow-y-auto"> {/* Grid wrapper for friends */}
                        <div className="grid grid-cols-3 gap-4"> {/* Maintain 3 columns per row */}
                            {updatedUsers && updatedUsers.length > 0 ? (
                                updatedUsers.map((friend, idx) => {
                                    const bgColor = getRandomPastelColor(friend);
                                    return (
                                        <Link
                                            to={`/profile/${friend}`}
                                            key={idx}
                                            className="h-32 rounded flex justify-center items-center text-black font-bold hover:opacity-90"
                                            style={{ backgroundColor: bgColor }}
                                        >
                                            {friend}
                                        </Link>
                                    );
                                })
                            ) : (
                                <p className="col-span-3 text-center text-gray-500">No friends listed.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileContent;
