
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Navigation from './Navigation';
import { deleteCelebrity } from '../services/api'; // Adjust path if needed
import { deleteContentById } from '../services/api'; // Adjust path if needed

import { checkContentExists, addContent, addCelebrity,addSeries,searchContent,searchCelebrities,searchAwards,validateCelebrities,updateContent,updateAward,updateCelebrity,addAward,deleteAwardById,getSeriesDetails,updateSeries } from '../services/api';
import { checkCelebrityExists,checkAwardExists } from '../services/api';
import { addCelebrityImages, addContentImages } from '../services/api'; // Adjust path if needed

//neew thing hereeeeeeeeeeeeee



import { getAllContent, getAllCelebrities, getAllAwards } from '../services/api';


import { updateProfile } from '../services/api';
import { getUserDetails } from '../services/api';
//import { updateSeries } from '../services/api';

//import AdminMovieSection from './AdminMovieSelection'
//import AdminCelebritySection from './AdminCelebritySection';


const formatContentData = (content) => {
  return content.map(item => ({
    id: item.id,
    title: item.title,
    type: item.type,
    year: item.release_date?.split('-')[0] || 'N/A',
    rating: item.rating || 'N/A',
    poster: item.poster_url
  }));
};


const AdminDashboard = ({ currentUser = null }) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('celebrity');
  const [viewMode, setViewMode] = useState('card'); 
  //new things hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee

  const [loading, setLoading] = useState(true);


  const [contentData, setContentData] = useState([]);
  const [celebrityListData, setCelebrityListData] = useState([]);
  const [awardListData, setAwardListData] = useState([]);

  //tilll nowwwwwwwwwwwwwwwwwwwwwwwww

  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [showAddCelebrityModal, setShowAddCelebrityModal] = useState(false);
  const [showAddAwardModal, setShowAddAwardModal] = useState(false);
  const [showAddSeriesModal, setShowAddSeriesModal] = useState(false);
  //const [showAddAwardModal, setShowAddAwardModal] = useState(false);

  const [showEditContentModal, setShowEditContentModal] = useState(false);  
const [showEditCelebrityModal, setShowEditCelebrityModal] = useState(false);  
const [showEditAwardModal, setShowEditAwardModal] = useState(false);  
const [editingItem, setEditingItem] = useState(null); 


// // Episode modal states  
// const [showEpisodeModal, setShowEpisodeModal] = useState(false);  
// const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0);  
// const [episodes, setEpisodes] = useState([]);  
  
// Image URL states  
const [contentImageUrls, setContentImageUrls] = useState('');  
const [celebrityImageUrls, setCelebrityImageUrls] = useState('');  
const [seriesImageUrls, setSeriesImageUrls] = useState('');  
const [seasonPosters, setSeasonPosters] = useState({});  
const [showEditSeriesModal, setShowEditSeriesModal] = useState(false);  
  
// Series edit state  
const [isEditingSeries, setIsEditingSeries] = useState(false);

  // Search states  
const [searchQuery, setSearchQuery] = useState('');  
const [searchResults, setSearchResults] = useState([]);  
const [isSearching, setIsSearching] = useState(false);   



  const [adminEditing, setAdminEditing] = useState(false);
  const [showAdminDetails,setShowAdminFormDetails]=useState(false);
  const [adminFormData, setAdminFormData] = useState({
    username: '',
    bio: '',
   // profile_picture_url: ''
  });



  const [movieData, setMovieData] = useState({
    title: '',
    description: '',
    release_date: '',
    duration: '',
    poster_url: '',
    trailer_url: '',
    budget: '',
    box_office_collection: '',
    currency_code: '',
    min_age: '',
    views: '',
    country: '',
    language: '',
    genres: '',
    top_cast: '',
    //producer: '',
    //writer: '',
    directors: '',
    awards: '',
    // plot: '',
    type: 'Movie' // Default type, can be changed in the form
  });



  const [seriesData, setSeriesData] = useState({  
    title: '',  
    description: '',  
    release_date: '',  
    duration: '',  
    poster_url: '',  
    trailer_url: '',  
    budget: '',  
    box_office_collection: '',  
    currency_code: '',  
    min_age: '',  
    views: '',  
    country: '',  
    language: '',  
    genres: '',  
    top_cast: '',  
    directors: '',  
    awards: '',  
    type: 'Series',  
    season_count: 1  
  });  
    
  const [seasons, setSeasons] = useState([{  
    season_number: 1,  
    season_name: '',  
    description: '',  
    episode_count: '',  
    release_date: '',  
    trailer_url: ''  ,
    poster_url: '' // Add poster_url for each season
  }]);




  //newwwwww thingsssssssssssssssssssssssssssssssssssssssssssssssssss





  //end hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee

  const [celebrityData, setCelebrityFormData] = useState({
    name: '',
    bio: '',
    birth_date: '',
    death_date: '',
    profession: '', // Assuming profession is a string
    place_of_birth: '',
    gender: '',
    photo_url: '',
    //profession: ''
  });

  const [awardData, setAwardFormData] = useState({
    name: '',
    year: '',
    type: ''
  });

  // new code from hereeeeeeeeeeeeeeeeeeee 
  //
  //hereeeeeeee 
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const content = await getAllContent();
        setContentData(formatContentData(content));

        console.log('Fetched content data:', content);

        // Check each item's ID
        content.forEach((item, index) => {
          console.log(`Content[${index}] → content_id:`, item.content_id, '| id:', item.id);
        });



        const celebrities = await getAllCelebrities();
        setCelebrityListData(celebrities);

        const awards = await getAllAwards();
        setAwardListData(awards);

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      }
    };

    fetchAll();
  }, []);

  useEffect(() => {  
    const fetchAdminDetails = async () => {  
      if (!currentUser?.user_id) return;  
        
      try {  
        const userData = await getUserDetails(currentUser.user_id);  
        setAdminFormData({  
          username: userData.username || '',  
          bio: userData.bio || '',  
          email: userData.email || '',  
          //profile_picture_url: userData.profile_picture_url || '',  
          //phone: userData.phone || '',  
          //official_mail: userData.official_mail || ''  
        });  
        console.log("User Data:", userData);  
      } catch (err) {  
        console.error("Failed to fetch admin details:", err);  
      }  
    };  
    
    fetchAdminDetails();  
  }, [currentUser?.user_id]); 


  // Clear search when switching tabs  
useEffect(() => {  
  setSearchQuery('');  
  setSearchResults([]);  
  setIsSearching(false);  
}, [activeTab]);  




  //till now  llllllllllllllllllllllllllllllllllllllllllllllllllll


  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovieData(prev => ({ ...prev, [name]: value }));
  };

  const handleCelebrityChange = (e) => {
    const { name, value } = e.target;
    setCelebrityFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAwardChange = (e) => {
    const { name, value } = e.target;
    setAwardFormData(prev => ({ ...prev, [name]: value }));
  };

  // ADD ADMIN PROFILE CHANGE HANDLER  
  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminFormData(prev => ({ ...prev, [name]: value }));
  };

  // ADD ADMIN PROFILE SAVE HANDLER  
  const handleAdminSave = async () => {  
    try {  
      const updateData = {  
        username: adminFormData.username,  
        bio: adminFormData.bio,  
        //profile_picture_url: adminFormData.profile_picture_url  
      };  
    
      // Add admin-specific fields if user is admin  
      if (currentUser.role === 'admin') {  
        updateData.phone = adminFormData.phone;  
        updateData.official_mail = adminFormData.official_mail;  
      }  
    
      await updateProfile(currentUser.user_id, updateData);  
      setAdminEditing(false);  
      alert('Profile updated successfully!');  
    } catch (err) {  
      console.error('Error updating admin profile:', err);  
      alert('Failed to update profile. Please try again.');  
    }  
  };






  const processStringToArray = (str) => {
    if (!str || str.trim() === '') return [];
    return str.split(',').map(item => item.trim()).filter(item => item !== '');
  };
  /// so , 


  const validateCelebrityInput = (celebrity) => {
    const requiredFields = ['name', 'bio', 'birth_date', 'place_of_birth', 'gender', 'photo_url', 'profession'];

    for (let field of requiredFields) {
      if (!celebrity[field] || celebrity[field].toString().trim() === '') {
        return `${field} is required.`;
      }
    }

    if (!celebrity.death_date || celebrity.death_date.toString().trim() === '') {
      celebrity.death_date = null;
    }

    if (celebrity.death_date && new Date(celebrity.death_date) < new Date(celebrity.birth_date)) {
      return 'Death date cannot be before birth date.';
    }

    return null;
  };



  const validateMovieInput = (movie) => {
    const requiredFields = [
      'title', 'description', 'release_date', 'type', 'duration',
      'poster_url', 'trailer_url', 'budget', 'box_office_collection',
      'currency_code', 'min_age', 'country', 'language' // ✅ Added new required fields
    ];

    for (let field of requiredFields) {
      if (!movie[field] || movie[field].toString().trim() === '') {
        return `${field} is required.`;
      }
    }



    if (!movie.genres || movie.genres.trim() === '') {
      return 'At least one genre is required.';
    }
    if (!movie.top_cast || movie.top_cast.trim() === '') {
      return 'At least one cast member is required.';
    }
    if (!movie.directors || movie.directors.trim() === '') {
      return 'At least one director is required.';
    }

    // Type-specific checks  
    if (!['Movie', 'Series', 'Documentary'].includes(movie.type)) {
      return 'Invalid content type.';
    }
    if (isNaN(Number(movie.duration)) || movie.duration <= 0) {
      return 'Duration must be a positive number.';
    }
    if (isNaN(Number(movie.budget)) || isNaN(Number(movie.box_office_collection))) {
      return 'Budget and Box Office must be valid numbers.';
    }
    if (isNaN(Number(movie.min_age)) || movie.min_age < 0 || movie.min_age > 21) {
      return 'Minimum age must be between 0 and 21.';
    }

    if (isNaN(Number(movie.views)) || movie.views < 0) {
      return 'Views must be a non-negative number.';
    }

    return null; // ✅ Valid  
  };


  
  
const validateAwardInput = (award) => {  
  const requiredFields = ['name', 'year', 'type'];  
    
  for (let field of requiredFields) {  
    if (!award[field] || award[field].toString().trim() === '') {  
      return `${field} is required.`;  
    }  
  }  
    
  const currentYear = new Date().getFullYear();  
  if (isNaN(Number(award.year)) || award.year < 1900 || award.year > currentYear + 5) {  
    return 'Year must be between 1900 and ' + (currentYear + 5);  
  }  
    
  return null;  
};  

  const convertToISODate = (dateString) => {
    return dateString || null;
  };



  const handleSubmit = async (e) => {  
  e.preventDefault();  
  
  const error = validateMovieInput(movieData);  
  if (error) {  
    alert(`Validation Error: ${error}`);  
    return;  
  }  
  
  try {    
    console.log('Movie data to be added:', movieData);    
      
    const exists = await checkContentExists(movieData.title, movieData.release_date, movieData.type);    
    if (exists) {    
      alert('Content with the same title, release date and type already exists.');    
      return;    
    }    
      
    // Validate celebrities and their roles    
    const validation = await validateCelebrities(    
      processStringToArray(movieData.directors),    
      processStringToArray(movieData.top_cast)    
    );    
        
    // Block if any celebrities are missing    
    if (validation.missingCelebrities.length > 0) {    
      let message = 'Cannot add content. The following celebrities are not in the database:\n\n';    
      validation.missingCelebrities.forEach(item => {    
        message += `- ${item.name} (needed as ${item.role})\n`;    
      });    
      message += '\nPlease add these celebrities to the Celebrity section first.';    
          
      alert(message);    
      return;    
    }    
        
    // Show success message for automatically created roles    
    if (validation.rolesCreated.length > 0) {    
      let message = 'The following roles were automatically created:\n\n';    
      validation.rolesCreated.forEach(item => {    
        message += `- ${item.name} → ${item.role}\n`;    
      });    
      message += '\nContent will be added successfully.';    
          
      alert(message);    
    }   
  
    const reorderedMovieData = {  
      title: movieData.title,  
      description: movieData.description,  
      release_date: convertToISODate(movieData.release_date),  
      type: movieData.type,  
      duration: Number(movieData.duration),  
      poster_url: movieData.poster_url,  
      trailer_url: movieData.trailer_url,  
      budget: Number(movieData.budget),  
      box_office_collection: Number(movieData.box_office_collection),  
      currency_code: movieData.currency_code,  
      min_age: Number(movieData.min_age),  
      views: Number(movieData.views),  
      country: movieData.country,  
      language: movieData.language,  
      genres: processStringToArray(movieData.genres),  
      top_cast: processStringToArray(movieData.top_cast),  
      directors: processStringToArray(movieData.directors),  
      awards: processStringToArray(movieData.awards),  
    };  
  
    // ✅ FIXED: Get the content result with ID  
    const contentResult = await addContent(reorderedMovieData);  
    console.log('Content added result:', contentResult);  
      
    // Refresh the content list first  
    const updatedContentData = await getAllContent();  
    setContentData(formatContentData(updatedContentData));  
  
    // Handle additional movie images if provided    
    if (contentImageUrls && contentImageUrls.trim() && contentResult.content_id) {    
      try {    
        await addContentImages(contentResult.content_id, contentImageUrls);    
        console.log('✅ Additional images added successfully');  
      } catch (err) {    
        console.error('Error adding movie images:', err);    
        alert('Movie added but failed to add additional images.');  
      }    
    }  
  
    alert('Movie added successfully!');  
    setShowAddMovieModal(false);  
  
    // Reset form  
    setMovieData({  
      title: '',  
      description: '',  
      release_date: '',  
      duration: '',  
      poster_url: '',  
      trailer_url: '',  
      budget: '',  
      box_office_collection: '',  
      currency_code: '',  
      min_age: '',  
      views: '',  
      country: '',  
      language: '',  
      genres: '',  
      top_cast: '',  
      directors: '',  
      awards: '',  
      type: 'Movie'  
    });  
  
    setContentImageUrls('');  
      
  } catch (err) {  
    console.log('Error adding movie:', err);  
    console.error('Add Movie Failed:', err);  
    alert('Failed to add movie. Please try again.');  
  }  
};




  //celebrity form submitting 

  const handleCelebritySubmit = async (e) => {  
  e.preventDefault();  
  
  const error = validateCelebrityInput(celebrityData);  
  if (error) {  
    alert(`Validation Error: ${error}`);  
    return;  
  }  
  
  try {  
    console.log('Celebrity data to be added:', celebrityData);  
  
    const exists = await checkCelebrityExists(celebrityData.name, celebrityData.birth_date);  
    if (exists) {  
      alert('Celebrity with this name and birth date already exists.');  
      return;  
    }  
      
    // ✅ FIXED: Get the celebrity result with ID  
    const celebrityResult = await addCelebrity(celebrityData);  
    console.log('Celebrity added result:', celebrityResult);  
  
    // Refresh celebrity data first  
    const updatedCelebrities = await getAllCelebrities();  
    setCelebrityListData(updatedCelebrities);  
  
    // Handle additional celebrity images if provided    
    if (celebrityImageUrls && celebrityImageUrls.trim() && celebrityResult.celebrity_id) {    
      try {    
        await addCelebrityImages(celebrityResult.celebrity_id, celebrityImageUrls);    
        console.log('✅ Additional celebrity images added successfully');  
      } catch (err) {    
        console.error('Error adding celebrity images:', err);    
        alert('Celebrity added but failed to add additional images.');  
      }    
    }    
  
    alert('Celebrity added successfully!');  
    setCelebrityFormData({  
      name: '',  
      bio: '',  
      birth_date: '',  
      death_date: '',  
      place_of_birth: '',  
      gender: '',  
      photo_url: '',  
      profession: ''  
    });  
  
    setCelebrityImageUrls('');  
    setShowAddCelebrityModal(false);  
  } catch (err) {  
    console.error('Error adding celebrity:', err);  
    alert('Failed to add celebrity.');  
  }  
};  



  const handleAwardSubmit = async (e) => {  
  e.preventDefault();  
    
  const error = validateAwardInput(awardData);  
  if (error) {  
    alert(`Validation Error: ${error}`);  
    return;  
  }  
    
  try {  
    console.log('Award data to be added:', awardData);  
      
    // Check if award already exists using API  
    const exists = await checkAwardExists(awardData.name, awardData.year);  
      
    if (exists) {  
      alert('Award with this name and year already exists.');  
      return;  
    }  
      
    await addAward(awardData);  
      
    // Refresh award data  
    const updatedAwards = await getAllAwards();  
    setAwardListData(updatedAwards);  
      
    alert('Award added successfully!');  
    setAwardFormData({  
      name: '',  
      year: '',  
      type: ''  
    });  
    setShowAddAwardModal(false);  
  } catch (err) {  
    console.error('Error adding award:', err);  
    alert('Failed to add award.');  
  }  
};  



