import React, { useEffect, useState } from 'react';
import './Gallery.css';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

function Gallery() {
  const [images, setImages] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchUploader, setSearchUploader] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const limit = 14; // Images per page

  const fetchImages = async (title = '', uploader = '', pageNumber = 1) => {
    setIsLoading(true);
    try {
      let apiUrl = `http://127.0.0.1:8000/gallery?page=${pageNumber}&limit=${limit}`;
      if (title) apiUrl += `&title=${encodeURIComponent(title)}`;
      if (uploader) apiUrl += `&uploader=${encodeURIComponent(uploader)}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorData = await response.json();
        enqueueSnackbar(`Error: ${errorData.message}`, { variant: 'error' });
        throw new Error(errorData.message);
      }

      const result = await response.json();
      console.log(`Fetched data for page ${pageNumber}:`, result);

      setImages(result.images);
      setPage(result.page);
      setTotalPages(result.total_pages);
    } catch (error) {
      console.error('Error fetching images:', error);
      enqueueSnackbar('Failed to fetch images.', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchImages(searchTitle, searchUploader, 1);
  };

  const handleNextPage = () => {
    if (page < totalPages && !isLoading) {
      const nextPage = page + 1;
      console.log('Next button clicked. Fetching page:', nextPage);
      fetchImages(searchTitle, searchUploader, nextPage);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1 && !isLoading) {
      const prevPage = page - 1;
      console.log('Previous button clicked. Fetching page:', prevPage);
      fetchImages(searchTitle, searchUploader, prevPage);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="gallery-container">
     <h2 className="gallery-header">Community Gallery</h2>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Search by uploader..."
          value={searchUploader}
          onChange={(e) => setSearchUploader(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="spinner" aria-hidden="true"></div>
            </>
          ) : (
            'Search'
          )}
        </button>
      </form>

      <div className="gallery-grid">
        {images.length > 0 ? (
          images.map((image) => (
            <div key={image.id} className="gallery-item">
              <img
                src={`data:image/png;base64,${image.image}`}
                alt={image.title}
                className="gallery-image"
              />
              <div className="gallery-info">
                <h3>{image.title}</h3>
                <p>{image.description}</p>
                <span>Uploaded by: {image.uploader}</span>
                <span>On: {new Date(image.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          !isLoading && <p>No images found.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="pagination-button"
            onClick={handlePreviousPage}
            disabled={page === 1 || isLoading}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="pagination-button"
            onClick={handleNextPage}
            disabled={page === totalPages || isLoading}
          >
            Next
          </button>
        </div>
      )}

      <button className="go-back-button" onClick={handleGoBack}>
        Go Back
      </button>
    </div>
  );
}

export default Gallery;
