function App() {

    let counter = 0
    
    fetch('/')
    .then(response => response.json())
    .then(posts => {
      // Print emails
      console.log(posts);
      
      posts.forEach(function (post) {
        counter++
      });

    });


    return (
        <div>
            {counter}
        </div>
    );
}

ReactDOM.render(<App />, document.querySelector("#post-view"));