const handleEditItem = async (item, type) => {    
  setEditingItem({ ...item, type });    
      
  if (type === 'content') {    
    // Check if it's a series to determine which modal to show  
    if (item.type === 'Series') {  
      setIsEditingSeries(true);  
        
      // Fetch series data including seasons  
      try {  
        const seriesDetails = await getSeriesDetails(item.id);  
        setSeriesData({  
          title: seriesDetails.title || '',  
          description: seriesDetails.description || '',  
          release_date: seriesDetails.release_date ? seriesDetails.release_date.split('T')[0] : '',  
          duration: seriesDetails.duration || '',  
          poster_url: seriesDetails.poster_url || '',  
          trailer_url: seriesDetails.trailer_url || '',  
          budget: seriesDetails.budget || '',  
          box_office_collection: seriesDetails.box_office_collection || '',  
          currency_code: seriesDetails.currency_code || '',  
          min_age: seriesDetails.min_age || '',  
          views: seriesDetails.views || '',  
          country: seriesDetails.country || '',  
          language: seriesDetails.language || '',  
          genres: Array.isArray(seriesDetails.genres) ? seriesDetails.genres.join(', ') : '',  
          top_cast: Array.isArray(seriesDetails.top_cast) ? seriesDetails.top_cast.join(', ') : '',  
          directors: Array.isArray(seriesDetails.directors) ? seriesDetails.directors.join(', ') : '',  
          awards: Array.isArray(seriesDetails.awards) ? seriesDetails.awards.join(', ') : '',  
          type: 'Series',  
          season_count: seriesDetails.seasons?.length || 1  
        });  
          
        if (seriesDetails.seasons) {  
          setSeasons(seriesDetails.seasons);  
        }  
          
        setShowEditSeriesModal(true);  
      } catch (err) {  
        console.error('Error fetching series details:', err);  
        alert('Failed to load series details');  
      }  
    } else {  
      // Regular movie/documentary edit  
      setMovieData({    
        title: item.title || '',    
        description: item.description || '',    
        release_date: item.release_date ? item.release_date.split('T')[0] : '',    
        duration: item.duration || '',    
        poster_url: item.poster || item.poster_url || '',    
        trailer_url: item.trailer_url || '',    
        budget: item.budget || '',    
        box_office_collection: item.box_office_collection || '',    
        currency_code: item.currency_code || '',    
        min_age: item.min_age || '',    
        views: item.views || '',    
        country: item.country || '',    
        language: item.language || '',    
        genres: Array.isArray(item.genres) ? item.genres.join(', ') : (item.genres || ''),    
        top_cast: Array.isArray(item.top_cast) ? item.top_cast.join(', ') : (item.top_cast || ''),    
        directors: Array.isArray(item.directors) ? item.directors.join(', ') : (item.directors || ''),    
        awards: Array.isArray(item.awards) ? item.awards.join(', ') : (item.awards || ''),    
        type: item.type || 'Movie'    
      });    
      setShowEditContentModal(true);    
    }  
  } else if (type === 'celebrity') {    
    setCelebrityFormData({    
      name: item.name || '',    
      bio: item.bio || '',    
      birth_date: item.birth_date ? item.birth_date.split('T')[0] : '',    
      death_date: item.death_date ? item.death_date.split('T')[0] : '',    
      profession: Array.isArray(item.roles) ? item.roles.join(', ') : (item.profession || ''),    
      place_of_birth: item.place_of_birth || '',    
      gender: item.gender || '',    
      photo_url: item.photo_url || ''    
    });    
    setShowEditCelebrityModal(true);    
  } else if (type === 'award') {    
    setAwardFormData({    
      name: item.name || '',    
      year: item.year || '',    
      type: item.type || ''    
    });    
    setShowEditAwardModal(true);    
  }    
}; 
  
const handleEditSubmit = async (e, type) => {  
  e.preventDefault();  
    
  try {  
    if (type === 'content') {  
      const error = validateMovieInput(movieData);  
      if (error) {  
        alert(`Validation Error: ${error}`);  
        return;  
      }  
        
      await updateContent(editingItem.id, movieData);  
      const updatedContentData = await getAllContent();  
      setContentData(formatContentData(updatedContentData));  
      setShowEditContentModal(false);  
      alert('Content updated successfully!');  
    } else if (type === 'celebrity') {  
      const error = validateCelebrityInput(celebrityData);  
      if (error) {  
        alert(`Validation Error: ${error}`);  
        return;  
      }  
        
      await updateCelebrity(editingItem.id, celebrityData);  
      const updatedCelebrities = await getAllCelebrities();  
      setCelebrityListData(updatedCelebrities);  
      setShowEditCelebrityModal(false);  
      alert('Celebrity updated successfully!');  
    } else if (type === 'award') {  
      const error = validateAwardInput(awardData);  
      if (error) {  
        alert(`Validation Error: ${error}`);  
        return;  
      }  
        
      await updateAward(editingItem.id, awardData);  
      const updatedAwards = await getAllAwards();  
      setAwardListData(updatedAwards);  
      setShowEditAwardModal(false);  
      alert('Award updated successfully!');  
    }  
      
    setEditingItem(null);  
  } catch (err) {  
    console.error(`Error updating ${type}:`, err);  
    alert(`Failed to update ${type}.`);  
  }  
};  

  

  const handleRemoveItem = async (id, type) => {
    try {
      if (type === 'content') {

        if (!id) {
          console.log(id);
          console.log("MCCCCCCCCCCC")
          console.error('❌ Tried to remove item with undefined ID');
          return;
        }

        await deleteContentById(id); // Assuming you already have this
        setContentData(prev => prev.filter(item => item.id !== id));
      } else if (type === 'celebrity') {
        await deleteCelebrity(id);
        setCelebrityListData(prev => prev.filter(item => item.id !== id));
      }else if (type === 'award') {  
      await deleteAwardById(id);  
      setAwardListData(prev => prev.filter(item => item.id !== id));  
    } 
    } catch (err) {
      console.error(`Error removing ${type}:`, err.message);
      alert(`Failed to remove ${type}.`);
    }
  };


  // ==================== CHANGE-4: Added celebrity click handler for navigation ====================  
  const handleCelebrityClick = (celebrityId) => {
    navigate(`/celebrity/${celebrityId}`);
  };

  const handleContentClick = (contentId) => {  
  navigate(`/movie/${contentId}`);  
}; 
  // ==================== CHANGE-4 END ====================  

  const adminDetails = {
    username: currentUser?.username || 'Admin',
    email: currentUser?.email || 'admin@filmfusion.com',
    bio: currentUser?.bio || 'No bio provided.',
    avatar: currentUser?.username?.charAt(0).toUpperCase() || 'A'
  };



  const handleSeriesChange = (e) => {  
    const { name, value } = e.target;  
    setSeriesData(prev => ({ ...prev, [name]: value }));  
      
    // Update season count  
    if (name === 'season_count') {  
      const count = parseInt(value) || 1;  
      const newSeasons = [];  
      for (let i = 1; i <= count; i++) {  
        newSeasons.push(seasons[i-1] || {  
          season_number: i,  
          season_name: '',  
          description: '',  
          episode_count: '',  
          release_date: '',  
          trailer_url: '',
          poster_url: '' // Add poster_url for each season  
        });  
      }  
      setSeasons(newSeasons);  
    }  
  };  


  
    
 const handleSeasonChange = (index, field, value) => {  
  const updatedSeasons = [...seasons];  
  updatedSeasons[index] = { ...updatedSeasons[index], [field]: value };  
    
  // If episode_count changes, update episodes array  
  if (field === 'episode_count') {  
    const count = parseInt(value) || 0;  
    const newEpisodes = [];  
    for (let i = 1; i <= count; i++) {  
      newEpisodes.push(updatedSeasons[index].episodes?.[i-1] || {  
        episode_number: i,  
        title: '',  
        duration: '',  
        release_date: ''  
      });  
    }  
    updatedSeasons[index].episodes = newEpisodes;  
  }  
    
  setSeasons(updatedSeasons);  
};   
    
  // Search functionality  
  const handleSearch = async (query) => {  
    if (!query.trim()) {  
      setSearchResults([]);  
      setIsSearching(false);  
      return;  
    }  
    
    setIsSearching(true);  
    try {  
      let results = [];  
        
      if (activeTab === 'content') {  
        results = await searchContent(query);  
      } else if (activeTab === 'celebrity') {  
        results = await searchCelebrities(query);  
      } else if (activeTab === 'award') {  
        results = await searchAwards(query);  
      }  
    
      if (results.length === 0) {  
        alert('No items found matching your search.');  
      }  
        
      setSearchResults(results);  
    } catch (err) {  
      console.error('Search error:', err);  
      alert('Search failed. Please try again.');  
    } finally {  
      setIsSearching(false);  
    }  
  };  
    
  const handleSeriesSubmit = async (e) => {  
  e.preventDefault();  
    
  const error = validateMovieInput(seriesData);  
  if (error) {  
    alert(`Validation Error: ${error}`);  
    return;  
  }  
    
  try {  
    const exists = await checkContentExists(seriesData.title, seriesData.release_date, seriesData.type);  
    if (exists) {  
      alert('Series with the same title, release date and type already exists.');  
      return;  
    }  
  
    const validation = await validateCelebrities(  
      processStringToArray(seriesData.directors),  
      processStringToArray(seriesData.top_cast)  
    );  
  
    if (validation.missingCelebrities.length > 0) {  
      let message = 'Cannot add series. The following celebrities are not in the database:\n\n';  
      validation.missingCelebrities.forEach(item => {  
        message += `- ${item.name} (needed as ${item.role})\n`;  
      });  
      message += '\nPlease add these celebrities to the Celebrity section first.';  
      alert(message);  
      return;  
    }  
  
    if (validation.rolesCreated.length > 0) {  
      let message = 'The following roles were automatically created:\n\n';  
      validation.rolesCreated.forEach(item => {  
        message += `- ${item.name} → ${item.role}\n`;  
      });  
      message += '\nSeries will be added successfully.';  
      alert(message);  
    }  
  
    const seriesPayload = {  
      ...seriesData,  
      duration: Number(seriesData.duration),  
      budget: Number(seriesData.budget),  
      box_office_collection: Number(seriesData.box_office_collection),  
      min_age: Number(seriesData.min_age),  
      views: Number(seriesData.views),  
      genres: processStringToArray(seriesData.genres),  
      top_cast: processStringToArray(seriesData.top_cast),  
      directors: processStringToArray(seriesData.directors),  
      awards: processStringToArray(seriesData.awards),  
      seasons: seasons,  
      series_image_urls: seriesImageUrls  
    };  
  
    await addSeries(seriesPayload);  
      
    // Handle additional images if provided  
    if (seriesImageUrls && seriesImageUrls.trim()) {  
      // This will be handled in the backend now  
    }  
      
    const updatedContentData = await getAllContent();  
    setContentData(formatContentData(updatedContentData));  
      
    alert('Series added successfully!');  
    setShowAddSeriesModal(false);  
      
    // Reset form  
    setSeriesData({  
      title: '', description: '', release_date: '', duration: '',  
      poster_url: '', trailer_url: '', budget: '', box_office_collection: '',  
      currency_code: '', min_age: '', views: '', country: '', language: '',  
      genres: '', top_cast: '', directors: '', awards: '', type: 'Series', season_count: 1  
    });  
    setSeasons([{  
      season_number: 1, season_name: '', description: '',  
      episode_count: '', release_date: '', trailer_url: '', episodes: []  
    }]);  
    setSeriesImageUrls('');  
  } catch (err) {  
    console.error('Error adding series:', err);  
    alert('Failed to add series. Please try again.');  
  }  
}; 

