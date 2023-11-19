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
        fetchUserProfile(user.username);
      }
    };

    // fetch posts for all-posts section
    const [posts, setPosts] = React.useState([]);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    
    if(currentView === 'all-posts') {
        fetch(`/posts?page=${currentPage}`)
        .then(response => response.json())
        .then(data => {
            //console.log(posts);
            setPosts(data.posts); // Update the posts
            setCurrentPage(data.current_page); // Update pagination state
            setTotalPages(data.total_pages); // Update pagination totalPages
        });
    }
    // Add a function to handle pagination clicks
    const handlePaginationClick = (page) => {
        setCurrentPage(page);
    };

    // Handle new post submission
    const handleNewPostSubmit = (event) => {
        event.preventDefault();

        const newPostContent = document.getElementById('new-post-content').value;

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
            fetch('/posts')
                .then(response => response.json())
                .then(posts => {
                setPosts(posts); // Update the posts
                });

            // Clear the input field
            document.getElementById('new-post-content').value = '';

            // Optionally display a success message
            document.getElementById('messageDisplay').innerHTML = `<p>${result.message}</p>`;
            } else {
            // Display an error message if the post creation fails
            document.getElementById('messageDisplay').innerHTML = `<p>${result.message}</p>`;
            }
        });
    };

    // Profile of poster view handle states
    const [profileInfo, setProfileInfo] = React.useState({
      id: '',
      username: '',
      followers: '',
      following: '',
      posts: [],
    });

    // Fetch user profile data based on the username
    const fetchUserProfile = (username) => {
      fetch(`/profile/${username}`)
        .then((response) => response.json())
        .then((profileData) => {
          console.log(profileData);
          setProfileInfo({
            id: profileData.poster.id,
            username: profileData.poster.username,
            followers: profileData.poster.followers,
            following: profileData.poster.following,
            posts: profileData.poster.posts,
          });
          setCurrentView('profile');
        })
        .catch((error) => {
          console.error('Error fetching user profile:', error);
        });
    };

    // Handle clicks on the poster's name in post view
    const handlePosterClick = (posterUsername) => {
      fetchUserProfile(posterUsername);
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
                                    <input type="submit" class="btn btn-primary" value="Post"/>
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
                                        <a className="float-right btn btn-outline-primary btn-sm" href="#">Edit</a>
                                    )}
                                    </h5>
                                    <p className="card-text">{ post.content }</p>
                                    <p className="card-subtitle mb-2 text-muted">{ post.created_date }</p>
                                    <a href="#" className="card-link"><i className="fa-solid fa-heart text-danger"></i></a> <span className="badge badge-primary">{ post.likes }</span>
                                </div>
                            </div>
                        </div>
                        </div>
                    ))}
                    
                    <nav aria-label="Page navigation example">
                        <ul className="pagination">
                            <li className="page-item"><a className="page-link" href="#">Previous</a></li>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <li className="page-item"><a key={i} className="page-link" href="#" onClick={() => handlePaginationClick(i + 1)}>{i + 1}</a></li>
                            ))}
                            
                            <li className="page-item"><a className="page-link" href="#">Next</a></li>
                        </ul>
                    </nav>
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
                              <li class="list-group-item"><span class="badge badge-primary">{profileInfo.followers}</span> followers</li>
                              <li class="list-group-item"><span class="badge badge-primary">{profileInfo.following}</span> following</li>
                            </ul>
                            {user.is_authenticated && user.username !== profileInfo.username && (
                                <div class="card-body">
                                  <a href="#" class="card-link">Follow</a>
                                  <a href="#" class="card-link text-danger">Unfollow</a>
                                </div>
                              )}
                          </div>
                      </div>
                      {/* Display user posts */}
                      <div className="col-md-9">
                        {profileInfo.posts.map(post => (
                        <div className="row" key={post.id}>
                              <div className="card">
                                  <div className="card-body">
                                      <h5 className="card-title"><a href="#" onClick={() => handlePosterClick(post.poster)}>{ post.poster }</a> 
                                      {/* show edit button if logged user equal to poster id */}
                                      {user.id === parseInt(post.poster_id) && (
                                          <a className="float-right btn btn-outline-primary btn-sm" href="#">Edit</a>
                                      )}
                                      </h5>
                                      <p className="card-text">{ post.content }</p>
                                      <p className="card-subtitle mb-2 text-muted">{ post.created_date }</p>
                                      <a href="#" className="card-link"><i className="fa-solid fa-heart text-danger"></i></a> <span className="badge badge-primary">{ post.likes }</span>
                                  </div>
                              </div>
                          </div>
                        ))}
                      </div>
                    </div>
                </div>
            </div>
            )}
  
            {currentView === 'following' && (
              <div>
                <div id="heading-view"><h3>Following</h3></div>
                <div id="following-view">
                  {/* ... Render the list of users the current user is following ... */}
                </div>
              </div>
            )}
  
            {/* ... Other views ... */}
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