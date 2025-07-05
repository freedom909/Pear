import { useState, useContext, useEffect, ChangeEvent, FormEvent } from 'react';
import { UserContext } from '../contexts/UserContext';
import { withProtection } from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import styles from '../styles/Profile.module.css';
import Image from 'next/image';

interface User {
  name?: string;
  email?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  createdAt?: string;
  [key: string]: any; // For any additional user properties
}

interface FormData {
  name: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
}

interface UserContextType {
  user: User | null;
  updateUser: (user: User) => void;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useContext(
    UserContext
  ) as unknown as UserContextType;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    avatar: '',
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Initialize form data with user data when available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      // In a real app, you would call an API to update the user profile
      // For now, we'll just simulate a delay and update the context
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (user) {
        // Update user in context
        updateUser({
          ...user,
          ...formData,
        });
      }

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

  const handleCancel = (): void => {
    // Reset form data to current user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        avatar: user.avatar || '',
      });
    }
    setIsEditing(false);
    setError(null);
  };

  return (
    <Layout
      title="Your Profile"
      description="View and edit your profile information"
    >
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
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.profileContent}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              {formData.avatar ? (
                <Image
                  src={formData.avatar}
                  alt={`${formData.name}'s avatar`}
                  width={100}
                  height={100}
                  className={styles.avatar}
                  priority
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
                    rows={4}
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
                  <div className={styles.emailContainer}>
                    <span className={styles.maskedEmail}>
                      {formData.email
                        ? formData.email.replace(
                            /(\w{1})[\w.-]+@([\w.]+\w)/,
                            '$1***@$2'
                          )
                        : 'Not provided'}
                    </span>
                    {formData.email && (
                      <button
                        className={styles.copyButton}
                        onClick={async () => {
                          if (typeof window !== 'undefined' && navigator.clipboard) {
                            try {
                              await navigator.clipboard.writeText(formData.email);
                              setSuccessMessage('Email copied to clipboard!');
                              setTimeout(() => setSuccessMessage(''), 3000);
                            } catch (err) {
                              setError('Failed to copy email');
                              setTimeout(() => setError(null), 3000);
                            }
                          }
                        }}
                        title="Copy email"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    )}
                  </div>
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
                          day: 'numeric',
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
};

export default withProtection(Profile);