import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { withProtection } from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import styles from '../styles/Profile.module.css';

function Profile() {
  const { user, updateUser } = useContext(UserContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    avatar: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize form data with user data when available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      // In a real app, you would call an API to update the user profile
      // For now, we'll just simulate a delay and update the context
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user in context
      updateUser({
        ...user,
        ...formData
      });
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        avatar: user.avatar || ''
      });
    }
    setIsEditing(false);
    setError(null);
  };

  return (
    <Layout title="Your Profile" description="View and edit your profile information">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Your Profile</h1>
          {!isEditing && (
            <button 
              className={styles.editButton}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.profileContent}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              {formData.avatar ? (
                <img 
                  src={formData.avatar} 
                  alt={`${formData.name}'s avatar`} 
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            {isEditing && (
              <div className={styles.avatarInput}>
                <label htmlFor="avatar">Avatar URL:</label>
                <input
                  type="text"
                  id="avatar"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            )}
          </div>

          <div className={styles.profileDetails}>
            {isEditing ? (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="website">Website</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.profileInfo}>
                <div className={styles.infoItem}>
                  <h3>Name</h3>
                  <p>{formData.name || 'Not provided'}</p>
                </div>

                <div className={styles.infoItem}>
                  <h3>Email</h3>
                  <p>{formData.email || 'Not provided'}</p>
                </div>

                {formData.bio && (
                  <div className={styles.infoItem}>
                    <h3>Bio</h3>
                    <p>{formData.bio}</p>
                  </div>
                )}

                <div className={styles.infoRow}>
                  {formData.location && (
                    <div className={styles.infoItem}>
                      <h3>Location</h3>
                      <p>{formData.location}</p>
                    </div>
                  )}

                  {formData.website && (
                    <div className={styles.infoItem}>
                      <h3>Website</h3>
                      <p>
                        <a 
                          href={formData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {formData.website}
                        </a>
                      </p>
                    </div>
                  )}
                </div>

                <div className={styles.infoItem}>
                  <h3>Member Since</h3>
                  <p>
                    {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Not available'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.dangerZone}>
          <h2>Danger Zone</h2>
          <div className={styles.dangerActions}>
            <div>
              <h3>Change Password</h3>
              <p>Update your password to maintain account security</p>
              <button className={styles.warningButton}>Change Password</button>
            </div>
            <div>
              <h3>Delete Account</h3>
              <p>Permanently delete your account and all associated data</p>
              <button className={styles.dangerButton}>Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withProtection(Profile);