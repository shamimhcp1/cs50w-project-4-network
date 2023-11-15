function PostView() {

  const [posts, setPosts] = React.useState([]);
  const loggedInUserId = parseInt(document.getElementById('post-view').getAttribute('data-user-id'));
  
    fetch('/posts')
    .then(response => response.json())
    .then(posts => {
      //console.log(posts);
      setPosts(posts);    

    });

    function posterView(posterId) {
      alert('Poster ID: ' + parseInt(posterId));
    }

    return (
      <div>
          {posts.map(post => (
            // Inside the map function
            
            <div className="row" key={post.id}>
              <div className="col-md mt-2">
                  <div className="card">
                      <div className="card-body">
                        <h5 className="card-title"><a onClick={() => posterView(post.poster_id)} href="#">{ post.poster }</a> 
                          {/* show edit button if logged user equal to poster id */}
                          {loggedInUserId === parseInt(post.poster_id) && (
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
    );

}

ReactDOM.render(<PostView />, document.querySelector("#post-view"));