// Update the handleEditSubmit for series  
const handleEditSeriesSubmit = async (e) => {  
  e.preventDefault();  
    
  try {  
    const error = validateMovieInput(seriesData);  
    if (error) {  
      alert(`Validation Error: ${error}`);  
      return;  
    }  
      
    const seriesPayload = {  
      ...seriesData,  
      duration: Number(seriesData.duration),  
      budget: Number(seriesData.budget),  
      box_office_collection: Number(seriesData.box_office_collection),  
      min_age: Number(seriesData.min_age),  
      views: Number(seriesData.views),  
      genres: processStringToArray(seriesData.genres),  
      top_cast: processStringToArray(seriesData.top_cast),  
      directors: processStringToArray(seriesData.directors),  
      awards: processStringToArray(seriesData.awards),  
      seasons: seasons,  
      series_image_urls: seriesImageUrls  
    };  
      
    await updateSeries(editingItem.id, seriesPayload);  
    const updatedContentData = await getAllContent();  
    setContentData(formatContentData(updatedContentData));  
    setShowEditSeriesModal(false);  
    alert('Series updated successfully!');  
    setEditingItem(null);  
  } catch (err) {  
    console.error('Error updating series:', err);  
    alert('Failed to update series.');  
  }  
};  



  
// Add episode change handler  
const handleEpisodeChange = (seasonIndex, episodeIndex, field, value) => {  
  const updatedSeasons = [...seasons];  
  if (!updatedSeasons[seasonIndex].episodes) {  
    updatedSeasons[seasonIndex].episodes = [];  
  }  
  if (!updatedSeasons[seasonIndex].episodes[episodeIndex]) {  
    updatedSeasons[seasonIndex].episodes[episodeIndex] = {  
      episode_number: episodeIndex + 1,  
      title: '',  
      duration: '',  
      release_date: ''  
    };  
  }  
  updatedSeasons[seasonIndex].episodes[episodeIndex][field] = value;  
  setSeasons(updatedSeasons);  
};   
  


  const AdminWaterBackground = () => (  
    <div style={{  
      position: 'absolute',  
      top: 0,  
      left: 0,  
      right: 0,  
      bottom: 0,  
      overflow: 'hidden',  
      opacity: 0.8,  
      pointerEvents: 'none'  
    }}>  
      <div style={{  
        position: 'absolute',  
        top: 0,  
        left: 0,  
        right: 0,  
        bottom: 0,  
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',  
        opacity: 0.9  
      }} />  
  
      <svg width="100%" height="100%" viewBox="0 0 800 400" style={{ position: 'absolute', top: 0, left: 0 }}>  
        <defs>  
          <linearGradient id="adminGradient1" x1="0%" y1="0%" x2="100%" y2="100%">  
            <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 0.3 }} />  
            <stop offset="50%" style={{ stopColor: '#f59e0b', stopOpacity: 0.2 }} />  
            <stop offset="100%" style={{ stopColor: '#d97706', stopOpacity: 0.1 }} />  
          </linearGradient>  
          <radialGradient id="adminSpotlight" cx="30%" cy="30%" r="40%">  
            <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 0.4 }} />  
            <stop offset="100%" style={{ stopColor: '#1e293b', stopOpacity: 0.1 }} />  
          </radialGradient>  
          <filter id="adminGlow">  
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>  
            <feMerge>   
              <feMergeNode in="coloredBlur"/>  
              <feMergeNode in="SourceGraphic"/>  
            </feMerge>  
          </filter>  
        </defs>  
  
        {/* Flowing shape */}  
        <path d="M0,200 Q200,100 400,200 T800,200 L800,400 L0,400 Z" fill="url(#adminGradient1)">  
          <animate attributeName="d" dur="15s" repeatCount="indefinite"  
            values="M0,200 Q200,100 400,200 T800,200 L800,400 L0,400 Z;  
                    M0,180 Q200,120 400,180 T800,180 L800,400 L0,400 Z;  
                    M0,220 Q200,80 400,220 T800,220 L800,400 L0,400 Z;  
                    M0,200 Q200,100 400,200 T800,200 L800,400 L0,400 Z" />  
        </path>  
  
        {/* Spotlight effect */}  
        <ellipse cx="250" cy="120" rx="200" ry="80" fill="url(#adminSpotlight)">  
          <animate attributeName="rx" dur="10s" repeatCount="indefinite" values="200;250;200" />  
          <animate attributeName="ry" dur="8s" repeatCount="indefinite" values="80;100;80" />  
        </ellipse>  
  
        {/* Icons with glow */}  
        <g opacity="0.6" filter="url(#adminGlow)">  
          {/* Dashboard icon */}  
          <rect x="100" y="100" width="30" height="30" fill="#fbbf24" opacity="0.7" rx="5">  
            <animateTransform attributeName="transform" type="rotate" dur="20s" repeatCount="indefinite" values="0 115 115;360 115 115" />  
            <animate attributeName="opacity" dur="4s" repeatCount="indefinite" values="0.7;1;0.7" />  
          </rect>  
  
          {/* Settings gear */}  
          <circle cx="650" cy="150" r="20" fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.5">  
            <animateTransform attributeName="transform" type="rotate" dur="12s" repeatCount="indefinite" values="0 650 150;360 650 150" />  
          </circle>  
          <circle cx="650" cy="150" r="10" fill="#fbbf24" opacity="0.3">  
            <animateTransform attributeName="transform" type="rotate" dur="12s" repeatCount="indefinite" values="0 650 150;360 650 150" />  
          </circle>  
  
          {/* Visualization bars */}  
          <g transform="translate(500, 250)">  
            <rect x="0" y="20" width="8" height="30" fill="#fbbf24" opacity="0.6">  
              <animate attributeName="height" dur="3s" repeatCount="indefinite" values="30;50;30" />  
              <animate attributeName="y" dur="3s" repeatCount="indefinite" values="20;0;20" />  
            </rect>  
            <rect x="12" y="10" width="8" height="40" fill="#f59e0b" opacity="0.6">  
              <animate attributeName="height" dur="3s" repeatCount="indefinite" values="40;60;40" begin="0.5s" />  
              <animate attributeName="y" dur="3s" repeatCount="indefinite" values="10;-10;10" begin="0.5s" />  
            </rect>  
            <rect x="24" y="15" width="8" height="35" fill="#d97706" opacity="0.6">  
              <animate attributeName="height" dur="3s" repeatCount="indefinite" values="35;55;35" begin="1s" />  
              <animate attributeName="y" dur="3s" repeatCount="indefinite" values="15;-5;15" begin="1s" />  
            </rect>  
          </g>  
  
          {/* Network nodes */}  
          <circle cx="200" cy="300" r="5" fill="#fbbf24" opacity="0.8">  
            <animate attributeName="r" dur="6s" repeatCount="indefinite" values="5;8;5" />  
          </circle>  
          <circle cx="250" cy="280" r="4" fill="#f59e0b" opacity="0.6">  
            <animate attributeName="r" dur="5s" repeatCount="indefinite" values="4;7;4" begin="1s" />  
          </circle>  
          <circle cx="180" cy="320" r="3" fill="#d97706" opacity="0.7">  
            <animate attributeName="r" dur="7s" repeatCount="indefinite" values="3;6;3" begin="2s" />  
          </circle>  
  
          {/* Connecting lines */}  
          <line x1="200" y1="300" x2="250" y2="280" stroke="#fbbf24" strokeWidth="1" opacity="0.4">  
            <animate attributeName="opacity" dur="4s" repeatCount="indefinite" values="0.4;0.8;0.4" />  
          </line>  
          <line x1="250" y1="280" x2="180" y2="320" stroke="#f59e0b" strokeWidth="1" opacity="0.3">  
            <animate attributeName="opacity" dur="5s" repeatCount="indefinite" values="0.3;0.7;0.3" begin="1s" />  
          </line>  
        </g>  
  
        {/* Floating particles */}  
        <g opacity="0.4">  
          <circle cx="400" cy="100" r="2" fill="#fbbf24">  
            <animateMotion path="M0,0 C50,50 -50,100 0,150 C50,200 -50,250 0,300" dur="25s" repeatCount="indefinite" />  
          </circle>  
          <circle cx="600" cy="200" r="1.5" fill="#f59e0b">  
            <animateMotion path="M0,0 C-30,30 30,60 0,90 C-30,120 30,150 0,180" dur="20s" repeatCount="indefinite" />  
          </circle>  
          <circle cx="150" cy="250" r="2.5" fill="#d97706">  
            <animateMotion path="M0,0 C80,20 -80,40 0,60 C80,80 -80,100 0,120" dur="18s" repeatCount="indefinite" />  
          </circle>  
        </g>  
      </svg>  
    </div>  
  );
  

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          color: '#fbbf24',
          fontSize: '1.25rem',
          fontWeight: 'bold'
        }}>
          Loading Admin Dashboard...
        </div>
      );
    }
    switch (activeTab) {
//       case 'content':
//         return (
//           <>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>  
//   <h3 style={{ color: '#fbbf24', fontSize: '1.5rem' }}>Content Management</h3>  
//   <div style={{ display: 'flex', gap: '1rem' }}>  
//     <button  
//       onClick={() => setShowAddMovieModal(true)}  
//       style={{  
//         backgroundColor: '#fbbf24',  
//         color: '#000',  
//         padding: '0.75rem 1.5rem',  
//         borderRadius: '8px',  
//         border: 'none',  
//         fontWeight: 'bold',  
//         cursor: 'pointer',  
//         fontSize: '0.95rem'  
//       }}  
//     >  
//       Add Movie  
//     </button>  
//     <button  
//       onClick={() => setShowAddSeriesModal(true)}  
//       style={{  
//         backgroundColor: '#10b981',  
//         color: '#fff',  
//         padding: '0.75rem 1.5rem',  
//         borderRadius: '8px',  
//         border: 'none',  
//         fontWeight: 'bold',  
//         cursor: 'pointer',  
//         fontSize: '0.95rem'  
//       }}  
//     >  
//       Add Series  
//     </button>  
//   </div>  
// </div>  
  
// {/* Search Bar */}  
// <div style={{ marginBottom: '1.5rem' }}>  
//   <input  
//     type="text"  
//     placeholder="Search content..."  
//     value={searchQuery}  
//     onChange={(e) => {  
//       setSearchQuery(e.target.value);  
//       handleSearch(e.target.value);  
//     }}  
//     style={{  
//       width: '100%',  
//       padding: '0.75rem',  
//       borderRadius: '8px',  
//       border: '1px solid #444',  
//       backgroundColor: '#0a0a0a',  
//       color: 'white',  
//       fontSize: '0.95rem'  
//     }}  
//   />  
// </div>  
//             {/* <AdminMovieSection
//         title="All Movies"
//         movies={contentData}
//         onRemove={(id) => handleRemoveItem(id, 'content')}
//       /> */}
//             <div style={{ display: 'grid', gap: '1rem' }}>
//               {(searchQuery ? searchResults : contentData).map(item => (
//                 <div key={item.id} style={{
//                   backgroundColor: '#2a2a2a',
//                   padding: '1.5rem',
//                   borderRadius: '10px',
//                   border: '1px solid #444',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '1.5rem'
//                 }}>
//                   <img
//                     src={item.poster || 'https://via.placeholder.com/100x150'}
//                     alt={item.title}
//                     style={{
//                       width: '100px',
//                       height: '150px',
//                       borderRadius: '6px',
//                       objectFit: 'cover',
//                       border: '2px solid #fbbf24'
//                     }}
//                   />
//                   <div style={{ flexGrow: 1 }}>
//                     <h4 style={{ color: '#fbbf24', marginBottom: '0.25rem' }}>{item.title}</h4>
//                     <p style={{ color: '#9ca3af', margin: '0', fontSize: '0.875rem' }}>
//                       {item.type} • {item.year} • Rating: {item.rating}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => handleRemoveItem(item.id, 'content')}
//                     style={{
//                       backgroundColor: '#ef4444',
//                       color: 'white',
//                       padding: '0.5rem 1rem',
//                       borderRadius: '6px',
//                       border: 'none',
//                       cursor: 'pointer',
//                       fontSize: '0.875rem'
//                     }}
//                   >
//                     Remove
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </>
//         );

case 'content':  
return (  
  <>  
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>    
      <h3 style={{ color: '#fbbf24', fontSize: '1.5rem' }}>Content Management</h3>    
      <div style={{ display: 'flex', gap: '1rem' }}>    
        <button    
          onClick={() => setShowAddMovieModal(true)}    
          style={{    
            backgroundColor: '#fbbf24',    
            color: '#000',    
            padding: '0.75rem 1.5rem',    
            borderRadius: '8px',    
            border: 'none',    
            fontWeight: 'bold',    
            cursor: 'pointer',    
            fontSize: '0.95rem'    
          }}    
        >    
          Add Movie    
        </button>    
        <button    
          onClick={() => setShowAddSeriesModal(true)}    
          style={{    
            backgroundColor: '#10b981',    
            color: '#fff',    
            padding: '0.75rem 1.5rem',    
            borderRadius: '8px',    
            border: 'none',    
            fontWeight: 'bold',    
            cursor: 'pointer',    
            fontSize: '0.95rem'    
          }}    
        >    
          Add Series    
        </button>    
      </div>    
    </div>    

    {/* Search Bar */}    
    <div style={{ marginBottom: '1.5rem' }}>    
      <input    
        type="text"    
        placeholder="Search content..."    
        value={searchQuery}    
        onChange={(e) => {    
          setSearchQuery(e.target.value);    
          handleSearch(e.target.value);    
        }}    
        style={{    
          width: '100%',    
          padding: '0.75rem',    
          borderRadius: '8px',    
          border: '1px solid #444',    
          backgroundColor: '#0a0a0a',    
          color: 'white',    
          fontSize: '0.95rem'    
        }}    
      />    
    </div>  

    {/* Content Display */}  
    {viewMode === 'list' ? (  
      <div style={{ display: 'grid', gap: '1rem' }}>  
        {(searchQuery ? searchResults : contentData).map(item => (  
          <div key={item.id} style={{  
            backgroundColor: '#2a2a2a',  
            padding: '1.5rem',  
            borderRadius: '10px',  
            border: '1px solid #444',  
            display: 'flex',  
            alignItems: 'center',  
            gap: '1.5rem'  
          }}>  
            <img  
              src={item.poster || 'https://via.placeholder.com/100x150'}  
              alt={item.title}  
              style={{  
                width: '100px',  
                height: '150px',  
                borderRadius: '6px',  
                objectFit: 'cover',  
                border: '2px solid #fbbf24'  
              }}  
            />  
            <div style={{ flexGrow: 1 }}>  
              <h4 style={{ color: '#fbbf24', marginBottom: '0.25rem' }}>{item.title}</h4>  
              <p style={{ color: '#9ca3af', margin: '0', fontSize: '0.875rem' }}>  
                {item.type} • {item.year} • Rating: {item.rating}  
              </p>  
            </div>  
            <button  
              onClick={() => handleRemoveItem(item.id, 'content')}  
              style={{  
                backgroundColor: '#ef4444',  
                color: 'white',  
                padding: '0.5rem 1rem',  
                borderRadius: '6px',  
                border: 'none',  
                cursor: 'pointer',  
                fontSize: '0.875rem'  
              }}  
            >  
              Remove  
            </button>  
          </div>  
        ))}  
      </div>  
    ) : (  
     <div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  }}
>
  {(searchQuery ? searchResults : contentData).map(item => (
    <div
      key={item.id}
      style={{
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #444',
        transition: 'transform 0.3s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div
        onClick={() => handleContentClick(item.id)}
        style={{ cursor: 'pointer' }}
      >
        <img
          src={item.poster || 'https://via.placeholder.com/300x400'}
          alt={item.title}
          style={{
            width: '100%',
            height: '400px',
            objectFit: 'cover'
          }}
        />

        <div style={{ padding: '1rem' }}>
          <h4
            style={{
              color: '#fbbf24',
              marginBottom: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            {item.title}
          </h4>
          <p
            style={{
              color: '#9ca3af',
              margin: '0',
              fontSize: '0.875rem',
              lineHeight: '1.4'
            }}
          >
            {item.type} • {item.year}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '0.5rem',
              gap: '0.25rem'
            }}
          >
            <span style={{ color: '#fbbf24', fontSize: '1rem' }}>⭐</span>
            <span style={{ color: '#fbbf24', fontSize: '0.875rem' }}>
              {item.rating}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0 1rem 1rem'
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent triggering card click
            handleEditItem(item, 'content');
          }}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            flex: 1
          }}
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveItem(item.id, 'content');
          }}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            flex: 1
          }}
        >
          Remove
        </button>
      </div>
    </div>
  ))}
