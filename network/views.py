import json
import time
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .models import User, Post, Like


def index(request):

    return render(request, "network/index.html", {
        "posts": Post.objects.all().order_by('-created_date')
    })

def posts_view(request):
    posts = Post.objects.all().order_by('-created_date')
    
    # Artificially delay speed of response
    time.sleep(1)

    return JsonResponse([post.serialize() for post in posts], safe=False)

def poster(request, poster_id):
    return HttpResponse(poster_id)

def following(request, poster_id):
    return HttpResponse(poster_id)

# create new post
def new_post(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        content = data.get('content', '')

        new_post = Post(content=content, poster=request.user)
        new_post.save()

        return JsonResponse({'status': 'success', 'message': 'Post created successfully!'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
