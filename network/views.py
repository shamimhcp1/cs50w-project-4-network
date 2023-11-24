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
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt


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
        profileUser = User.objects.get(username=username)
        posts = Post.objects.filter(poster=profileUser).order_by('-created_date')
        page_number = int(request.GET.get('page'))
        paginator = Paginator(posts, 10)
        
        is_following = 'N/A'

        # Check if the request has a user (logged-in or logged-out)
        if request.user.is_authenticated:
            user = User.objects.get(pk=request.user.id)
            if profileUser != user:
                if profileUser in user.followers.all():
                    is_following = True
                else:
                    is_following = False
           
        try:
            current_page = paginator.page(page_number)
        except EmptyPage:
            return JsonResponse({"status": "error", "message": "Invalid page number"})

        # time.sleep(1)

        return JsonResponse({
            "status": "success",
            "poster": profileUser.serialize(),
            "posts": [post.serialize() for post in current_page],
            "has_next": current_page.has_next(),
            "has_previous": current_page.has_previous(),
            "total_pages": paginator.num_pages,
            "current_page": current_page.number,
            "is_following": is_following,
        })
    except profileUser.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User not found"})

@login_required(login_url='login')
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
def liked_posts(request):
    user = request.user
    liked_post_ids = Like.objects.filter(user=user).values_list('post_id', flat=True)
    return JsonResponse({'liked_posts': list(liked_post_ids)})


@login_required(login_url='login')
def update_following(request):
    username_to_follow = request.GET.get('username')
    user_to_follow = get_object_or_404(User, username=username_to_follow)
    user = request.user

    if user_to_follow == user:
        return JsonResponse({'error': 'Cannot follow/unfollow yourself'})

    if user_to_follow in user.followers.all():
        user.followers.remove(user_to_follow)
        is_following = False
    else:
        user.followers.add(user_to_follow)
        is_following = True

    return JsonResponse({'status': 'success', 'is_following': is_following})

@login_required(login_url='login')
def like_post(request, post_id):
    if request.method == 'POST':
        post = Post.objects.get(pk=post_id)
        user = request.user

        # Check if the user has already liked the post
        if Like.objects.filter(post=post, user=user).exists():
            return JsonResponse({'status': 'error', 'message': 'Post already liked'})

        # Create a new Like object
        like = Like(post=post, user=user)
        like.save()

        return JsonResponse({'status': 'success', 'message': 'Post liked'})

@login_required(login_url='login')
def unlike_post(request, post_id):
    if request.method == 'POST':
        post = Post.objects.get(pk=post_id)
        user = request.user

        # Check if the user has liked the post
        like = Like.objects.filter(post=post, user=user).first()
        if not like:
            return JsonResponse({'status': 'error', 'message': 'Post not liked'})

        # Delete the Like object
        like.delete()

        return JsonResponse({'status': 'success', 'message': 'Post unliked'})

# create new post
@login_required(login_url='login')
def new_post(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        content = data.get('content', '')

        new_post = Post(content=content, poster=request.user)
        new_post.save()

        return JsonResponse({'status': 'success', 'message': 'Post created successfully!'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'})
    
# Edit post
@login_required(login_url='login')
def edit_post(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            post_id = data.get('post_id', '')
            new_content = data.get('content', '')
            post = get_object_or_404(Post, id=post_id, poster=request.user)
            post.content = new_content
            post.save()

            return JsonResponse({'status': 'success', 'succes_message': 'Post Edited successfully!'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
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