</div>  
    )}  
  </>  
);  


      //hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
      case 'celebrity':  
        return (  
          <div>  
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>  
              <h3 style={{ color: '#fbbf24', fontSize: '1.5rem' }}>Celebrity Management</h3>  
              <button  
                onClick={() => setShowAddCelebrityModal(true)}  
                style={{  
                  backgroundColor: '#fbbf24',  
                  color: '#000',  
                  padding: '0.75rem 1.5rem',  
                  borderRadius: '8px',  
                  border: 'none',  
                  fontWeight: 'bold',  
                  cursor: 'pointer',  
                  fontSize: '0.95rem'  
                }}  
              >  
                Add Celebrity  
              </button>  
            </div>  
  
            {/* Search Bar */}    
            <div style={{ marginBottom: '1.5rem' }}>    
              <input    
                type="text"    
                placeholder="Search celebrities..."    
                value={searchQuery}    
                onChange={(e) => {    
                  setSearchQuery(e.target.value);    
                  handleSearch(e.target.value);    
                }}    
                style={{    
                  width: '100%',    
                  padding: '0.75rem',    
                  borderRadius: '8px',    
                  border: '1px solid #444',    
                  backgroundColor: '#0a0a0a',    
                  color: 'white',    
                  fontSize: '0.95rem'    
                }}    
              />    
            </div>  
  
            {/* Celebrity Display */}  
            {viewMode === 'list' ? (  
              <div style={{ display: 'grid', gap: '1rem' }}>  
                {(searchQuery ? searchResults : celebrityListData).map(item => (  
                  <div     
                    key={item.id}     
                    onClick={() => handleCelebrityClick(item.id)}    
                    style={{    
                      cursor: 'pointer',   
                      backgroundColor: '#2a2a2a',  
                      padding: '1.5rem',  
                      borderRadius: '10px',  
                      border: '1px solid #444',  
                      display: 'flex',  
                      alignItems: 'center',  
                      gap: '1.5rem',  
                      transition: 'transform 0.2s ease'  
                    }}  
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}  
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}  
                  >  
                    <img  
                      src={item.photo_url || 'https://via.placeholder.com/80'}  
                      alt={item.name}  
                      style={{  
                        width: '80px',  
                        height: '80px',  
                        borderRadius: '50%',  
                        objectFit: 'cover',  
                        border: '2px solid #fbbf24'  
                      }}  
                    />  
                    <div style={{ flexGrow: 1 }}>  
                      <h4 style={{ color: '#fbbf24', marginBottom: '0.25rem' }}>{item.name}</h4>  
                      <p style={{ color: '#9ca3af', margin: '0', fontSize: '0.875rem' }}>  
                        {item.roles?.length ? item.roles.join(', ') : 'Profession Unknown'}  
                      </p>  
                    </div>  
                    <button  
                      onClick={(e) => {  
                        e.stopPropagation();  
                        handleRemoveItem(item.id, 'celebrity');  
                      }}  
                      style={{  
                        backgroundColor: '#ef4444',  
                        color: 'white',  
                        padding: '0.5rem 1rem',  
                        borderRadius: '6px',  
                        border: 'none',  
                        cursor: 'pointer',  
                        fontSize: '0.875rem'  
                      }}  
                    >  
                      Remove  
                    </button>  
                  </div>  
                ))}  
              </div>  
            ) : (  
              <div style={{    
  display: 'grid',    
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',    
  gap: '1.5rem'    
}}>    
  {(searchQuery ? searchResults : celebrityListData).map(item => (    
    <div    
      key={item.id}    
      style={{    
        backgroundColor: '#2a2a2a',    
        borderRadius: '12px',    
        overflow: 'hidden',    
        border: '1px solid #444',    
        cursor: 'pointer',    
        transition: 'transform 0.3s ease',    
        position: 'relative'    
      }}    
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}    
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}    
    >    
      <div onClick={() => handleCelebrityClick(item.id)}>    
        <img    
          src={item.photo_url || 'https://via.placeholder.com/250x300'}    
          alt={item.name}    
          style={{    
            width: '100%',    
            height: '300px',    
            objectFit: 'cover'    
          }}    
        />    
            
        <div style={{ padding: '1rem' }}>    
          <h4 style={{     
            color: '#fbbf24',     
            marginBottom: '0.5rem',    
            fontSize: '1.1rem',    
            fontWeight: 'bold'    
          }}>    
            {item.name}    
          </h4>    
          <p style={{     
            color: '#9ca3af',     
            margin: '0',    
            fontSize: '0.875rem',    
            lineHeight: '1.4'    
          }}>    
            {item.roles?.length ? item.roles.join(', ') : 'Profession Unknown'}    
          </p>    
          {item.bio && (    
            <p style={{    
              color: '#ccc',    
              fontSize: '0.8rem',    
              marginTop: '0.5rem',    
              lineHeight: '1.3',    
              display: '-webkit-box',    
              WebkitLineClamp: 2,    
              WebkitBoxOrient: 'vertical',    
              overflow: 'hidden'    
            }}>    
              {item.bio}    
            </p>    
          )}    
        </div>    
      </div>    
        
      <div style={{    
        display: 'flex',    
        gap: '0.5rem',    
        padding: '0 1rem 1rem'    
      }}>    
        <button    
          onClick={(e) => {    
            e.stopPropagation();    
            handleEditItem(item, 'celebrity');    
          }}    
          style={{    
            backgroundColor: '#3b82f6',    
            color: 'white',    
            padding: '0.5rem 1rem',    
            borderRadius: '6px',    
            border: 'none',    
            cursor: 'pointer',    
            fontSize: '0.875rem',    
            flex: 1    
          }}    
        >    
          Edit    
        </button>    
        <button    
          onClick={(e) => {    
            e.stopPropagation();    
            handleRemoveItem(item.id, 'celebrity');    
          }}    
          style={{    
            backgroundColor: '#dc2626',    
            color: 'white',    
            padding: '0.5rem 1rem',    
            borderRadius: '6px',    
            border: 'none',    
            cursor: 'pointer',    
            fontSize: '0.875rem',    
            flex: 1    
          }}    
        >    
          Remove    
        </button>    
      </div>    
    </div>    
  ))}    
