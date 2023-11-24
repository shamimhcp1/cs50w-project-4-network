function App() {

    const [user, setUser] = React.useState({
      id: null,
      username: null,
      is_authenticated: false,
    });
  
    React.useEffect(() => {
      // Fetch user data from the props
      const userId = document.getElementById('user_id').getAttribute('data-id');
      const username = document.getElementById('user_username').getAttribute('data-username');
      const isAuthenticated = document.getElementById('user_is_authenticated').getAttribute('data-isauthenticate') === 'True';
  
      // Update the user state
      setUser({
        id: parseInt(userId),
        username: username,
        is_authenticated: isAuthenticated,
      });
    }, []); // Empty dependency array ensures the effect runs only once after the initial render
    
    // currentView handle states
    const [currentView, setCurrentView] = React.useState('all-posts');
    const handleNavbarItemClick = (view) => {
      setCurrentView(view); // Update currentView
      console.log(view);
      if(view === 'profile') {
        setProfileInfo({
            ...profileInfo,
            username: user.username
        });
      }
    };

    // fetch posts for all-posts section
    const [posts, setPosts] = React.useState([]);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [hasNextPage, setHasNextPage] = React.useState(false);
    const [hasPreviousPage, setHasPreviousPage] = React.useState(false);

    const fetchAllPosts = (currentView, currentPage) => {
      if (currentView === 'all-posts') {
        fetch(`/posts?page=${currentPage}`)
          .then(response => response.json())
          .then(data => {
            setPosts(data.posts);
            setTotalPages(data.total_pages);
            setHasNextPage(data.has_next);
            setHasPreviousPage(data.has_previous);
          })
          .catch(error => {
            console.error('Error fetching posts:', error);
          });
      }
    }
    
    React.useEffect(() => {
      // Fetch data only when the currentView is 'all-posts' and currentPage changes
      fetchAllPosts(currentView, currentPage)
    }, [currentView, currentPage]);
    
    // function to handle pagination clicks
    const handlePaginationClick = (page) => {
      console.log('Pagination click initiated. Page:', page);

      if (page >= 1 && page <= totalPages && page !== currentPage) {
        console.log('Fetching data for page:', page);
        setCurrentPage(page);

      } else {
        console.log('Invalid page or same page clicked. No fetch operation.');
      }
    };
    

    // Handle new post submission
    const handleNewPostSubmit = (event) => {
        event.preventDefault();

        const newPostContent = document.getElementById('new-post-content').value;
        if(newPostContent.length > 0 ) {
            // Send a POST request to create a new post
            fetch('/new-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'), // Include the CSRF token
            },
            body: JSON.stringify({ content: newPostContent }),
            })
            .then(response => response.json())
            .then(result => {
                if (result.status === 'success') {
                    // Fetch updated posts after creating a new post
                    fetch(`/posts?page=${currentPage}`)
                    .then(response => response.json())
                    .then(data => {
                        setPosts(data.posts);
                        setTotalPages(data.total_pages);
                        setHasNextPage(data.has_next);
                        setHasPreviousPage(data.has_previous);
                    })
                    .catch(error => {
                        console.error('Error fetching posts:', error);
                    });
        
                    // Clear the input field
                    document.getElementById('new-post-content').value = '';
        
                    // display a success message
                    document.getElementById('messageDisplay').innerHTML = `<p>${result.message}</p>`;
                    // Hide the message display after 5 seconds
                    setTimeout(() => {
                        document.getElementById('messageDisplay').innerHTML = '';
                    }, 3000);
                } else {
                    // Display an error message if the post creation fails
                    document.getElementById('messageDisplay').innerHTML = `<p>${result.message}</p>`;
                    // Hide the message display after 5 seconds
                    setTimeout(() => {
                        document.getElementById('messageDisplay').innerHTML = '';
                    }, 3000);
                }
            });
        } else {
            // Display an error message if the post creation fails
            document.getElementById('messageDisplay').innerHTML = `<p>Warning! You can't post an empty post!</p>`;
            // Hide the message display after 5 seconds
            setTimeout(() => {
                document.getElementById('messageDisplay').innerHTML = '';
            }, 3000);
        }

        
    };

    // Profile of poster view handle states
    const [profileInfo, setProfileInfo] = React.useState({
      id: '',
      username: '',
      followers: '',
      following: '',
      isFollowing: 'N/A',
    });

    // fetch posts for profile view section
    const [profilePosts, setProfilePosts] = React.useState([]);
    const [profileCurrentPage, setProfileCurrentPage] = React.useState(1);
    const [profileTotalPages, setProfileTotalPages] = React.useState(1);
    const [profileHasNextPage, setProfileHasNextPage] = React.useState(false);
    const [profileHasPreviousPage, setProfileHasPreviousPage] = React.useState(false);

    // Fetch user profile data based on the username
    const fetchUserProfile = (username, page) => {
        fetch(`/profile/${username}?page=${page}`)
        .then((response) => response.json())
        .then((profileData) => {
            console.log(profileData);
            // Update profile pagination information
            setProfileTotalPages(profileData.total_pages);
            setProfileHasNextPage(profileData.has_next);
            setProfileHasPreviousPage(profileData.has_previous);
            // Update profile posts
            setProfilePosts(profileData.posts);
            setProfileInfo({
                id: profileData.poster.id,
                username: profileData.poster.username,
                followers: profileData.poster.followers,
                following: profileData.poster.following,
                isFollowing: profileData.is_following,
            });
        })
        .catch((error) => {  
            console.error('Error fetching user profile:', error);
        });
    };

    // Using React.useEffect for fetching user profile
    React.useEffect(() => {
        if (currentView === 'profile') {
            fetchUserProfile(profileInfo.username, profileCurrentPage);
        }
    }, [currentView, profileInfo.username, profileInfo.isFollowing, profileCurrentPage]);

    // Handle clicks on the profile pagination 
    const handleProfilePaginationClick = (page) => {
        if (page >= 1 && page <= profileTotalPages && page !== profileCurrentPage) {
            console.log('Fetching data for page:', page);
            setProfileCurrentPage(page);
        } else {
          console.log('Invalid page or same page clicked. No fetch operation.');
        }
      };
      

    // Handle clicks on the poster's name in post view
    const handlePosterClick = (posterUsername) => {
        setCurrentView('profile'); // Update currentView
        setProfileInfo({
            ...profileInfo,
            username: posterUsername
        });
    };

    // Posts by following state
    const [followingPosts, setFollowingPosts] = React.useState([]);
    const [followingCurrentPage, setFollowingCurrentPage] = React.useState(1);
    const [followingTotalPages, setFollowingTotalPages] = React.useState(1);
    const [followingHasNextPage, setFollowingHasNextPage] = React.useState(false);
    const [followingHasPreviousPage, setFollowingHasPreviousPage] = React.useState(false);


    const fetchFollowingPosts = (currentView, followingCurrentPage) => {
      if (currentView === 'following') {
        fetch(`/following?page=${followingCurrentPage}`)
          .then(response => response.json())
          .then(followingData => {
            console.log(followingData);
            // Update profile pagination information
            setFollowingTotalPages(followingData.total_pages);
            setFollowingHasNextPage(followingData.has_next);
            setFollowingHasPreviousPage(followingData.has_previous);
            setFollowingPosts(followingData.posts);
          })
          .catch(error => {
            console.error('Error fetching following posts:', error);
          });
      }
    }

    // fetch following posts when the currentView is 'following' and page changes
    React.useEffect(() => {
      fetchFollowingPosts(currentView, followingCurrentPage);
    }, [currentView, followingCurrentPage]);
    
    // Handle clicks on the following pagination 
    const handleFollowingPaginationClick = (page) => {
      if (page >= 1 && page <= followingTotalPages && page !== followingCurrentPage) {
          console.log('Fetching data for page:', page);
          setFollowingCurrentPage(page);
      } else {
        console.log('Invalid page or same page clicked. No fetch operation.');
      }
    };

    // follow user or Unfollow user on clicks
    const handleFollowUnfollow = () => {
      fetch(`/update-following?username=${profileInfo.username}`)
          .then(response => response.json())
          .then(data => {
            console.log(data);
            // Update the following status in profileInfo
            setProfileInfo({
                ...profileInfo,
                isFollowing: data.is_following,
            });
          })
          .catch(error => {
            console.error('Error fetching following updates:', error);
          });
    };

    const [likedPosts, setLikedPosts] = React.useState([]);

    // Fetch liked posts when the component mounts
    React.useEffect(() => {
        if (user.is_authenticated) {
            fetch('/liked-posts') 
                .then(response => response.json())
                .then(data => setLikedPosts(data.liked_posts))
                .catch(error => console.error('Error fetching liked posts:', error));
        }
    }, [user.is_authenticated]);


    const handleLikeButton = (postId) => {
      // Check if the post is liked or not
      if (likedPosts.includes(postId)) {
          // Unlike the post
          fetch(`/unlike/${postId}/`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': getCookie('csrftoken'),
              },
          })
              .then(response => response.json())
              .then(data => {
                  if (data.status === 'success') {
                      // Update likedPosts state
                      setLikedPosts(likedPosts.filter(id => id !== postId));
                      fetchPostsByLikeButton(currentView, profileCurrentPage, profileInfo);
                  }
              })
              .catch(error => console.error('Error unliking post:', error));
      } else {
          // Like the post
          fetch(`/like/${postId}/`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': getCookie('csrftoken'),
              },
          })
              .then(response => response.json())
              .then(data => {
                  if (data.status === 'success') {
                      // Update likedPosts state
                      setLikedPosts([...likedPosts, postId]);
                      fetchPostsByLikeButton(currentView, profileCurrentPage, profileInfo);
                  }
              })
              .catch(error => console.error('Error liking post:', error));
      }
    };

    // Function to fetch posts data after like or unlike
    const fetchPostsByLikeButton = (currentView, profileCurrentPage, profileInfo) => {
      if (currentView === 'all-posts') {
        fetchAllPosts(currentView, currentPage)
      } else if (currentView === 'profile') {
        fetchUserProfile(profileInfo.username, profileCurrentPage);
      } else if (currentView === 'following') {
        fetchFollowingPosts(currentView, followingCurrentPage);
      }
    };

    // state to track the currently edited post
    const [isEditModalVisible, setEditModalVisible ] = React.useState();
    const [editedPost, setEditedPost] = React.useState({
      postId: null,
      content: '',
    });
    
    const handleEditButtonClick = (post) => {
      setEditedPost({
        postId: post.id,
        content: post.content,
      });
      // Open modal for editing
      setEditModalVisible(true);
    };

    const handleEditPostSubmit = () => {
      fetch(`/edit-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ 
          post_id: editedPost.postId,
          content: editedPost.content 
        }),
      })
        .then(response => response.json())
        .then(result => {
          if (result.status === 'success') {
            // Update the UI with the edited post
            if (currentView === 'all-posts') {
                const updatedPosts = posts.map(post =>
                    post.id === editedPost.postId ? { ...post, content: editedPost.content } : post
                );
                setPosts(updatedPosts);
            } else if (currentView === 'profile') {
                const updatedPosts = profilePosts.map(post =>
                    post.id === editedPost.postId ? { ...post, content: editedPost.content } : post
                );
                setProfilePosts(updatedPosts);
            } 
    
            // Close the modal
            setEditModalVisible(false);
            // display a success message
            document.getElementById('messageDisplay').innerHTML = `<p>${result.succes_message}</p>`;
            // Hide the message display after 5 seconds
            setTimeout(() => {
                document.getElementById('messageDisplay').innerHTML = '';
            }, 3000);
          }
        })
        .catch(error => {
          console.error('Error editing post:', error);
        });
    };

    return (
      <div>
          {/* Navbar */}
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <a className="navbar-brand text-primary" href="/">Network</a>
              
          <div>
          <ul className="navbar-nav mr-auto">
            {user.is_authenticated && (
              <li className="nav-item">
                <a className="nav-link" onClick={() => handleNavbarItemClick('profile')} href="#">
                  <strong><i className="fa fa-circle-user"></i> {user.username}</strong>
                </a>
              </li>
            )}
            <li className="nav-item">
              <a className="nav-link" onClick={() => handleNavbarItemClick('all-posts')} href="#">All Posts</a>
            </li>
            {user.is_authenticated && (
              <li className="nav-item">
                <a className="nav-link" onClick={() => handleNavbarItemClick('following')} href="#">Following</a>
              </li>
            )}
            {user.is_authenticated && (
              <li className="nav-item">
                <a className="nav-link" href="logout">Log Out</a>
              </li>
            )}
            {!user.is_authenticated && (
            <li className="nav-item">
                <a className="nav-link" href="login">Log In</a>
            </li>
            )}
            {!user.is_authenticated && (
            <li className="nav-item">
                <a className="nav-link" href="register">Register</a>
            </li>
            )}
          </ul>
          </div>
          </nav>
  
        {/* Main content */}
        <div className="body">
          <div className="container">
            <div id="messageDisplay"></div>
  
            {/* Display different views based on currentView state */}
            {currentView === 'all-posts' && (
            <div>
                {/* New Post */}
                {user.is_authenticated && (
                <div className="row mt-2">
                    <div className="col-md">
                        <div className="card">
                            <h5 className="card-header">New Post</h5>
                            <div className="card-body">
                                <form id="post-form" onSubmit={handleNewPostSubmit}>
                                    <div class="form-group">
                                        <textarea class="form-control" id="new-post-content" name="new-post-content" rows="3"></textarea>
                                    </div>
                                    <input type="submit" id="post-btn" class="btn btn-primary" value="Post"/>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                )}
                {/* End new Post */}
                <div id="heading-view"><h3>All posts</h3></div>
                <div id="post-view">
                    {posts.map(post => (
                        <div className="row" key={post.id}>
                          <div className="col-md mt-2">
                              <div className="card">
                                  <div className="card-body">
                                      <h5 className="card-title"><a href="#" onClick={() => handlePosterClick(post.poster)}>{ post.poster }</a> 
                                      {/* show edit button if logged user equal to poster id */}
                                      {user.id === parseInt(post.poster_id) && (
                                          <a className="float-right btn btn-outline-primary btn-sm" onClick={() => handleEditButtonClick(post)} href="#">Edit</a>
                                      )}
                                      </h5>
                                      <p className="card-text">{ post.content }</p>
                                      <p className="card-subtitle mb-2 text-muted">{ post.created_date }</p>
                                      <a href="#" className="card-link" onClick={() => handleLikeButton(post.id)}>
                                          {likedPosts.includes(post.id) ? (
                                              <i className="fa-solid fa-heart text-danger"></i>
                                          ) : (
                                              <i className="fa-regular fa-heart"></i>
                                          )}
                                      </a> <span className="badge badge-secondary">{ post.likes }</span>
                                  </div>
                              </div>
                          </div>

                        </div> 

                    ))}
                    {/* all-posts view pagination */}
                    <div className="mt-2">
                      <nav aria-label="Page navigation example">
                        <ul className="pagination justify-content-center">
                          <li className={`page-item ${!hasPreviousPage && 'disabled'}`}>
                            <a className="page-link" href="#" onClick={() => handlePaginationClick(currentPage - 1)} tabIndex="-1" aria-disabled={!hasPreviousPage}>Previous</a>
                          </li>
                          {Array.from({ length: totalPages }, (_, index) => (
                            <li key={index} className={`page-item ${currentPage === index + 1 && 'active'}`}>
                              <a className="page-link" href="#" onClick={() => handlePaginationClick(index + 1)}>{index + 1}</a>
                            </li>
                          ))}
                          <li className={`page-item ${!hasNextPage && 'disabled'}`}>
                            <a className="page-link" href="#" onClick={() => handlePaginationClick(currentPage + 1)} aria-disabled={!hasNextPage}>Next</a>
                          </li>
                        </ul>
                      </nav>
                    </div>
                    {/* End pagination */}
                </div>
            </div>
            )}

            {currentView === 'profile' && (
            <div>
                <div id="profile-view">
                    <div className="row mt-2">
                      {/* Display Profile Info */}
                      <div class="col-md-3">
                        <div class="card">
                            <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" class="card-img-top" alt="..."/>
                            <div class="card-body">
                              <h5 class="card-title">{ profileInfo.username }</h5>
                            </div>
                            <ul class="list-group list-group-flush">
                              <li class="list-group-item"><span class="badge badge-primary">{profileInfo.following}</span> followers</li>
                              <li class="list-group-item"><span class="badge badge-primary">{profileInfo.followers}</span> following</li>
                            </ul>
                            {user.is_authenticated && user.username !== profileInfo.username && (
                                <div class="card-body">
                                    {profileInfo.isFollowing ? (
                                        <a href="#" class="card-link text-danger" onClick={() => handleFollowUnfollow()}>Unfollow</a>
                                    ) : (
                                        <a href="#" class="card-link" onClick={() => handleFollowUnfollow()}>Follow</a>
                                    )}
                                </div>
                              )}
                          </div>
                      </div>
                      {/* Display user posts */}
                      <div className="col-md-9">
                        {profilePosts.map(post => (
                        <div className="row" key={post.id}>
                              <div className="card">
                                  <div className="card-body">
                                      <h5 className="card-title"><a href="#" onClick={() => handlePosterClick(post.poster)}>{ post.poster }</a> 
                                      {/* show edit button if logged user equal to poster id */}
                                      {user.id === parseInt(post.poster_id) && (
                                          <a className="float-right btn btn-outline-primary btn-sm" onClick={() => handleEditButtonClick(post)} href="#">Edit</a>
                                      )}
                                      </h5>
                                      <p className="card-text">{ post.content }</p>
                                      <p className="card-subtitle mb-2 text-muted">{ post.created_date }</p>
                                      <a href="#" className="card-link" onClick={() => handleLikeButton(post.id)}>
                                        {likedPosts.includes(post.id) ? (
                                            <i className="fa-solid fa-heart text-danger"></i>
                                        ) : (
                                            <i className="fa-regular fa-heart"></i>
                                        )}
                                      </a> <span className="badge badge-secondary">{ post.likes }</span>
                                  </div>
                              </div>
                          </div>
                        ))}
                        {/* profile view pagination */}
                        <div className="mt-2">
                            <nav aria-label="Page navigation example">
                                <ul className="pagination justify-content-center">
                                <li className={`page-item ${!profileHasPreviousPage && 'disabled'}`}>
                                    <a className="page-link" href="#" onClick={() => handleProfilePaginationClick(profileCurrentPage - 1)} tabIndex="-1" aria-disabled={!profileHasPreviousPage}>Previous</a>
                                </li>
                                {Array.from({ length: profileTotalPages }, (_, index) => (
                                    <li key={index} className={`page-item ${profileCurrentPage === index + 1 && 'active'}`}>
                                    <a className="page-link" href="#" onClick={() => handleProfilePaginationClick(index + 1)}>{index + 1}</a>
                                    </li>
                                ))}
                                <li className={`page-item ${!profileHasNextPage && 'disabled'}`}>
                                    <a className="page-link" href="#" onClick={() => handleProfilePaginationClick(profileCurrentPage + 1)} aria-disabled={!profileHasNextPage}>Next</a>
                                </li>
                                </ul>
                            </nav>
                        </div>
                        {/* End profile view pagination */}
                      </div>
                    </div>
                </div>
            </div>
            )}
  
            {currentView === 'following' && (
              <div>
                <div id="heading-view"><h3>Following</h3></div>
                <div id="following-view">
                  {/* ... Render the list of posts the current user is following ... */}
                  {followingPosts.map(post => (
                      <div className="row" key={post.id}>
                        <div className="col-md mt-2">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title"><a href="#" onClick={() => handlePosterClick(post.poster)}>{ post.poster }</a> </h5>
                                    <p className="card-text">{ post.content }</p>
                                    <p className="card-subtitle mb-2 text-muted">{ post.created_date }</p>
                                    <a href="#" className="card-link" onClick={() => handleLikeButton(post.id)}>
                                        {likedPosts.includes(post.id) ? (
                                            <i className="fa-solid fa-heart text-danger"></i>
                                        ) : (
                                            <i className="fa-regular fa-heart"></i>
                                        )}
                                    </a> <span className="badge badge-secondary">{ post.likes }</span>
                                </div>
                            </div>
                        </div>
                      </div>
                    ))}
                    {/* following view pagination */}
                    <div className="mt-2">
                            <nav aria-label="Page navigation example">
                                <ul className="pagination justify-content-center">
                                <li className={`page-item ${!followingHasPreviousPage && 'disabled'}`}>
                                    <a className="page-link" href="#" onClick={() => handleFollowingPaginationClick(followingCurrentPage - 1)} tabIndex="-1" aria-disabled={!followingHasPreviousPage}>Previous</a>
                                </li>
                                {Array.from({ length: followingTotalPages }, (_, index) => (
                                    <li key={index} className={`page-item ${followingCurrentPage === index + 1 && 'active'}`}>
                                    <a className="page-link" href="#" onClick={() => handleFollowingPaginationClick(index + 1)}>{index + 1}</a>
                                    </li>
                                ))}
                                <li className={`page-item ${!followingHasNextPage && 'disabled'}`}>
                                    <a className="page-link" href="#" onClick={() => handleFollowingPaginationClick(followingCurrentPage + 1)} aria-disabled={!followingHasNextPage}>Next</a>
                                </li>
                                </ul>
                            </nav>
                        </div>
                        {/* End profile view pagination */}
                </div>
              </div>
            )}

            {/* Edit post modal */}
            <div className="modal" tabIndex="-1" role="dialog" style={{ display: isEditModalVisible ? 'block' : 'none' }}>
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Post</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setEditModalVisible(false)}>
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="form-group">
                      <label htmlFor="editedPostContent">Edit Post Content:</label>
                      <textarea className="form-control" id="editedPostContent" value={editedPost.content} onChange={(e) => setEditedPost({ ...editedPost, content: e.target.value })} rows="6"/>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => setEditModalVisible(false)}>Close</button>
                  <button type="button" className="btn btn-primary" onClick={handleEditPostSubmit}>Save changes</button>
                </div>
              </div>
            </div>
          </div>

            {/* ... Here I can add other views ... */}
          </div>
        </div>
      </div>
    );

} // End of App

// Function to get CSRF token from cookies
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
  
ReactDOM.render(<App />, document.querySelector("#root"));