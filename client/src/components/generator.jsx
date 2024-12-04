// client/src/components/Generator.jsx

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import NavButton from './navbutton.jsx';
import './generator.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faTrash, faArrowDown, faImages } from '@fortawesome/free-solid-svg-icons';

const Generator = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [navBarOpen, setNavBarOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const user = useSelector((state) => state.user.user);

  const { enqueueSnackbar } = useSnackbar();


  /**
   * Handles the form submission to generate an image based on the prompt.
   * @param {Event} event - The form submission event.
   */
  const handleForm = async (event) => {
    event.preventDefault();
    setLoading(true);
    setUploadStatus('');

    try {
      // Send the prompt to the backend to generate the image
      const response = await fetch('http://127.0.0.1:8000/prompt_recv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        console.error("HTTP error:", response.status);
        setUploadStatus('Failed to generate image. Please try again.');
        enqueueSnackbar('Failed to generate image. Please try again.', { variant: 'error', autoHideDuration: 3000 });
        setLoading(false);
        return;
      }

      const image_recv = await response.json();
      const imageData = `data:image/png;base64,${image_recv.image}`;
      setGeneratedImage(imageData);
 
      enqueueSnackbar('Image generated successfully!', { variant: 'success', autoHideDuration: 3000 });
    } catch (error) {
      console.error("Error generating image:", error);
      setUploadStatus('An error occurred while generating the image.');
      enqueueSnackbar('An error occurred while generating the image.', { variant: 'error', autoHideDuration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the upload of the generated image to the backend.
   * This function is triggered when the user clicks the "Upload to Gallery" button.
   */
  const uploadImage = async () => {
    if (!generatedImage) {
      setUploadStatus('No image to upload.');
      enqueueSnackbar('No image to upload.', { variant: 'warning', autoHideDuration: 3000 });
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading...');

    try {
      const blob = dataURLtoBlob(generatedImage);
      const file = new File([blob], `generated_${Date.now()}.png`, { type: 'image/png' });

      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', prompt.trim().substring(0, 30));
      formData.append('description', prompt);

      if (user && user.name) {
        formData.append('uploader', user.name);
      } else {
        formData.append('uploader', 'Anonymous');
      }

      const backendUrl = "http://127.0.0.1:8000";

      const response = await fetch(`${backendUrl}/upload_image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = `Upload failed: ${errorData.message || 'Unknown error.'}`;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        console.error("Upload failed:", errorMessage);
        setUploadStatus(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error', autoHideDuration: 3000 });
        return;
      }

      const result = await response.json();
      setUploadStatus('Upload successful!');
      enqueueSnackbar('Image uploaded successfully!', { variant: 'success', autoHideDuration: 3000 });

    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadStatus('An error occurred during upload.');
      enqueueSnackbar('An error occurred during upload.', { variant: 'error', autoHideDuration: 3000 });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  /**
   * Utility function to convert a data URL to a Blob object.
   * @param {string} dataurl - The data URL to convert.
   * @returns {Blob} - The resulting Blob object.
   */
  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  return (
    <div className="generator-div" data-nav={navBarOpen.toString()}>
      <main className="main-generator">
        {/* Page Titles */}
        <h1 className="title1">Create</h1>
        <h2 className="title2">Without</h2>
        <h2 className="title3">Limits</h2>
        <h2 className="title4">Be Free</h2>
        <div className="imagebar" />
        <div className="centered-bar"></div>

        {/* Prompt Input Form */}
        {!loading && !generatedImage && (
          <form onSubmit={handleForm} method="POST">
            <input
              className="input-text"
              name="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What do you want to generate?"
              required
            />
            <button className="submit-button" type="submit">
              <FontAwesomeIcon className="submit-icon" icon={faPaperPlane} />
            </button>
          </form>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="loading-container">
            <div className="loading-overlay"></div>
            <div className="loading-indicator"></div>
            <h1 className="loading-text">Your Image is being generated, please wait</h1>
          </div>
        )}

        {/* Generated Image Modal */}
        {generatedImage && !loading && (
          <div className="modal-overlay">
            <h2 className="modal-title">Image has been generated</h2>
            <img
              src={generatedImage}
              alt="Generated"
              className="max-w-full max-h-full"
            />
            {/* Download Button */}
            <a href={generatedImage} download="generated-image.png">
              <button className="download-button">
                <FontAwesomeIcon className="download-icon" icon={faArrowDown} />
              </button>
              <h2 className="download-tooltip">Download</h2>
            </a>

            {/* Upload to Gallery Button */}
            <button
              className='gallery-button'
              onClick={uploadImage}
              disabled={uploading}
            >
              <FontAwesomeIcon className="gallery-icon" icon={faImages} />
            </button>
            <h2 className="gallery-tooltip">
              {uploading ? 'Uploading...' : 'Upload to Gallery'}
            </h2>

            {/* Display Upload Status */}
            {uploadStatus && (
              <div className={`upload-status ${uploadStatus.includes('failed') ? 'error' : ''}`}>
                {uploadStatus}
              </div>
            )}

            {/* Discard Image Button */}
            <button
              className="discard-button"
              onClick={() => {
                setGeneratedImage(null);
                setUploadStatus('');
              }}
            >
              <FontAwesomeIcon className="discard-icon" icon={faTrash} />
            </button>
            <h2 className="discard-tooltip">Discard Image</h2>
          </div>
        )}
      </main>

      {/* Navigation Button */}
      {!generatedImage && (
        <NavButton classname="nav-section" setNavBarOpen={setNavBarOpen} navBarOpen={navBarOpen} />
      )}
    </div>
  );
};

export default Generator;