</div>   
            )}  
          </div>  
        );  
      case 'award':  
  return (  
    <div>  
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>  
        <h3 style={{ color: '#fbbf24', fontSize: '1.5rem' }}>Award Management</h3>  
        <button  
          onClick={() => setShowAddAwardModal(true)}  
          style={{  
            backgroundColor: '#fbbf24',  
            color: '#000',  
            padding: '0.75rem 1.5rem',  
            borderRadius: '8px',  
            border: 'none',  
            fontWeight: 'bold',  
            cursor: 'pointer',  
            fontSize: '0.95rem'  
          }}  
        >  
          Add Award  
        </button>  
      </div>  
  
      {/* Search Bar */}    
      <div style={{ marginBottom: '1.5rem' }}>    
        <input    
          type="text"    
          placeholder="Search awards..."    
          value={searchQuery}    
          onChange={(e) => {    
            setSearchQuery(e.target.value);    
            handleSearch(e.target.value);    
          }}    
          style={{    
            width: '100%',    
            padding: '0.75rem',    
            borderRadius: '8px',    
            border: '1px solid #444',    
            backgroundColor: '#0a0a0a',    
            color: 'white',    
            fontSize: '0.95rem'    
          }}    
        />    
      </div>  
  
      {/* Award Display */}  
      {viewMode === 'list' ? (  
        <div style={{ display: 'grid', gap: '1rem' }}>  
          {(searchQuery ? searchResults : awardListData).map(item => (  
            <div key={item.id} style={{  
              backgroundColor: '#2a2a2a',  
              padding: '1rem',  
              borderRadius: '8px',  
              border: '1px solid #444',  
              display: 'flex',  
              justifyContent: 'space-between',  
              alignItems: 'center'  
            }}>  
              <div>  
                <h4 style={{ color: '#fbbf24', margin: '0 0 0.5rem 0' }}>{item.name}</h4>  
                <p style={{ color: '#9ca3af', margin: '0', fontSize: '0.875rem' }}>  
                  {item.year} • {item.type}  
                </p>  
              </div>  
              <div style={{ display: 'flex', gap: '0.5rem' }}>  
                <button  
                  onClick={() => handleEditItem(item, 'award')}  
                  style={{  
                    backgroundColor: '#3b82f6',  
                    color: 'white',  
                    padding: '0.5rem 1rem',  
                    borderRadius: '6px',  
                    border: 'none',  
                    cursor: 'pointer',  
                    fontSize: '0.875rem'  
                  }}  
                >  
                  Edit  
                </button>  
                <button  
                  onClick={() => handleRemoveItem(item.id, 'award')}  
                  style={{  
                    backgroundColor: '#dc2626',  
                    color: 'white',  
                    padding: '0.5rem 1rem',  
                    borderRadius: '6px',  
                    border: 'none',  
                    cursor: 'pointer',  
                    fontSize: '0.875rem'  
                  }}  
                >  
                  Remove  
                </button>  
              </div>  
            </div>  
          ))}  
        </div>  
      ) : (  
        <div style={{  
          display: 'grid',  
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',  
          gap: '1.5rem'  
        }}>  
          {(searchQuery ? searchResults : awardListData).map(item => (  
            <div key={item.id} style={{  
              backgroundColor: '#2a2a2a',  
              borderRadius: '12px',  
              overflow: 'hidden',  
              border: '1px solid #444',  
              transition: 'transform 0.3s ease',  
              position: 'relative'  
            }}  
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}  
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}  
            >  
              <div style={{  
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
                height: '120px',  
                display: 'flex',  
                alignItems: 'center',  
                justifyContent: 'center',  
                position: 'relative'  
              }}>  
                <div style={{  
                  fontSize: '3rem',  
                  color: '#000',  
                  fontWeight: 'bold'  
                }}>  
                  🏆  
                </div>  
                <div style={{  
                  position: 'absolute',  
                  top: '0.5rem',  
                  right: '0.5rem',  
                  backgroundColor: 'rgba(0,0,0,0.7)',  
                  color: '#fbbf24',  
                  padding: '0.25rem 0.5rem',  
                  borderRadius: '4px',  
                  fontSize: '0.75rem',  
                  fontWeight: 'bold'  
                }}>  
                  {item.year}  
                </div>  
              </div>  
                
              <div style={{ padding: '1rem' }}>  
                <h4 style={{  
                  color: '#fbbf24',  
                  marginBottom: '0.5rem',  
                  fontSize: '1.1rem',  
                  fontWeight: 'bold',  
                  lineHeight: '1.3'  
                }}>  
                  {item.name}  
                </h4>  
                <p style={{  
                  color: '#9ca3af',  
                  margin: '0 0 1rem 0',  
                  fontSize: '0.875rem',  
                  lineHeight: '1.4'  
                }}>  
                  {item.type}  
                </p>  
                  
                <div style={{  
                  display: 'flex',  
                  gap: '0.5rem'  
                }}>  
                  <button  
                    onClick={() => handleEditItem(item, 'award')}  
                    style={{  
                      backgroundColor: '#3b82f6',  
                      color: 'white',  
                      padding: '0.5rem 1rem',  
                      borderRadius: '6px',  
                      border: 'none',  
                      cursor: 'pointer',  
                      fontSize: '0.875rem',  
                      flex: 1  
                    }}  
                  >  
                    Edit  
                  </button>  
                  <button  
                    onClick={() => handleRemoveItem(item.id, 'award')}  
                    style={{  
                      backgroundColor: '#dc2626',  
                      color: 'white',  
                      padding: '0.5rem 1rem',  
                      borderRadius: '6px',  
                      border: 'none',  
                      cursor: 'pointer',  
                      fontSize: '0.875rem',  
                      flex: 1  
                    }}  
                  >  
                    Remove  
                  </button>  
                </div>  
              </div>  
            </div>  
          ))}  
        </div>  
      )}  
    </div>  
  );
      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      fontFamily: 'Segoe UI, sans-serif',
      padding: '2rem',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '2000px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Admin Profile Section with Water Background */}
        <div style={{
          backgroundColor: '#1f1f1f',
          borderRadius: '12px',
          padding: '2rem 4rem',
          marginBottom: '2rem',
          border: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <AdminWaterBackground />
          {/* <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            backgroundColor: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: '#000',
            position: 'relative',
            zIndex: 1
          }}>
            {adminDetails.avatar}
          </div> */}

<div style={{    
  width: '70px',    
  height: '70px',    
  borderRadius: '50%',    
  backgroundColor: '#fbbf24',    
  display: 'flex',    
  alignItems: 'center',    
  justifyContent: 'center',    
  fontSize: '1.75rem',    
  fontWeight: 'bold',    
  color: '#000',    
  position: 'relative',    
  zIndex: 1  
}}>    
  {adminDetails.avatar}    
</div> 


          {/* Left Side - Admin Info */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            flex: 1
          }}>
            {adminEditing ? (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={adminFormData.username}
                    onChange={handleAdminChange}
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      padding: '0.75rem',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>  
{/* <div style={{ marginBottom: '1rem' }}>  
  <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>  
    Profile Picture URL  
  </label>  
  <input  
    type="url"  
    name="profile_picture_url"  
    value={adminFormData.profile_picture_url}  
    onChange={handleAdminChange}  
    placeholder="https://example.com/your-photo.jpg"  
    style={{  
      width: '100%',  
      maxWidth: '400px',  
      padding: '0.75rem',  
      backgroundColor: '#2a2a2a',  
      border: '1px solid #333',  
      borderRadius: '6px',  
      color: '#ffffff',  
      fontSize: '0.875rem',  
      fontFamily: 'inherit'  
    }}  
  />  
</div>   */}
{/* <div style={{ marginBottom: '1rem' }}>  
  <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>  
    Profile Picture URL  
  </label>  
  <input  
    type="url"  
    name="profile_picture_url"  
    value={adminFormData.profile_picture_url}  
    onChange={handleAdminChange}  
    placeholder="https://example.com/your-photo.jpg"  
    style={{  
      width: '100%',  
      maxWidth: '400px',  
      padding: '0.75rem',  
      backgroundColor: '#2a2a2a',  
      border: '1px solid #333',  
      borderRadius: '6px',  
      color: '#ffffff',  
      fontSize: '0.875rem',  
      fontFamily: 'inherit'  
    }}  
  />  
</div>   */}
{currentUser?.role === 'admin' && (  
  <>  
    {/* <div style={{ marginBottom: '1rem' }}>  
      <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>  
        Phone  
      </label>  
      <input  
        type="text"  
        name="phone"  
        value={adminFormData.phone}  
        onChange={handleAdminChange}  
        style={{  
          width: '100%',  
          maxWidth: '300px',  
          padding: '0.75rem',  
          backgroundColor: '#2a2a2a',  
          border: '1px solid #333',  
          borderRadius: '6px',  
          color: '#ffffff',  
          fontSize: '1rem',  
          fontFamily: 'inherit'  
        }}  
      />  
    </div>   */}
    {/* <div style={{ marginBottom: '1rem' }}>  
      <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>  
        Official Email  
      </label>  
      <input  
        type="email"  
        name="official_mail"  
        value={adminFormData.official_mail}  
        onChange={handleAdminChange}  
        style={{  
          width: '100%',  
          maxWidth: '300px',  
          padding: '0.75rem',  
          backgroundColor: '#2a2a2a',  
          border: '1px solid #333',  
          borderRadius: '6px',  
          color: '#ffffff',  
          fontSize: '1rem',  
          fontFamily: 'inherit'  
        }}  
      />  
    </div>   */}
  </>  
)}  
<div>  
  <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>  
    Bio  
  </label> 
  <textarea  
    name="bio"  
    value={adminFormData.bio}  
    onChange={handleAdminChange}  
    placeholder="Tell us about yourself..."  
    rows={3}  
    style={{  
      width: '100%',  
      maxWidth: '400px',  
      padding: '0.75rem',  
      backgroundColor: '#2a2a2a',  
      border: '1px solid #333',  
      borderRadius: '6px',  
      color: '#ffffff',  
      fontSize: '0.875rem',  
      fontFamily: 'inherit',  
      resize: 'vertical'  
    }}  
  />  
</div>
              </div>
            ) : (
              <div>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: '#fbbf24' }}>
                  {adminFormData.username || adminDetails.username}
                </h1>
                <p style={{ color: '#9ca3af', margin: '0.1rem 0', fontSize: '0.95rem' }}>
                  📧 {adminDetails.email}
                </p>
                <p style={{
                  color: '#9ca3af',
                  fontStyle: !adminFormData.bio && !adminDetails.bio ? 'italic' : 'normal',
                  margin: '0.1rem 0',
                  fontSize: '0.875rem'
                }}>
                  {adminFormData.bio || adminDetails.bio || 'No bio available.'}
                </p>
              </div>
            )}
          </div>

          {/* Right Side - Edit Profile Button */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexShrink: 0,
            position: 'relative',
            zIndex: 1
          }}>
            {adminEditing ? (
              <>
                <button
                  onClick={handleAdminSave}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#fbbf24',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f59e0b'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#fbbf24'}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setAdminEditing(false);
                    setAdminFormData({
                      username: currentUser?.username || '',  
      bio: currentUser?.bio || '',  
      profile_picture_url: currentUser?.profile_picture_url || '',  
      phone: currentUser?.phone || '',  
     // official_mail: currentUser?.official_mail || '' 
                    });
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    color: '#9ca3af',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#ffffff';
                    e.target.style.borderColor = '#666';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#9ca3af';
                    e.target.style.borderColor = '#333';
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (  
              <>  
                <button  
                  onClick={() => setAdminEditing(true)}  
                  style={{  
                    padding: '0.75rem 1.5rem',  
                    backgroundColor: 'transparent',  
                    color: '#9ca3af',  
                    border: '1px solid #333',  
                    borderRadius: '8px',  
                    cursor: 'pointer',  
                    fontSize: '0.875rem',  
                    transition: 'all 0.2s',  
                    fontFamily: 'inherit'  
                  }}  
                  onMouseEnter={(e) => {  
                    e.target.style.color = '#ffffff';  
                    e.target.style.borderColor = '#fbbf24';  
                  }}  
                  onMouseLeave={(e) => {  
                    e.target.style.color = '#9ca3af';  
                    e.target.style.borderColor = '#333';  
                  }}  
                >  
                  Edit Profile  
                </button>  
                <button  
                  onClick={() => setShowAdminFormDetails(!showAdminDetails)}  
                  style={{  
                    padding: '0.75rem 1.5rem',  
                    backgroundColor: 'transparent',  
                    color: '#9ca3af',  
                    border: '1px solid #333',  
                    borderRadius: '8px',  
                    cursor: 'pointer',  
                    fontSize: '0.875rem',  
                    transition: 'all 0.2s',  
                    fontFamily: 'inherit'  
                  }}  
                  onMouseEnter={(e) => {  
                    e.target.style.color = '#ffffff';  
                    e.target.style.borderColor = '#fbbf24';  
                  }}  
                  onMouseLeave={(e) => {  
                    e.target.style.color = '#9ca3af';  
                    e.target.style.borderColor = '#333';  
                  }}  
                >  
                  {showAdminDetails ? 'Hide Details' : 'Show Details'}  
                </button>  
              </>  
            )} 
          </div>
        </div>

        {/* Admin Details Section */}    
        {showAdminDetails && (    
          <div style={{    
            backgroundColor: '#1f1f1f',    
            borderRadius: '12px',    
            padding: '2rem',    
            marginBottom: '2rem',    
            border: '1px solid #333'    
          }}>    
            {/* Stats Row */}  
            <div style={{  
              display: 'flex',  
              justifyContent: 'space-around',  
              alignItems: 'center',  
              marginBottom: '2rem',  
              padding: '1rem 0',  
              borderBottom: '1px solid #333'  
            }}>  
              <div style={{ textAlign: 'center' }}>  
                <div style={{  
                  fontSize: '2rem',  
                  fontWeight: 'bold',  
                  color: '#fbbf24',  
                  marginBottom: '0.5rem'  
                }}>  
                  {contentData.length}  
                </div>  
                <div style={{  
                  fontSize: '0.875rem',  
                  color: '#9ca3af'  
                }}>  
                  Total Content  
                </div>  
              </div>  
                
              <div style={{ textAlign: 'center' }}>  
                <div style={{  
                  fontSize: '2rem',  
                  fontWeight: 'bold',  
                  color: '#10b981',  
                  marginBottom: '0.5rem'  
                }}>  
                  {celebrityListData.length}  
                </div>  
                <div style={{  
                  fontSize: '0.875rem',  
                  color: '#9ca3af'  
                }}>  
                  Celebrities  
                </div>  
              </div>  
                
              <div style={{ textAlign: 'center' }}>  
                <div style={{  
                  fontSize: '2rem',  
                  fontWeight: 'bold',  
                  color: '#8b5cf6',  
                  marginBottom: '0.5rem'  
                }}>  
                  {awardListData.length}  
                </div>  
                <div style={{  
                  fontSize: '0.875rem',  
                  color: '#9ca3af'  
                }}>  
                  Awards  
                </div>  
              </div>  
                
              <div style={{ textAlign: 'center' }}>  
                <div style={{  
                  fontSize: '2rem',  
                  fontWeight: 'bold',  
                  color: '#ef4444',  
                  marginBottom: '0.5rem'  
                }}>  
                  100%  
                </div>  
                <div style={{  
                  fontSize: '0.875rem',  
                  color: '#9ca3af'  
                }}>  
                  System Health  
                </div>  
              </div>  
            </div>  
  
            <h3 style={{    
              margin: '0 0 1.5rem 0',    
              color: '#fbbf24',    
              fontSize: '1.25rem',  
              display: 'flex',  
              alignItems: 'center',  
              gap: '0.5rem'  
            }}>    
              🔧 Admin Details    
            </h3>    
              
            <div style={{  
              display: 'grid',  
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',  
              gap: '1.5rem'  
            }}>  
              {/* Role */}  
              <div style={{  
                display: 'flex',  
                alignItems: 'center',  
                gap: '1rem',  
                padding: '1rem',  
                backgroundColor: '#2a2a2a',  
                borderRadius: '8px',  
                border: '1px solid #444'  
              }}>  
                <div style={{  
                  width: '40px',  
                  height: '40px',  
                  backgroundColor: '#fbbf24',  
                  borderRadius: '8px',  
                  display: 'flex',  
                  alignItems: 'center',  
                  justifyContent: 'center',  
                  fontSize: '1.25rem'  
                }}>  
                  👑  
                </div>  
                <div>  
                  <div style={{  
                    fontSize: '0.875rem',  
                    color: '#9ca3af',  
                    marginBottom: '0.25rem'  
                  }}>  
                    Role  
                  </div>  
                  <div style={{  
                    fontSize: '1rem',  
                    color: '#ffffff',  
                    fontWeight: '500'  
                  }}>  
                    Administrator  
                  </div>  
                </div>  
              </div>  
  
              {/* Status */}  
              <div style={{  
                display: 'flex',  
                alignItems: 'center',  
                gap: '1rem',  
                padding: '1rem',  
                backgroundColor: '#2a2a2a',  
                borderRadius: '8px',  
                border: '1px solid #444'  
              }}>  
                <div style={{  
                  width: '40px',  
                  height: '40px',  
                  backgroundColor: '#10b981',
                  borderRadius: '8px',  
                  display: 'flex',  
                  alignItems: 'center',  
                  justifyContent: 'center',  
                  fontSize: '1.25rem'  
                }}>  
                  ✅  
                </div>  
                <div>  
                  <div style={{  
                    fontSize: '0.875rem',  
                    color: '#9ca3af',  
                    marginBottom: '0.25rem'  
                  }}>  
                    Status  
                  </div>  
                  <div style={{  
                    fontSize: '1rem',  
                    color: '#ffffff',  
                    fontWeight: '500'  
                  }}>  
                    Active  
                  </div>  
                </div>  
              </div>  
  
              {/* Access Level */}  
              <div style={{  
                display: 'flex',  
                alignItems: 'center',  
                gap: '1rem',  
                padding: '1rem',  
                backgroundColor: '#2a2a2a',  
                borderRadius: '8px',  
                border: '1px solid #444'  
              }}>  
                <div style={{  
                  width: '40px',  
                  height: '40px',  
                  backgroundColor: '#8b5cf6',  
                  borderRadius: '8px',  
                  display: 'flex',  
                  alignItems: 'center',  
                  justifyContent: 'center',  
                  fontSize: '1.25rem'  
                }}>  
                  🔐  
                </div>  
                <div>  
                  <div style={{  
                    fontSize: '0.875rem',  
                    color: '#9ca3af',  
                    marginBottom: '0.25rem'  
                  }}>  
                    Access Level  
                  </div>  
                  <div style={{  
                    fontSize: '1rem',  
                    color: '#ffffff',  
                    fontWeight: '500'  
                  }}>  
                    Full Access  
                  </div>  
                </div>  
              </div>  
  
              {/* Last Login */}  
              <div style={{  
                display: 'flex',  
                alignItems: 'center',  
                gap: '1rem',  
                padding: '1rem',  
                backgroundColor: '#2a2a2a',  
                borderRadius: '8px',  
                border: '1px solid #444'  
              }}>  
                <div style={{  
                  width: '40px',  
                  height: '40px',  
                  backgroundColor: '#f59e0b',  
                  borderRadius: '8px',  
                  display: 'flex',  
                  alignItems: 'center',  
                  justifyContent: 'center',  
                  fontSize: '1.25rem'  
                }}>  
                  🕐  
                </div>  
                <div>  
                  <div style={{  
                    fontSize: '0.875rem',  
                    color: '#9ca3af',  
                    marginBottom: '0.25rem'  
                  }}>  
                    Last Login  
                  </div>  
                  <div style={{  
                    fontSize: '1rem',  
                    color: '#ffffff',  
                    fontWeight: '500'  
                  }}>  
                    Just now  
                  </div>  
                </div>  
              </div>  
  
              {/* Phone */}  
              <div style={{  
                display: 'flex',  
                alignItems: 'center',  
                gap: '1rem',  
                padding: '1rem',  
                backgroundColor: '#2a2a2a',  
                borderRadius: '8px',  
                border: '1px solid #444'  
              }}>  
                <div style={{  
                  width: '40px',  
                  height: '40px',  
                  backgroundColor: '#06b6d4',  
                  borderRadius: '8px',  
                  display: 'flex',  
                  alignItems: 'center',  
                  justifyContent: 'center',  
                  fontSize: '1.25rem'  
                }}>  
                  📞  
                </div>  
                <div>  
                  <div style={{  
                    fontSize: '0.875rem',  
                    color: '#9ca3af',  
                    marginBottom: '0.25rem'  
                  }}>  
                    Phone  
                  </div>  
                  <div style={{  
                    fontSize: '1rem',  
                    color: '#ffffff',  
                    fontWeight: '500'  
                  }}>  
                    {adminFormData.phone || 'Not provided'}  
                  </div>  
                </div>  
              </div>  
  
              {/* Official Email */}  
              <div style={{  
                display: 'flex',  
                alignItems: 'center',  
                gap: '1rem',  
                padding: '1rem',  
                backgroundColor: '#2a2a2a',  
                borderRadius: '8px',  
                border: '1px solid #444'  
              }}>  
                <div style={{  
                  width: '40px',  
                  height: '40px',  
                  backgroundColor: '#ef4444',  
                  borderRadius: '8px',  
                  display: 'flex',  
                  alignItems: 'center',  
                  justifyContent: 'center',  
                  fontSize: '1.25rem'  
                }}>  
                  📧  
                </div>  
                <div>  
                  <div style={{  
                    fontSize: '0.875rem',  
                    color: '#9ca3af',  
                    marginBottom: '0.25rem'  
                  }}>  
                    Official Email  
                  </div>  
                  <div style={{  
                    fontSize: '1rem',  
                    color: '#ffffff',  
                    fontWeight: '500'  
                  }}>  
                    {adminFormData.official_mail || 'Not provided'}  
                  </div>  
                </div>  
              </div>  
            </div>  
          </div>    
        )}

         {/* Navigation Buttons */}  
         <div style={{  
          display: 'flex',  
          justifyContent: 'space-between',  
          alignItems: 'center',  
          marginBottom: '2rem'  
        }}>  
          <div style={{  
            display: 'flex',  
            gap: '1rem'  
          }}>  
            {[  
              { key: 'content', label: 'Content' },  
              { key: 'celebrity', label: 'Celebrity' },  
              { key: 'award', label: 'Award' }  
            ].map(tab => (  
              <button  
                key={tab.key}  
                onClick={() => setActiveTab(tab.key)}  
                style={{  
                  backgroundColor: activeTab === tab.key ? '#fbbf24' : '#2a2a2a',  
                  color: activeTab === tab.key ? '#000' : '#fff',  
                  padding: '0.75rem 1.5rem',  
                  borderRadius: '8px',  
                  border: '1px solid #444',  
                  cursor: 'pointer',  
                  fontWeight: 'bold',  
                  fontSize: '0.95rem',  
                  transition: 'all 0.3s ease'  
                }}  
              >  
                {tab.label}  
              </button>  
            ))}  
          </div>  
  
          {/* View Mode Toggle */}  
          {(activeTab === 'content' || activeTab === 'celebrity' ||activeTab==='award') && (  
            <div style={{  
              display: 'flex',  
              backgroundColor: '#2a2a2a',  
              borderRadius: '8px',  
              border: '1px solid #444',  
              overflow: 'hidden'  
            }}>  
              <button  
                onClick={() => setViewMode('list')}  
                style={{  
                  backgroundColor: viewMode === 'list' ? '#fbbf24' : 'transparent',  
                  color: viewMode === 'list' ? '#000' : '#9ca3af',  
                  padding: '0.5rem 1rem',  
                  border: 'none',  
                  cursor: 'pointer',  
                  fontSize: '0.875rem',  
                  display: 'flex',  
                  alignItems: 'center',  
                  gap: '0.5rem'  
                }}  
              >  
                ☰ List  
              </button>  
              <button  
                onClick={() => setViewMode('card')}  
                style={{  
                  backgroundColor: viewMode === 'card' ? '#fbbf24' : 'transparent',  
                  color: viewMode === 'card' ? '#000' : '#9ca3af',  
                  padding: '0.5rem 1rem',  
                  border: 'none',  
                  cursor: 'pointer',  
                  fontSize: '0.875rem',  
                  display: 'flex',  
                  alignItems: 'center',  
                  gap: '0.5rem'  
                }}  
              >  
                ⊞ Cards  
              </button>  
            </div>  
          )}  
        </div>

        {/* Content Area */}
        <div style={{
          backgroundColor: '#1f1f1f',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #333',
          minHeight: '400px'
        }}>
          {renderContent()}
        </div>

        {/* Add Movie Modal */}
        {showAddMovieModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}>
            <div style={{
              backgroundColor: '#1f1f1f',
              borderRadius: '12px',
              border: '1px solid #333',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowAddMovieModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
              >
                ×
              </button>

              <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Add New Movie</h2>

                {Object.entries({
                  title: 'Title',
                  description: 'Description',
                  release_date: 'Release Date',
                  duration: 'Duration (in minutes)',
                  poster_url: 'Poster URL',
                  trailer_url: 'Trailer URL',
                  budget: 'Budget',
                  box_office_collection: 'Box Office Collection',
                  currency_code: 'Currency Code',
                  min_age: 'Minimum Age',
                  views: 'Views',
                  country: 'Country', // ✅ NEW  
                  language: 'Language', // ✅ NEW  
                  // producer: 'Producer', // ✅ NEW  
                  // writer: 'Writer', // ✅ NEW  
                  // plot: 'Plot' // ✅ NEW
                }).map(([field, placeholder]) => (
                  field === 'description' ? (
                    <textarea
                      key={field}
                      name={field}
                      placeholder={placeholder}
                      value={movieData[field]}
                      onChange={handleChange}
                      required
                      rows={3}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #444',
                        backgroundColor: '#0a0a0a',
                        color: 'white',
                        fontSize: '0.95rem',
                        resize: 'vertical'
                      }}
                    />
                  ) : (
                    <input
                      key={field}
                      type={field === 'release_date' ? 'date' : field === 'budget' || field === 'box_office_collection' || field === 'duration' || field === 'language_id' || field === 'min_age' ? 'number' : 'text'}
                      name={field}
                      placeholder={placeholder}
                      value={movieData[field]}
                      onChange={handleChange}
                      required
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #444',
                        backgroundColor: '#0a0a0a',
                        color: 'white',
                        fontSize: '0.95rem'
                      }}
                    />
                  )
                ))}

                <select
                  name="type"
                  value={movieData.type}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: '#0a0a0a',
                    color: 'white',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="Movie">Movie</option>
                  <option value="Series">Series</option>
                  <option value="Documentary">Documentary</option>
                </select>

                {/* ✅ CHANGE 9: Replaced complex array sections with simple text inputs */}
                <input
                  type="text"
                  name="genres"
                  placeholder="Genres (comma-separated, e.g., Action, Drama, Comedy)"
                  value={movieData.genres}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: '#0a0a0a',
                    color: 'white',
                    fontSize: '0.95rem'
                  }}
                />

                <input
                  type="text"
                  name="top_cast"
                  placeholder="Top Cast (comma-separated, e.g., John Doe, Jane Smith, Bob Johnson)"
                  value={movieData.top_cast}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: '#0a0a0a',
                    color: 'white',
                    fontSize: '0.95rem'
                  }}
                />

                <input
                  type="text"
                  name="directors"
                  placeholder="Directors (comma-separated, e.g., Christopher Nolan, Steven Spielberg)"
                  value={movieData.directors}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: '#0a0a0a',
                    color: 'white',
                    fontSize: '0.95rem'
                  }}
                />

                <input
                  type="text"
                  name="awards"
                  placeholder="Awards (comma-separated, optional, e.g., Oscar Best Picture, Golden Globe)"
                  value={movieData.awards}
                  onChange={handleChange}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: '#0a0a0a',
                    color: 'white',
                    fontSize: '0.95rem'
                  }}
                />
                <input  
  type="text"  
  name="content_image_urls"  
  placeholder="Additional Movie Image URLs (comma-separated, optional)"  
  value={contentImageUrls}  
  onChange={(e) => setContentImageUrls(e.target.value)}  
  style={{  
    padding: '0.75rem',  
    borderRadius: '8px',  
    border: '1px solid #444',  
    backgroundColor: '#0a0a0a',  
    color: 'white',  
    fontSize: '0.95rem'  
  }}  
