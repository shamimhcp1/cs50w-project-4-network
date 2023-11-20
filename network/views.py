import json
import time
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .models import User, Post, Like
from django.core.paginator import Paginator, EmptyPage
from django.contrib.auth.decorators import login_required


def index(request):

    return render(request, "network/index.html", {
        "posts": Post.objects.all().order_by('-created_date')
    })


def posts_view(request):
    page_number = int(request.GET.get('page'))
    posts = Post.objects.all().order_by('-created_date')
    paginator = Paginator(posts, 10)  # 10 posts per page

    try:
        current_page = paginator.page(page_number)
    except EmptyPage:
        return JsonResponse({"status": "error", "message": "Invalid page number"})

    # time.sleep(1)

    return JsonResponse({
        "status": "success",
        "posts": [post.serialize() for post in current_page],
        "has_next": current_page.has_next(),
        "has_previous": current_page.has_previous(),
        "total_pages": paginator.num_pages,
        "current_page": current_page.number
    })


def poster(request, username):
    try:
        poster = User.objects.get(username=username)
        posts = Post.objects.filter(poster=poster).order_by('-created_date')
        page_number = int(request.GET.get('page'))
        paginator = Paginator(posts, 10)

        try:
            current_page = paginator.page(page_number)
        except EmptyPage:
            return JsonResponse({"status": "error", "message": "Invalid page number"})

        # time.sleep(1)

        return JsonResponse({
            "status": "success",
            "poster": poster.serialize(),
            "posts": [post.serialize() for post in current_page],
            "has_next": current_page.has_next(),
            "has_previous": current_page.has_previous(),
            "total_pages": paginator.num_pages,
            "current_page": current_page.number
        })
    except User.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User not found"})

@login_required
def following_view(request):

    user = request.user
    followers_posts = Post.objects.filter(poster__in=user.followers.all()).order_by('-created_date')
    page_number = int(request.GET.get('page'))
    paginator = Paginator(followers_posts, 10)

    try:
        current_page = paginator.page(page_number)
    except EmptyPage:
        return JsonResponse({"status": "error", "message": "Invalid page number"})

    return JsonResponse({
        "status": "success",
        "posts": [post.serialize() for post in current_page],
        "has_next": current_page.has_next(),
        "has_previous": current_page.has_previous(),
        "total_pages": paginator.num_pages,
        "current_page": current_page.number
    })

@login_required
def update_following(request):
    user = request.user
    getUsername = request.GET.get('user')
    followingUsername = User.objects.get(username=getUsername)
    return JsonResponse({
        "status": "success",
        "followingUsername" : followingUsername,
    })


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
