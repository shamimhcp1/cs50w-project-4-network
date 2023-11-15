from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    followers = models.ManyToManyField('self', symmetrical=False, related_name='following', blank=True)

class Like(models.Model):
    post = models.ForeignKey('Post', on_delete=models.CASCADE, related_name="post_likes")
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username}, Like on {self.post.content} by {self.post.poster}"

class Post(models.Model):
    content = models.TextField()
    created_date = models.DateTimeField(default=timezone.now)
    poster = models.ForeignKey(User, on_delete=models.CASCADE)
    likes = models.ManyToManyField(User, through=Like, related_name='liked_posts', blank=True)

    def __str__(self):
        return f"{self.content}, {self.poster.username}"
    
    def serialize(self):
        return {
            "id": self.id,
            "poster" : self.poster.username,
            "poster_id" : self.poster.id,
            "content": self.content,
            "created_date": self.created_date.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes.count(),
        }