/>


                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddMovieModal(false)}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      flex: 1
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#fbbf24',
                      color: '#000',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      flex: 1
                    }}
                  >
                    Add Movie
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


       {/* Add Series Modal */}  
{showAddSeriesModal && (  
  <div style={{  
    position: 'fixed',  
    top: 0,  
    left: 0,  
    right: 0,  
    bottom: 0,  
    backgroundColor: 'rgba(0, 0, 0, 0.8)',  
    backdropFilter: 'blur(4px)',  
    display: 'flex',  
    alignItems: 'center',  
    justifyContent: 'center',  
    zIndex: 1000,  
    padding: '2rem'  
  }}>  
    <div style={{  
      backgroundColor: '#1f1f1f',  
      borderRadius: '12px',  
      border: '1px solid #333',  
      padding: '2rem',  
      maxWidth: '900px',  
      width: '100%',  
      maxHeight: '90vh',  
      overflowY: 'auto',  
      position: 'relative'  
    }}>  
      <button  
        onClick={() => setShowAddSeriesModal(false)}  
        style={{  
          position: 'absolute',  
          top: '1rem',  
          right: '1rem',  
          background: 'none',  
          border: 'none',  
          color: '#9ca3af',  
          fontSize: '1.5rem',  
          cursor: 'pointer',  
          padding: '0.5rem',  
          borderRadius: '4px'  
        }}  
      >  
        ×  
      </button>  
  
      <form onSubmit={handleSeriesSubmit} style={{  
        display: 'flex',  
        flexDirection: 'column',  
        gap: '1rem'  
      }}>  
        <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Add New Series</h2>  
  
        {/* Basic Series Info - Same as before */}  
        {Object.entries({  
          title: 'Title',  
          description: 'Description',  
          release_date: 'Release Date',  
          duration: 'Duration per episode (in minutes)',  
          poster_url: 'Poster URL',  
          trailer_url: 'Series Trailer URL',  
          budget: 'Budget',  
          box_office_collection: 'Box Office Collection',  
          currency_code: 'Currency Code',  
          min_age: 'Minimum Age',  
          views: 'Views',  
          country: 'Country',  
          language: 'Language'  
        }).map(([field, placeholder]) => (  
          field === 'description' ? (  
            <textarea  
              key={field}  
              name={field}  
              placeholder={placeholder}  
              value={seriesData[field]}  
              onChange={handleSeriesChange}  
              required  
              rows={3}  
              style={{  
                padding: '0.75rem',  
                borderRadius: '8px',  
                border: '1px solid #444',  
                backgroundColor: '#0a0a0a',  
                color: 'white',  
                fontSize: '0.95rem',  
                resize: 'vertical'  
              }}  
            />  
          ) : (  
            <input  
              key={field}  
              type={field === 'release_date' ? 'date' : ['budget', 'box_office_collection', 'duration', 'min_age', 'views'].includes(field) ? 'number' : 'text'}  
              name={field}  
              placeholder={placeholder}  
              value={seriesData[field]}  
              onChange={handleSeriesChange}  
              required  
              style={{  
                padding: '0.75rem',  
                borderRadius: '8px',  
                border: '1px solid #444',  
                backgroundColor: '#0a0a0a',  
                color: 'white',  
                fontSize: '0.95rem'  
              }}  
            />  
          )  
        ))}  
  
        {/* Genre, Cast, Directors, Awards - Same as before */}  
        <input  
          type="text"  
          name="genres"  
          placeholder="Genres (comma-separated, e.g., Drama, Thriller, Comedy)"  
          value={seriesData.genres}  
          onChange={handleSeriesChange}  
          required  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        />  
  
        <input  
          type="text"  
          name="top_cast"  
          placeholder="Top Cast (comma-separated)"  
          value={seriesData.top_cast}  
          onChange={handleSeriesChange}  
          required  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        />  
  
        <input  
          type="text"  
          name="directors"  
          placeholder="Directors (comma-separated)"  
          value={seriesData.directors}  
          onChange={handleSeriesChange}  
          required  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        />  
  
        <input  
          type="text"  
          name="awards"  
          placeholder="Awards (comma-separated, optional)"  
          value={seriesData.awards}  
          onChange={handleSeriesChange}  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        />  
  
        {/* Series Image URLs */}  
        <input  
          type="text"  
          name="series_image_urls"  
          placeholder="Additional Series Image URLs (comma-separated, optional)"  
          value={seriesImageUrls}  
          onChange={(e) => setSeriesImageUrls(e.target.value)}  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        />  
  
        {/* Season Count */}  
        <input  
          type="number"  
          name="season_count"  
          placeholder="Number of Seasons"  
          value={seriesData.season_count}  
          onChange={handleSeriesChange}  
          min="1"  
          max="20"  
          required  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        />  
  
       {/* Season Details with Inline Episodes */}    
<div style={{ marginTop: '1rem' }}>    
  <h3 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Season Details</h3>    
  {seasons.map((season, seasonIndex) => (    
    <div key={seasonIndex} style={{    
      backgroundColor: '#2a2a2a',    
      padding: '1rem',    
      borderRadius: '8px',    
      marginBottom: '1rem',    
      border: '1px solid #444'    
    }}>    
      <h4 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Season {season.season_number}</h4>    
  
      <input    
        type="text"    
        placeholder="Season Name"    
        value={season.season_name}    
        onChange={(e) => handleSeasonChange(seasonIndex, 'season_name', e.target.value)}    
        required    
        style={{    
          width: '100%',    
          padding: '0.5rem',    
          marginBottom: '0.5rem',    
          borderRadius: '6px',    
          border: '1px solid #444',    
          backgroundColor: '#0a0a0a',    
          color: 'white',    
          fontSize: '0.9rem'    
        }}    
      />    
  
      <textarea    
        placeholder="Season Description"    
        value={season.description}    
        onChange={(e) => handleSeasonChange(seasonIndex, 'description', e.target.value)}    
        required    
        rows={2}    
        style={{    
          width: '100%',    
          padding: '0.5rem',    
          marginBottom: '0.5rem',    
          borderRadius: '6px',    
          border: '1px solid #444',    
          backgroundColor: '#0a0a0a',    
          color: 'white',    
          fontSize: '0.9rem',    
          resize: 'vertical'    
        }}    
      />    
  
      {/* Season Poster URL */}  
      <input    
        type="text"    
        placeholder="Season Poster URL"    
        value={season.poster_url}    
        onChange={(e) => handleSeasonChange(seasonIndex, 'poster_url', e.target.value)}    
        style={{    
          width: '100%',    
          padding: '0.5rem',    
          marginBottom: '0.5rem',    
          borderRadius: '6px',    
          border: '1px solid #444',    
          backgroundColor: '#0a0a0a',    
          color: 'white',    
          fontSize: '0.9rem'    
        }}    
      />  
  
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>    
        <input    
          type="number"    
          placeholder="Episode Count"    
          value={season.episode_count}    
          onChange={(e) => handleSeasonChange(seasonIndex, 'episode_count', e.target.value)}    
          required    
          min="1"    
          style={{    
            flex: 1,    
            padding: '0.5rem',    
            borderRadius: '6px',    
            border: '1px solid #444',    
            backgroundColor: '#0a0a0a',    
            color: 'white',    
            fontSize: '0.9rem'    
          }}    
        />    
  
        <input    
          type="date"    
          placeholder="Release Date"    
          value={season.release_date}    
          onChange={(e) => handleSeasonChange(seasonIndex, 'release_date', e.target.value)}    
          required    
          style={{    
            flex: 1,    
            padding: '0.5rem',    
            borderRadius: '6px',    
            border: '1px solid #444',    
            backgroundColor: '#0a0a0a',    
            color: 'white',    
            fontSize: '0.9rem'    
          }}    
        />    
      </div>    
  
      <input    
        type="text"    
        placeholder="Season Trailer URL"    
        value={season.trailer_url}    
        onChange={(e) => handleSeasonChange(seasonIndex, 'trailer_url', e.target.value)}    
        style={{    
          width: '100%',    
          padding: '0.5rem',    
          marginBottom: '1rem',    
          borderRadius: '6px',    
          border: '1px solid #444',    
          backgroundColor: '#0a0a0a',    
          color: 'white',    
          fontSize: '0.9rem'    
        }}    
      />    
  
      {/* Episode Details - Inline */}    
      {season.episodes && season.episodes.length > 0 && (    
        <div style={{    
          backgroundColor: '#1a1a1a',    
          padding: '1rem',    
          borderRadius: '6px',    
          border: '1px solid #555'    
        }}>    
          <h5 style={{ color: '#fbbf24', marginBottom: '0.75rem', fontSize: '0.95rem' }}>    
            Episodes ({season.episodes.length})    
          </h5>    
              
          <div style={{     
            display: 'grid',     
            gap: '0.75rem',    
            maxHeight: '300px',    
            overflowY: 'auto'    
          }}>    
            {season.episodes.map((episode, episodeIndex) => (    
              <div key={episodeIndex} style={{    
                backgroundColor: '#333',    
                padding: '0.75rem',    
                borderRadius: '4px',    
                border: '1px solid #666'    
              }}>    
                <div style={{     
                  display: 'flex',     
                  alignItems: 'center',     
                  gap: '0.5rem',    
                  marginBottom: '0.5rem'    
                }}>    
                  <span style={{     
                    color: '#10b981',     
                    fontSize: '0.85rem',     
                    fontWeight: 'bold',    
                    minWidth: '60px'    
                  }}>    
                    Ep {episode.episode_number}:    
                  </span>    
                  <input    
                    type="text"    
                    placeholder="Episode Title"    
                    value={episode.title}    
                    onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'title', e.target.value)}    
                    style={{    
                      flex: 1,    
                      padding: '0.4rem',    
                      borderRadius: '4px',    
                      border: '1px solid #777',    
                      backgroundColor: '#0a0a0a',    
                      color: 'white',    
                      fontSize: '0.85rem'    
                    }}    
                  />    
                </div>    
                    
                <div style={{ display: 'flex', gap: '0.5rem' }}>    
                  <input    
                    type="number"    
                    placeholder="Duration (min)"    
                    value={episode.duration}    
                    onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'duration', e.target.value)}    
                    min="1"    
                    style={{    
                      flex: 1,    
                      padding: '0.4rem',    
                      borderRadius: '4px',    
                      border: '1px solid #777',    
                      backgroundColor: '#0a0a0a',    
                      color: 'white',    
                      fontSize: '0.85rem'    
                    }}    
                  />    
                      
                  <input    
                    type="date"    
                    value={episode.release_date}    
                    onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'release_date', e.target.value)}    
                    style={{    
                      flex: 1,    
                      padding: '0.4rem',    
                      borderRadius: '4px',    
                      border: '1px solid #777',    
                      backgroundColor: '#0a0a0a',    
                      color: 'white',    
                      fontSize: '0.85rem'    
                    }}    
                  />    
                </div>    
              </div>    
            ))}    
          </div>    
        </div>    
      )}    
    </div>    
  ))}    
