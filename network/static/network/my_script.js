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
    };

    // fetch posts for all-posts section
    const [posts, setPosts] = React.useState([]);
    if(currentView === 'all-posts') {
        fetch('/posts')
        .then(response => response.json())
        .then(posts => {
            //console.log(posts);
            setPosts(posts); // Update the posts
        });
    }

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
      username: '',
      posts: [],
      loading: false,
    });

    // Fetch user profile data based on the username
    const fetchUserProfile = (username) => {
      setProfileInfo({ ...profileInfo, loading: true }); // Set loading to true before fetching
      fetch(`/profile/${username}`)
        .then((response) => response.json())
        .then((profileData) => {
          console.log(profileData);
          setProfileInfo({
            username: profileData.poster.username,
            posts: profileData.poster.posts,
            loading: false, // Set loading to false after fetching
          });
          setCurrentView('profile');
        })
        .catch((error) => {
          console.error('Error fetching user profile:', error);
          setProfileInfo({ ...profileInfo, loading: false }); // Set loading to false in case of an error
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
                </div>
            </div>
            )}

            {currentView === 'profile' && (
            <div>
                <div id="heading-view"><h3>Profile</h3></div>
                <div id="profile-view">
                    {profileInfo.loading ? (
                      <p>Loading profile...</p>
                    ) : (
                      <React.Fragment>
                      {/* Display user profile information and posts */}
                        <p>Username: {profileInfo.username}</p>
                        {/* Display user posts */}
                        {profileInfo.posts.map((post, index) => (
                          <p key={index} className="card-text">{post.content}</p>
                        ))}
                      </React.Fragment>
                    )}
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