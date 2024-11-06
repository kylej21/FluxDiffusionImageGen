import React from 'react';
import { Link } from 'react-router-dom';
import homeImage from './homeImage.png';
import galleryImage from './galleryImage.png';
import profileImage from './profileImage.png';
import generateImage from './generateImage.png';
import './navbar.css';

const Navbar = ({activated}) => {
  const links = [
    { path: "/", label: "Home", image: homeImage},
    { path: "/gallery", label: "Gallery", image: galleryImage},
    { path: "/profile", label: "Profile", image: profileImage},
    { path: "/generator", label: "Generator", image: generateImage}
  ];
  
  return (
    <nav>
      <div id="nav-links" className={activated ? 'active' : ''}>
        {links.map((link) => (
          <Link key={link.path} to={link.path} className="nav-link">
            <h2 className="nav-link-label rubik-font">{link.label}</h2>
            <img className="nav-link-image" src={link.image}/>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