</div>   
  
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>  
          <button  
            type="button"  
            onClick={() => setShowAddSeriesModal(false)}  
            style={{  
              backgroundColor: '#6b7280',  
              color: 'white',  
              padding: '0.75rem 1.5rem',  
              borderRadius: '8px',  
              border: 'none',  
              cursor: 'pointer',  
              fontSize: '0.95rem',  
              flex: 1  
            }}  
          >  
            Cancel  
          </button>  
          <button  
            type="submit"  
            style={{  
              backgroundColor: '#10b981',  
              color: 'white',  
              padding: '0.75rem 1.5rem',  
              borderRadius: '8px',  
              border: 'none',  
              fontWeight: 'bold',  
              cursor: 'pointer',  
              fontSize: '0.95rem',  
              flex: 1  
            }}  
          >  
            Add Series  
          </button>  
        </div>  
      </form>  
    </div>  
  </div>     
)}   


  {/* Edit Series Modal */}  
{showEditSeriesModal && (  
  <div style={{  
    position: 'fixed',  
    top: 0,  
    left: 0,  
    right: 0,  
    bottom: 0,  
    backgroundColor: 'rgba(0, 0, 0, 0.8)',  
    backdropFilter: 'blur(4px)',  
    display: 'flex',  
    alignItems: 'center',  
    justifyContent: 'center',  
    zIndex: 1000,  
    padding: '2rem'  
  }}>  
    <div style={{  
      backgroundColor: '#1f1f1f',  
      borderRadius: '12px',  
      border: '1px solid #333',  
      padding: '2rem',  
      maxWidth: '900px',  
      width: '100%',  
      maxHeight: '90vh',  
      overflowY: 'auto',  
      position: 'relative'  
    }}>  
      <button  
        onClick={() => setShowEditSeriesModal(false)}  
        style={{  
          position: 'absolute',  
          top: '1rem',  
          right: '1rem',  
          background: 'none',  
          border: 'none',  
          color: '#9ca3af',  
          fontSize: '1.5rem',  
          cursor: 'pointer',  
          padding: '0.5rem',  
          borderRadius: '4px'  
        }}  
      >  
        ×  
      </button>  
  
      <form onSubmit={handleEditSeriesSubmit} style={{  
        display: 'flex',  
        flexDirection: 'column',  
        gap: '1rem'  
      }}>  
        <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Edit Series</h2>  
  
        {/* Basic Series Info */}  
        {Object.entries({  
          title: 'Title',  
          description: 'Description',  
          release_date: 'Release Date',  
          duration: 'Duration per episode (in minutes)',  
          poster_url: 'Poster URL',  
          trailer_url: 'Series Trailer URL',  
          budget: 'Budget',  
          box_office_collection: 'Box Office Collection',  
          currency_code: 'Currency Code',  
          min_age: 'Minimum Age',  
          views: 'Views',  
          country: 'Country',  
          language: 'Language'  
        }).map(([field, placeholder]) => (  
          field === 'description' ? (  
            <textarea  
              key={field}  
              name={field}  
              placeholder={placeholder}  
              value={seriesData[field]}  
              onChange={handleSeriesChange}  
              required  
              rows={3}  
              style={{  
                padding: '0.75rem',  
                borderRadius: '8px',  
                border: '1px solid #444',  
                backgroundColor: '#0a0a0a',  
                color: 'white',  
                fontSize: '0.95rem',  
                resize: 'vertical'  
              }}  
            />  
          ) : (  
            <input  
              key={field}  
              type={field === 'release_date' ? 'date' : ['budget', 'box_office_collection', 'duration', 'min_age', 'views'].includes(field) ? 'number' : 'text'}  
              name={field}  
              placeholder={placeholder}  
              value={seriesData[field]}  
              onChange={handleSeriesChange}  
              required  
              style={{  
                padding: '0.75rem',  
                borderRadius: '8px',  
                border: '1px solid #444',  
                backgroundColor: '#0a0a0a',  
                color: 'white',  
                fontSize: '0.95rem'  
              }}  
            />  
          )  
        ))}  
  
        {/* Genre, Cast, Directors, Awards */}  
        <input  
          type="text"  
          name="genres"  
          placeholder="Genres (comma-separated, e.g., Drama, Thriller, Comedy)"  
          value={seriesData.genres}  
          onChange={handleSeriesChange}  
          required  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        />  
  
        <input  
          type="text"  
          name="top_cast"  
          placeholder="Top Cast (comma-separated)"  
          value={seriesData.top_cast}  
          onChange={handleSeriesChange}  
          required  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        />  
  
        <input  
          type="text"  
          name="directors"  
          placeholder="Directors (comma-separated)"  
          value={seriesData.directors}  
          onChange={handleSeriesChange}  
          required  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        />  
  
        <input  
          type="text"  
          name="awards"  
          placeholder="Awards (comma-separated, optional)"  
          value={seriesData.awards}  
          onChange={handleSeriesChange}  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        />  
  
        {/* Series Image URLs */}  
        <input  
          type="text"  
          name="series_image_urls"  
          placeholder="Additional Series Image URLs (comma-separated, optional)"  
          value={seriesImageUrls}  
          onChange={(e) => setSeriesImageUrls(e.target.value)}  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        />  
  
        {/* Season Count */}  
        <input  
          type="number"  
          name="season_count"  
          placeholder="Number of Seasons"  
          value={seriesData.season_count}  
          onChange={handleSeriesChange}  
          min="1"  
          max="20"  
          required  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        />  
  
        {/* Season Details with Inline Episodes */}  
        <div style={{ marginTop: '1rem' }}>  
          <h3 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Season Details</h3>  
          {seasons.map((season, seasonIndex) => (  
            <div key={seasonIndex} style={{  
              backgroundColor: '#2a2a2a',  
              padding: '1rem',  
              borderRadius: '8px',  
              marginBottom: '1rem',  
              border: '1px solid #444'  
            }}>  
              <h4 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Season {season.season_number}</h4>  
  
              <input  
                type="text"  
                placeholder="Season Name"  
                value={season.season_name}  
                onChange={(e) => handleSeasonChange(seasonIndex, 'season_name', e.target.value)}  
                required  
                style={{  
                  width: '100%',  
                  padding: '0.5rem',  
                  marginBottom: '0.5rem',  
                  borderRadius: '6px',  
                  border: '1px solid #444',  
                  backgroundColor: '#0a0a0a',  
                  color: 'white',  
                  fontSize: '0.9rem'  
                }}  
              />  
  
              <textarea  
                placeholder="Season Description"  
                value={season.description}  
                onChange={(e) => handleSeasonChange(seasonIndex, 'description', e.target.value)}  
                required  
                rows={2}  
                style={{  
                  width: '100%',  
                  padding: '0.5rem',  
                  marginBottom: '0.5rem',  
                  borderRadius: '6px',  
                  border: '1px solid #444',  
                  backgroundColor: '#0a0a0a',  
                  color: 'white',  
                  fontSize: '0.9rem',  
                  resize: 'vertical'  
                }}  
              />  
  
              {/* Season Poster URL */}  
              <input  
                type="text"  
                placeholder="Season Poster URL"  
                value={season.poster_url}  
                onChange={(e) => handleSeasonChange(seasonIndex, 'poster_url', e.target.value)}  
                style={{  
                  width: '100%',  
                  padding: '0.5rem',  
                  marginBottom: '0.5rem',  
                  borderRadius: '6px',  
                  border: '1px solid #444',  
                  backgroundColor: '#0a0a0a',  
                  color: 'white',  
                  fontSize: '0.9rem'  
                }}  
              />  
  
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>  
                <input  
                  type="number"  
                  placeholder="Episode Count"  
                  value={season.episode_count}  
                  onChange={(e) => handleSeasonChange(seasonIndex, 'episode_count', e.target.value)}  
                  required  
                  min="1"  
                  style={{  
                    flex: 1,  
                    padding: '0.5rem',  
                    borderRadius: '6px',  
                    border: '1px solid #444',  
                    backgroundColor: '#0a0a0a',  
                    color: 'white',  
                    fontSize: '0.9rem'  
                  }}  
                />  
  
                <input  
                  type="date"  
                  placeholder="Release Date"  
                  value={season.release_date}  
                  onChange={(e) => handleSeasonChange(seasonIndex, 'release_date', e.target.value)}  
                  required  
                  style={{  
                    flex: 1,  
                    padding: '0.5rem',  
                    borderRadius: '6px',  
                    border: '1px solid #444',  
                    backgroundColor: '#0a0a0a',  
                    color: 'white',  
                    fontSize: '0.9rem'  
                  }}  
                />  
              </div>  
  
              <input  
                type="text"  
                placeholder="Season Trailer URL"  
                value={season.trailer_url}  
                onChange={(e) => handleSeasonChange(seasonIndex, 'trailer_url', e.target.value)}  
                style={{  
                  width: '100%',  
                  padding: '0.5rem',  
                  marginBottom: '1rem',  
                  borderRadius: '6px',  
                  border: '1px solid #444',  
                  backgroundColor: '#0a0a0a',  
                  color: 'white',  
                  fontSize: '0.9rem'  
                }}  
              />  
  
              {/* Episode Details - Inline */}  
              {season.episodes && season.episodes.length > 0 && (  
                <div style={{  
                  backgroundColor: '#1a1a1a',  
                  padding: '1rem',  
                  borderRadius: '6px',  
                  border: '1px solid #555'  
                }}>  
                  <h5 style={{ color: '#fbbf24', marginBottom: '0.75rem', fontSize: '0.95rem' }}>  
                    Episodes ({season.episodes.length})  
                  </h5>  
  
                  <div style={{  
                    display: 'grid',  
                    gap: '0.75rem',  
                    maxHeight: '300px',  
                    overflowY: 'auto'  
                  }}>  
                    {season.episodes.map((episode, episodeIndex) => (  
                      <div key={episodeIndex} style={{  
                        backgroundColor: '#333',  
                        padding: '0.75rem',  
                        borderRadius: '4px',  
                        border: '1px solid #666'  
                      }}>  
                        <div style={{  
                          display: 'flex',  
                          alignItems: 'center',  
                          gap: '0.5rem',  
                          marginBottom: '0.5rem'  
                        }}>  
                          <span style={{  
                            color: '#10b981',  
                            fontSize: '0.85rem',  
                            fontWeight: 'bold',  
                            minWidth: '60px'  
                          }}>  
                            Ep {episode.episode_number}:  
                          </span>  
                          <input  
                            type="text"  
                            placeholder="Episode Title"  
                            value={episode.title}  
                            onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'title', e.target.value)}  
                            style={{ 
flex: 1,  
                              padding: '0.4rem',  
                              borderRadius: '4px',  
                              border: '1px solid #777',  
                              backgroundColor: '#0a0a0a',  
                              color: 'white',  
                              fontSize: '0.85rem'  
                            }}  
                          />  
                        </div>  
  
                        <div style={{ display: 'flex', gap: '0.5rem' }}>  
                          <input  
                            type="number"  
                            placeholder="Duration (min)"  
                            value={episode.duration}  
                            onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'duration', e.target.value)}  
                            min="1"  
                            style={{  
                              flex: 1,  
                              padding: '0.4rem',  
                              borderRadius: '4px',  
                              border: '1px solid #777',  
                              backgroundColor: '#0a0a0a',  
                              color: 'white',  
                              fontSize: '0.85rem'  
                            }}  
                          />  
  
                          <input  
                            type="date"  
                            value={episode.release_date}  
                            onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'release_date', e.target.value)}  
                            style={{  
                              flex: 1,  
                              padding: '0.4rem',  
                              borderRadius: '4px',  
                              border: '1px solid #777',  
                              backgroundColor: '#0a0a0a',  
                              color: 'white',  
                              fontSize: '0.85rem'  
                            }}  
                          />  
                        </div>  
                      </div>  
                    ))}  
                  </div>  
                </div>  
              )}  
            </div>  
          ))}  
        </div>  
  
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>  
          <button  
            type="button"  
            onClick={() => setShowEditSeriesModal(false)}  
            style={{  
              backgroundColor: '#6b7280',  
              color: 'white',  
              padding: '0.75rem 1.5rem',  
              borderRadius: '8px',  
              border: 'none',  
              cursor: 'pointer',  
              fontSize: '0.95rem',  
              flex: 1  
            }}  
          >  
            Cancel  
          </button>  
          <button  
            type="submit"  
            style={{  
              backgroundColor: '#10b981',  
              color: 'white',  
              padding: '0.75rem 1.5rem',  
              borderRadius: '8px',  
              border: 'none',  
              fontWeight: 'bold',  
              cursor: 'pointer',  
              fontSize: '0.95rem',  
              flex: 1  
            }}  
          >  
            Update Series  
          </button>  
        </div>  
      </form>  
    </div>  
  </div>  
)}  

        {/* Add Celebrity Modal */}
        {showAddCelebrityModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}>
            <div style={{
              backgroundColor: '#1f1f1f',
              borderRadius: '12px',
              border: '1px solid #333',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowAddCelebrityModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
              >
                ×
              </button>

              <form onSubmit={handleCelebritySubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Add New Celebrity</h2>

                {Object.entries({
                  name: 'Name',
                  bio: 'Bio',
                  birth_date: 'Birth Date',
                  death_date: 'Death Date',
                  profession: 'Profession',
                  //years_active: 'Years Active',
                  //height: 'Height (cm)',
                  place_of_birth: 'Place of Birth',
                  gender: 'Gender',
                  photo_url: 'Photo URL'
                }).map(([field, placeholder]) => (
                  <input
                    key={field}
                    type={field.includes('date') ? 'date' : 'text'}
                    name={field}
                    placeholder={placeholder}
                    value={celebrityData[field]}
                    onChange={handleCelebrityChange}
                    //required
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #444',
                      backgroundColor: '#0a0a0a',
                      color: 'white',
                      fontSize: '0.95rem'
                    }}
                  />
                ))}
                {/* Add this after the photo_url input in Add Celebrity Modal */}  
<input  
  type="text"  
  name="celebrity_image_urls"  
  placeholder="Additional Celebrity Image URLs (comma-separated, optional)"  
  value={celebrityImageUrls}  
  onChange={(e) => setCelebrityImageUrls(e.target.value)}  
  style={{  
    padding: '0.75rem',  
    borderRadius: '8px',  
    border: '1px solid #444',  
    backgroundColor: '#0a0a0a',  
    color: 'white',  
    fontSize: '0.95rem'  
  }}  
/>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddCelebrityModal(false)}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      flex: 1
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#fbbf24',
                      color: '#000',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      flex: 1
                    }}
                  >
                    Add Celebrity
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Award Modal */}
        {showAddAwardModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}>
            <div style={{
              backgroundColor: '#1f1f1f',
              borderRadius: '12px',
              border: '1px solid #333',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowAddAwardModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
              >
                ×
              </button>

              <form onSubmit={handleAwardSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Add New Award</h2>

                {Object.entries({
                  name: 'Award Name',
                  year: 'Year',
                  type: 'Type'
                }).map(([field, placeholder]) => (
                  <input
                    key={field}
                    type={field === 'year' ? 'number' : 'text'}
                    name={field}
                    placeholder={placeholder}
                    value={awardData[field]}
                    onChange={handleAwardChange}
                    required
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #444',
                      backgroundColor: '#0a0a0a',
                      color: 'white',
                      fontSize: '0.95rem'
                    }}
                  />
                ))}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddAwardModal(false)}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      flex: 1
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#fbbf24',
                      color: '#000',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      flex: 1
                    }}
                  >
                    Add Award
                  </button>
                </div>
              </form>
            </div>
          </div>
       )} 
       
        {/* Edit Content Modal */}  
{showEditContentModal && (  
  <div style={{  
    position: 'fixed',  
    top: 0,  
    left: 0,  
    right: 0,  
    bottom: 0,  
    backgroundColor: 'rgba(0, 0, 0, 0.8)',  
    backdropFilter: 'blur(4px)',  
    display: 'flex',  
    alignItems: 'center',  
    justifyContent: 'center',  
    zIndex: 1000,  
    padding: '2rem'  
  }}>  
    <div style={{  
      backgroundColor: '#1f1f1f',  
      borderRadius: '12px',  
      border: '1px solid #333',  
      padding: '2rem',  
      maxWidth: '500px',  
      width: '100%',  
      maxHeight: '90vh',  
      overflowY: 'auto',  
      position: 'relative'  
    }}>  
      <button  
        onClick={() => setShowEditContentModal(false)}  
        style={{  
          position: 'absolute',  
          top: '1rem',  
          right: '1rem',  
          background: 'none',  
          border: 'none',  
          color: '#9ca3af',  
          fontSize: '1.5rem',  
          cursor: 'pointer',  
          padding: '0.5rem',  
          borderRadius: '4px'  
        }}  
      >  
        ×  
      </button>  
  
      <form onSubmit={(e) => handleEditSubmit(e, 'content')} style={{  
        display: 'flex',  
        flexDirection: 'column',  
        gap: '1rem'  
      }}>  
        <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Edit Content</h2>  
  
        {Object.entries({  
          title: 'Title',  
          description: 'Description',  
          release_date: 'Release Date',  
          duration: 'Duration (in minutes)',  
          poster_url: 'Poster URL',  
          trailer_url: 'Trailer URL',  
          budget: 'Budget',  
          box_office_collection: 'Box Office Collection',  
          currency_code: 'Currency Code',  
          min_age: 'Minimum Age',  
          views: 'Views',  
          country: 'Country',  
          language: 'Language'  
        }).map(([field, placeholder]) => (  
          field === 'description' ? (  
            <textarea  
              key={field}  
              name={field}  
              placeholder={placeholder}  
              value={movieData[field]}  
              onChange={handleChange}  
              required  
              rows={3}  
              style={{  
                padding: '0.75rem',  
                borderRadius: '8px',  
                border: '1px solid #444',  
                backgroundColor: '#0a0a0a',  
                color: 'white',  
                fontSize: '0.95rem',  
                resize: 'vertical'  
              }}  
            />  
          ) : (  
            <input  
              key={field}  
              type={field === 'release_date' ? 'date' : field === 'budget' || field === 'box_office_collection' || field === 'duration' || field === 'min_age' || field === 'views' ? 'number' : 'text'}  
              name={field}  
              placeholder={placeholder}  
              value={movieData[field]}  
              onChange={handleChange}  
              required  
              style={{  
                padding: '0.75rem',  
                borderRadius: '8px',  
                border: '1px solid #444',  
                backgroundColor: '#0a0a0a',  
                color: 'white',  
                fontSize: '0.95rem'  
              }}  
            />  
          )  
        ))}  
  
        <select  
          name="type"  
          value={movieData.type}  
          onChange={handleChange}  
          required  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        >  
          <option value="Movie">Movie</option>  
          <option value="Series">Series</option>  
          <option value="Documentary">Documentary</option>  
        </select>  
  
        <input  
          type="text"  
          name="genres"  
          placeholder="Genres (comma-separated)"  
          value={movieData.genres}  
          onChange={handleChange}  
          required  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        />  
  
        <input  
          type="text"  
          name="top_cast"  
          placeholder="Top Cast (comma-separated)"  
          value={movieData.top_cast}  
          onChange={handleChange}  
          required  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        />  
  
        <input  
          type="text"  
          name="directors"  
          placeholder="Directors (comma-separated)"  
          value={movieData.directors}  
          onChange={handleChange}  
          required  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        />  
  
        <input  
          type="text"  
          name="awards"  
          placeholder="Awards (comma-separated, optional)"  
          value={movieData.awards}  
          onChange={handleChange}  
          style={{  
            padding: '0.75rem',  
            borderRadius: '8px',  
            border: '1px solid #444',  
            backgroundColor: '#0a0a0a',  
            color: 'white',  
            fontSize: '0.95rem'  
          }}  
        />  
  
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>  
          <button  
            type="button"  
            onClick={() => setShowEditContentModal(false)}  
            style={{  
              backgroundColor: '#6b7280',  
              color: 'white',  
              padding: '0.75rem 1.5rem',  
              borderRadius: '8px',  
              border: 'none',  
              cursor: 'pointer',  
              fontSize: '0.95rem',  
              flex: 1  
            }}  
          >  
            Cancel  
          </button>  
          <button  
            type="submit"  
            style={{  backgroundColor: '#6b7280',  
              color: 'white',  
              padding: '0.75rem 1.5rem',  
              borderRadius: '8px',  
              border: 'none',  
              cursor: 'pointer',  
              fontSize: '0.95rem',  
              flex: 1  
            }}  
          > 
            Update Content  
          </button>  
        </div>  
      </form>  
    </div>  
  </div>  
)}  
  
