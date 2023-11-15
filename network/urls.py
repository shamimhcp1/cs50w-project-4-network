
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # network url
    path("new-post", views.new_post, name="new_post"),
    path("posts", views.posts_view, name="posts_view"),
    path("poster/<int:poster_id>", views.poster, name="poster"),
    path("following/<int:poster_id>", views.following, name="following"),
]
