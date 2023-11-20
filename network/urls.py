
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
    path("profile/<str:username>", views.poster, name="poster"),
    path("following", views.following_view, name="following_view"),
    path("update-following", views.update_following, name="update_following"),

]