{/* Edit Celebrity Modal */}  
{showEditCelebrityModal && (  
  <div style={{  
    position: 'fixed',  
    top: 0,  
    left: 0,  
    right: 0,  
    bottom: 0,  
    backgroundColor: 'rgba(0, 0, 0, 0.8)',  
    display: 'flex',  
    alignItems: 'center',  
    justifyContent: 'center',  
    zIndex: 1000,  
    padding: '2rem'  
  }}>  
    <div style={{  
      backgroundColor: '#1f1f1f',  
      borderRadius: '12px',  
      border: '1px solid #333',  
      padding: '2rem',  
      maxWidth: '500px',  
      width: '100%',  
      maxHeight: '90vh',  
      overflowY: 'auto',  
      position: 'relative'  
    }}>  
      <button  
        onClick={() => setShowEditCelebrityModal(false)}  
        style={{  
          position: 'absolute',  
          top: '1rem',  
          right: '1rem',  
          background: 'none',  
          border: 'none',  
          color: '#9ca3af',  
          fontSize: '1.5rem',  
          cursor: 'pointer',  
          padding: '0.5rem',  
          borderRadius: '4px'  
        }}  
      >  
        ×  
      </button>  
  
      <form onSubmit={(e) => handleEditSubmit(e, 'celebrity')} style={{  
        display: 'flex',  
        flexDirection: 'column',  
        gap: '1rem'  
      }}>  
        <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Edit Celebrity</h2>  
  
        {Object.entries({  
          name: 'Name',  
          bio: 'Bio',  
          birth_date: 'Birth Date',  
          death_date: 'Death Date',  
          profession: 'Profession',  
          place_of_birth: 'Place of Birth',  
          gender: 'Gender',  
          photo_url: 'Photo URL'  
        }).map(([field, placeholder]) => (  
          <input  
            key={field}  
            type={field.includes('date') ? 'date' : 'text'}  
            name={field}  
            placeholder={placeholder}  
            value={celebrityData[field]}  
            onChange={handleCelebrityChange}  
            style={{  
              padding: '0.75rem',  
              borderRadius: '8px',  
              border: '1px solid #444',  
              backgroundColor: '#0a0a0a',  
              color: 'white',  
              fontSize: '0.95rem'  
            }}  
            
          /> 
           
        ))} 
        <input  
  type="text"  
  name="image_urls"  
  placeholder="Additional Image URLs (comma-separated, optional)"  
  value={contentImageUrls}  
  onChange={(e) => setContentImageUrls(e.target.value)}  
  style={{  
    padding: '0.75rem',  
    borderRadius: '8px',  
    border: '1px solid #444',  
    backgroundColor: '#0a0a0a',  
    color: 'white',  
    fontSize: '0.95rem'  
  }}  
/>   
  
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>  
          <button  
            type="button"  
            onClick={() => setShowEditCelebrityModal(false)}  
            style={{  
              backgroundColor: '#6b7280',  
              color: 'white',  
              padding: '0.75rem 1.5rem',  
              borderRadius: '8px',  
              border: 'none',  
              cursor: 'pointer',  
              fontSize: '0.95rem',  
              flex: 1  
            }}  
          >  
            Cancel  
          </button>  
          <button  
            type="submit"  
            style={{  
              backgroundColor: '#fbbf24',  
              color: '#000',  
              padding: '0.75rem 1.5rem',  
              borderRadius: '8px',  
              border: 'none',  
              fontWeight: 'bold',  
              cursor: 'pointer',  
              fontSize: '0.95rem',  
              flex: 1  
            }}  
          >  
            Update Celebrity  
          </button>  
        </div>  
      </form>  
    </div>  
  </div>  
)}  
  
{/* Edit Award Modal */}  
{showEditAwardModal && (  
  <div style={{  
    position: 'fixed',  
    top: 0,  
    left: 0,  
    right: 0,  
    bottom: 0,  
    backgroundColor: 'rgba(0, 0, 0, 0.8)',  
    display: 'flex',  
    alignItems: 'center',  
    justifyContent: 'center',  
    zIndex: 1000,  
    padding: '2rem'  
  }}>  
    <div style={{  
      backgroundColor: '#1f1f1f',  
      borderRadius: '12px',  
      border: '1px solid #333',  
      padding: '2rem',  
      maxWidth: '500px',  
      width: '100%',  
      maxHeight: '90vh',  
      overflowY: 'auto',  
      position: 'relative'  
    }}>  
      <button  
        onClick={() => setShowEditAwardModal(false)}  
        style={{  
          position: 'absolute',  
          top: '1rem',  
          right: '1rem',  
          background: 'none',  
          border: 'none',  
          color: '#9ca3af',  
          fontSize: '1.5rem',  
          cursor: 'pointer',  
          padding: '0.5rem',  
          borderRadius: '4px'  
        }}  
      >  
        ×  
      </button>  
  
      <form onSubmit={(e) => handleEditSubmit(e, 'award')} style={{  
        display: 'flex',  
        flexDirection: 'column',  
        gap: '1rem'  
      }}>  
        <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Edit Award</h2>  
  
        {Object.entries({  
          name: 'Award Name',  
          year: 'Year',  
          type: 'Type'  
        }).map(([field, placeholder]) => (  
          <input  
            key={field}  
            type={field === 'year' ? 'number' : 'text'}  
            name={field}  
            placeholder={placeholder}  
            value={awardData[field]}  
            onChange={handleAwardChange}  
            required  
            style={{  
              padding: '0.75rem',  
              borderRadius: '8px',  
              border: '1px solid #444',  
              backgroundColor: '#0a0a0a',  
              color: 'white',  
              fontSize: '0.95rem'  
            }}  
          />  
        ))}  
  
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>  
          <button  
            type="button"  
            onClick={() => setShowEditAwardModal(false)}  
            style={{  
              backgroundColor: '#6b7280',  
              color: 'white',  
              padding: '0.75rem 1.5rem',  
              borderRadius: '8px',  
              border: 'none',  
              cursor: 'pointer',  
              fontSize: '0.95rem',  
              flex: 1  
            }}  
          >  
            Cancel  
          </button>  
          <button  
            type="submit"  
            style={{  
              backgroundColor: '#fbbf24',  
              color: '#000',  
              padding: '0.75rem 1.5rem',  
              borderRadius: '8px',  
              border: 'none',  
              fontWeight: 'bold',  
              cursor: 'pointer',  
              fontSize: '0.95rem',  
              flex: 1  
            }}  
          >  
            Update Award  
          </button>  
        </div>  
      </form>  
    </div>  
  </div>  
)} 
  
       {/* Footer */}  
       <footer style={{  
         backgroundColor: '#1f1f1f',  
         borderRadius: '12px',  
         padding: '3rem 2rem 2rem',  
         marginTop: '4rem',  
         border: '1px solid #333'  
       }}>  
         <div style={{  
           display: 'grid',  
           gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',  
           gap: '2rem',  
           marginBottom: '2rem'  
         }}>  
           <div>  
             <h3 style={{ color: '#fbbf24', fontSize: '1.5rem', marginBottom: '1rem' }}>FilmFusion Admin</h3>  
             <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: '1rem' }}>  
               Administrative panel for managing movies, TV shows, celebrities, and awards.  
               Maintain and curate the ultimate entertainment database.  
             </p>  
             <div style={{ display: 'flex', gap: '1rem' }}>  
               <span style={{ color: '#fbbf24', fontSize: '1.5rem' }}>⚙️</span>  
               <span style={{ color: '#fbbf24', fontSize: '1.5rem' }}>📊</span>  
               <span style={{ color: '#fbbf24', fontSize: '1.5rem' }}>🎬</span>  
               <span style={{ color: '#fbbf24', fontSize: '1.5rem' }}>🏆</span>  
             </div>  
           </div>  
 
           <div>  
             <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '1rem' }}>Content Management</h4>  
             <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>  
               {['Add Movies', 'Add Series', 'Manage Content', 'Content Analytics'].map(item => (  
                 <li key={item} style={{ marginBottom: '0.5rem' }}>  
                   <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{item}</span>  
                 </li>  
               ))}  
             </ul>  
           </div>  
 
           <div>  
             <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '1rem' }}>Celebrity Management</h4>  
             <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>  
               {['Add Celebrities', 'Manage Profiles', 'Role Assignment', 'Celebrity Analytics'].map(item => (  
                 <li key={item} style={{ marginBottom: '0.5rem' }}>  
                   <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{item}</span>  
                 </li>  
               ))}  
             </ul>  
           </div>  
 
           <div>  
             <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '1rem' }}>System</h4>  
             <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>  
               {['Admin Settings', 'User Management', 'System Logs', 'Database Backup'].map(item => (  
                 <li key={item} style={{ marginBottom: '0.5rem' }}>  
                   <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{item}</span>  
                 </li>  
               ))}  
             </ul>  
           </div>  
         </div>  
 
         <div style={{  
           borderTop: '1px solid #333',  
           paddingTop: '2rem',  
           display: 'flex',  
           justifyContent: 'space-between',  
           alignItems: 'center',  
           flexWrap: 'wrap',  
           gap: '1rem'  
         }}>  
           <div>  
             <p style={{ color: '#9ca3af', margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>  
               © 2025 FilmFusion Admin Panel. All rights reserved.  
             </p>  
             <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.875rem' }}>  
               Secure administrative access for content management. 🔐  
             </p>  
           </div>  
           <div style={{ display: 'flex', gap: '1.5rem' }}>  
             <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Admin Guidelines</span>  
             <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Security Policy</span>  
             <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Support</span>  
           </div>  
         </div>  
       </footer>  
     </div>  
   </div>  
 );  
};  
 
export default AdminDashboard;
