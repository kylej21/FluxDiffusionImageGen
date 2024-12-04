import React, { useEffect, useState } from 'react';

const ProfileFriend = ({ friendUsername }) => {
    const [friendImages, setFriendImages] = useState([]);
    const getRandomPastelColor = (username) => {
        const colors = {
            red: '#FFB3B3',
            orange: '#FFD9B3',
            yellow: '#FFFFB3',
            green: '#B3FFB3',
            blue: '#B3D9FF',
            indigo: '#B3B3FF',
            purple: '#D9B3FF',
        };

        // Use the username to consistently pick a color
        const colorKeys = Object.keys(colors);
        const index = username
            .toLowerCase()
            .charCodeAt(0) % colorKeys.length; // Map the first letter to a color index
        return colors[colorKeys[index]];
    };

    useEffect(() => {
        const fetchFriendImages = async () => {
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';
            const imagesPerPage = 10;

            try {
                const response = await fetch(`${backendUrl}/gallery?uploader=${friendUsername}&limit=${imagesPerPage}&page=1`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();

                if (response.ok) {
                    //console.log("here", response)
                    setFriendImages(data.images);
                } else {
                    console.error('Failed to fetch images:', data.message);
                }
            } catch (error) {
                console.error('Error fetching friend images:', error);
            }
        };

        if (friendUsername) {
            fetchFriendImages();
        }
    }, [friendUsername]);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md mx-auto w-screen h-screen">
            {/* Header */}
            <div className="flex flex-col items-start">
                <div
                    className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center text-black text-xl font-bold`}
                    style={{
                        backgroundColor: getRandomPastelColor(friendUsername),
                    }}
                >
                    {friendUsername.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-2xl font-bold mb-4">{friendUsername}</h1>
            </div>

            {/* Gallery */}
            <div className="grid grid-cols-3 gap-4">
                {friendImages.length > 0 ? (
                    friendImages.map((image, idx) => {
                        const bgColor = getRandomPastelColor(image.username || `default${idx}`);
                        // return each image block to render more effeciently
                        return (
                            <div
                                key={image.id || idx}
                                className="h-32 rounded overflow-hidden relative"
                                style={{ backgroundColor: bgColor }} 
                            >
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
                        );
                    })
                ) : (
                    <p className="col-span-3 text-center text-gray-500">No images uploaded yet.</p>
                )}
            </div>

        </div>
    );
};

export default ProfileFriend;
