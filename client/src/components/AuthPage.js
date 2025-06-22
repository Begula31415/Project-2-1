// import React, {Fragment, useState} from "react"

// const InputTodo = () => {

//     const [description, setDescription] = useState("");

//     const onSubmitForm = async(e) => {
//         e.preventDefault();
//         try{
//             const body  = {description};
//             const response = await fetch("http://localhost:5000/todos", {
//                 method: "POST",
//                 headers: {"Content-Type": "application/json"},
//                 body: JSON.stringify(body)
//             });

//             window.location = "/";
//         }catch(err){
//             console.log(err.message);
//         }
//     };
//     return (
//         <Fragment>
//             <h1 className="text-center mt-5">Pern Todo List</h1>
//             <form className = "d-flex mt-5" onSubmit={onSubmitForm}>
//                 <input type = "text" className = "form-control" value = {description} onChange={e => setDescription(e.target.value)}/>
//                 <button className = "btn btn-success">Add</button>

//             </form>
//         </Fragment>
//     );
// };

// export default InputTodo;

import React, { useState } from 'react';
import { signIn, signUp } from '../services/api';

const AuthPage = ({ mode, onClose, onAuthSuccess, onSwitchMode }) => {
  const [formData, setFormData] = useState({
    // Common fields
    username: '',
    password: '',
    role: '',
    // Sign up specific fields
    name: '',
    email: '',
    bio: '',
    birth_date: '',
    location: '',
    // Admin specific fields
    phone: '',
    official_mail: '',
    // User specific fields
    profile_picture_url: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    const signInData = {
      username: formData.username,
      password_hash: formData.password,
      role: formData.role
    };

    try {
      const result = await signIn(signInData);
      alert('Sign in successful!');
      onAuthSuccess(result.user);
    } catch (error) {
      alert(error.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const signUpData = {
      name: formData.name,
      email: formData.email,
      username: formData.username,
      password_hash: formData.password,
      role: formData.role,
      bio: formData.bio,
      birth_date: formData.birth_date,
      location: formData.location
    };

    // Add role-specific fields
    if (formData.role === 'admin') {
      signUpData.phone = formData.phone;
      signUpData.official_mail = formData.official_mail;
    } else if (formData.role === 'user') {
      signUpData.profile_picture_url = formData.profile_picture_url;
    }

    try {
      await signUp(signUpData);
      alert('Account created successfully! Please sign in.');
      onSwitchMode('signin');
    } catch (error) {
      alert(error.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const renderSignInForm = () => (
    <form onSubmit={handleSignIn}>
      <div className="form-group">
        <label htmlFor="signInUsername">Username</label>
        <input 
          type="text" 
          id="signInUsername" 
          name="username" 
          value={formData.username}
          onChange={handleInputChange}
          required 
        />
      </div>
      <div className="form-group">
        <label htmlFor="signInPassword">Password</label>
        <input 
          type="password" 
          id="signInPassword" 
          name="password" 
          value={formData.password}
          onChange={handleInputChange}
          required 
        />
      </div>
      <div className="form-group">
        <label htmlFor="signInRole">Role</label>
        <select 
          id="signInRole" 
          name="role" 
          value={formData.role}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );

  const renderSignUpForm = () => (
    <form onSubmit={handleSignUp}>
      <div className="form-group">
        <label htmlFor="signUpName">Full Name</label>
        <input 
          type="text" 
          id="signUpName" 
          name="name" 
          value={formData.name}
          onChange={handleInputChange}
          required 
        />
      </div>
      <div className="form-group">
        <label htmlFor="signUpEmail">Email</label>
        <input 
          type="email" 
          id="signUpEmail" 
          name="email" 
          value={formData.email}
          onChange={handleInputChange}
          required 
        />
      </div>
      <div className="form-group">
        <label htmlFor="signUpUsername">Username</label>
        <input 
          type="text" 
          id="signUpUsername" 
          name="username" 
          value={formData.username}
          onChange={handleInputChange}
          required 
        />
      </div>
      <div className="form-group">
        <label htmlFor="signUpPassword">Password</label>
        <input 
          type="password" 
          id="signUpPassword" 
          name="password" 
          value={formData.password}
          onChange={handleInputChange}
          required 
        />
      </div>
      <div className="form-group">
        <label htmlFor="signUpRole">Role</label>
        <select 
          id="signUpRole" 
          name="role" 
          value={formData.role}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="signUpBio">Bio (Optional)</label>
        <input 
          type="text" 
          id="signUpBio" 
          name="bio" 
          value={formData.bio}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="signUpBirthDate">Birth Date</label>
        <input 
          type="date" 
          id="signUpBirthDate" 
          name="birth_date" 
          value={formData.birth_date}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="signUpLocation">Location</label>
        <input 
          type="text" 
          id="signUpLocation" 
          name="location" 
          value={formData.location}
          onChange={handleInputChange}
        />
      </div>
      
      {/* Admin-specific fields */}
      {formData.role === 'admin' && (
        <div id="adminFields">
          <div className="form-group">
            <label htmlFor="signUpPhone">Phone</label>
            <input 
              type="tel" 
              id="signUpPhone" 
              name="phone" 
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="signUpOfficialMail">Official Email</label>
            <input 
              type="email" 
              id="signUpOfficialMail" 
              name="official_mail" 
              value={formData.official_mail}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      )}
      
      {/* User-specific fields */}
      {formData.role === 'user' && (
        <div id="userFields">
          <div className="form-group">
            <label htmlFor="signUpProfilePic">Profile Picture URL (Optional)</label>
            <input 
              type="url" 
              id="signUpProfilePic" 
              name="profile_picture_url" 
              value={formData.profile_picture_url}
              onChange={handleInputChange}
            />
          </div>
        </div>
      )}
      
      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );

  return (
    <div className="modal" onClick={handleModalClick}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2 className="form-title">
          {mode === 'signin' ? 'Sign In to FilmFusion' : 'Join FilmFusion'}
        </h2>
        
        {mode === 'signin' ? renderSignInForm() : renderSignUpForm()}
        
        <div className="form-switch">
          {mode === 'signin' ? (
            <>
              Don't have an account? {' '}
              <a onClick={() => onSwitchMode('signup')}>Sign Up</a>
            </>
          ) : (
            <>
              Already have an account? {' '}
              <a onClick={() => onSwitchMode('signin')}>Sign In</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;