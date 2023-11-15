document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#all-post').addEventListener('click', () => load_view('all posts'));
    document.querySelector('#profile').addEventListener('click', () => load_view('profile'));
    document.querySelector('#following').addEventListener('click', () => load_view('following'));

    // By default, load the all_post
    load_view('all posts');

    // compose new post
    document.querySelector('#new-post-form').onsubmit = function (event) {
      event.preventDefault(); 

      const content = document.querySelector('#new-post-content').value;
      const csrfmiddlewaretoken = document.querySelector('#csrfmiddlewaretoken').value;

      fetch('/new-post', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfmiddlewaretoken
          },
          body: JSON.stringify({
              content: content
          })
      })
      .then(response => response.json())
      .then(result => {
          console.log(result);
          if (result.status === 'success') {
              load_view('all posts');
              document.querySelector('#new-post-content').value = "";
          };
          message_display(result);
      });

      return false;
    };
    // End compose new post

});

function message_display(result) {
    const messageDisplay = document.getElementById('messageDisplay');
    // Check for success or error in the response
    if (result.message) {
      messageDisplay.innerHTML = `<p>${result.message}</p>`;
      messageDisplay.style.color = 'green';
    } if (result.error) {
      messageDisplay.innerHTML = `<p>${result.error}</p>`;
      messageDisplay.style.color = 'red';
    }
};
  
function load_view(load) {
    // Store load in local storage
    localStorage.setItem('load_view', load);

    // show hide post view
    if(localStorage.getItem('load_view') === 'all posts') {
        document.querySelector('#post-view').style.display = 'block';
        document.querySelector('#new-post').style.display = 'block';
    }
    
    // show hide new profile
    if(localStorage.getItem('load_view') === 'profile') {
        document.querySelector('#profile-view').style.display = 'block';
        document.querySelector('#new-post').style.display = 'none';
        document.querySelector('#post-view').style.display = 'none';

        const loggedInUserId = parseInt(document.getElementById('post-view').getAttribute('data-user-id'));

        fetch('/poster/' + loggedInUserId)
        .then(response => response.json())
        .then(poster => {
            console.log(poster); 
        });
    }

    // show hide post view
    if(localStorage.getItem('load_view') === 'following') {
        document.querySelector('#post-view').style.display = 'block';
        document.querySelector('#profile-view').style.display = 'none';
        document.querySelector('#new-post').style.display = 'none';
    }

    document.querySelector('#heading-view').innerHTML = `<h3>${load.charAt(0).toUpperCase() + load.slice(1)}</h3>`;

};