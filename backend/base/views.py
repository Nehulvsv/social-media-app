from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import MyUser,Posts
from .serializers import ProfileSerializer,RegisterSerializer,PostSerializer,UserSerializer

import traceback
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.pagination import PageNumberPagination

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    
    try:
        res = Response()
        res.data = {"success":True}
        res.delete_cookie('access_token', path='/', samesite='None')
        res.delete_cookie('refresh_token', path='/', samesite='None')
        return res

    except:
        return Response({"success":False})

@api_view(['GET'])
def check_login_status(request):
    if request.user.is_authenticated:
        return Response({"isLoggedIn": True})
    return Response({"isLoggedIn": False})

@api_view(['POST'])
def registerView(request):
    try:
        # Safely access 'data' key
        data = request.data.get('data')
        if not data:
            return Response({'success': False, 'error': 'Missing "data" key in the request body.'}, status=status.HTTP_400_BAD_REQUEST)

        # Pass data to serializer
        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_201_CREATED)
        else:
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        # Catch and return specific error details
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        
        try:
            response = super().post(request, *args, **kwargs)
            tokens = response.data

            access_token = tokens['access']
            refresh_token = tokens['refresh']
            username = request.data['username']

            try:
                user = MyUser.objects.get(username=username)
            except MyUser.DoesNotExist:
                return Response({'error':'user does not exist'})

            res = Response()

            res.data = {"success":True,
                        "user": {
                            "username":user.username,
                            "bio":user.bio,
                            "email":user.email,
                            "first_name": user.first_name,
                            "last_name":user.last_name
                            }
                        }

            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            res.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            return res
        
        except:
            return Response({'success':False})


class customTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response({'success': False, 'error': 'Refresh token is missing'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            request.data['refresh'] = refresh_token
            
            # Call the parent TokenRefreshView to handle the token refresh
            response = super().post(request, *args, **kwargs)
            # print(f"Token refresh response: {response.status_code}, {response.data}")
            
            # Check if the token refresh was successful
            if response.status_code != status.HTTP_200_OK:
                return Response({'success': False, 'error': 'Invalid refresh token'}, status=response.status_code)
            
            # Extract the new access token
            tokens = response.data
            access_token = tokens.get('access')
            if not access_token:
                return Response({'success': False, 'error': 'Access token not found'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            # Construct the final response
            res = Response({'success': True}, status=status.HTTP_200_OK)
            
            # Set the new access token in the cookies
            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )
            
            return res
        
        except Exception as e:
            print(f"An error occurred during token refresh: {e}")
            return Response({'success': False, 'error': 'An error occurred during token refresh'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class customTokenRefreshView(TokenRefreshView):
    # def post(self,request,*args,**kwargs):      
    #     try :
    #         refresh_token = request.COOKIES.get('refresh_token')
    #         print(f" from request token :  {refresh_token}")
    #         request.data['refresh'] = refresh_token
            
    #         response = super().post(request,*args,**kwargs)
    #         print(response)
            
    #         tokens =  response.data
    #         print(f"new tokens : {tokens}")
            
    #         access_token = tokens['access']
    #         print(access_token)
            
    #         res = Response()
            
    #         res.data = {'success' : True}
            
    #         res.set_cookie(
    #                 key = 'access_token',
    #                 value = access_token,
    #                 httponly=True,
    #                 secure=True,
    #                 samesite='None',
    #                 path='/'
    #         )
            
    #         return res
        
    #     except:
    #         return Response({'success' : False})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_profile(request, pk):
    """
    Fetches the profile of a user based on the username (pk).
    Returns profile details if found; otherwise, returns appropriate error messages.
    """
    try:

        try:
            profile = MyUser.objects.get(username=pk)
        except MyUser.DoesNotExist:
            return Response(
                status=404,
                data={
                    'error': 'Profile not found',
                    'success': 'false',
                }
            )

        # Serialize the profile data and return it in the response
        serializer = ProfileSerializer(profile, many=False)
        
        following = False
        
        if request.user in profile.followers.all():
            following = True
            
        return Response(
            data={
                'message': 'Profile data fetched successfully',
                'success': 'true',
                'data': {**serializer.data ,'is_our_profile' : request.user.username == profile.username , 'following' : following},    
            }
        )
    except Exception as e:
        # Log the exception details
        traceback.print_exc()

        return Response(
            status=500,
            data={
                'error': 'Internal Server Error',
                'success': 'false',
            }
        )

@api_view(['post'])
@permission_classes([IsAuthenticated])
def follow_user(request):
    """
    Follows or unfollows a user by adding/removing the current user from the followers list.
    Returns a success message if the operation is successful; otherwise, returns appropriate error messages.
    """
    try:
        # Retrieve the current user's profile and the target profile to follow
        try:
            my_profile = MyUser.objects.get(username=request.user.username)
            follow_to_profile = MyUser.objects.get(username=request.data['username'])
        except MyUser.DoesNotExist:
            return Response(
                status=404,
                data={
                    'error': 'Profile not found',
                    'success': 'false',
                }
            )
        
        # Check if the current user is already following the target user
        if follow_to_profile.followers.filter(username=my_profile.username).exists():
            # Unfollow if already following
            follow_to_profile.followers.remove(my_profile)
            return Response(
                data={
                    'message': 'You have unfollowed this user successfully.',
                    'success': False,
                }
            )
        else:
            # Follow the user if not already following
            follow_to_profile.followers.add(my_profile)
            return Response(
                data={
                    'message': 'User followed successfully.',
                    'success': True,
                }
            )
    except Exception as e:
        # Log the exception details
        traceback.print_exc()
        return Response(
            status=500,
            data={
                'error': 'Internal Server Error. Failed to follow/unfollow.',
                'success': 'false',
                'details': str(e),
            }
        )
        
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_posts(request, pk):
    try:
        try:
            user = MyUser.objects.get(username=pk)
            my_user = MyUser.objects.get(username=request.user.username)
        except MyUser.DoesNotExist:
            return Response(
                status=404,
                data={
                    'error': 'Profile not found',
                    'success': 'false',
                }
            )
        
        posts = user.posts.all().order_by('-created_at')
        
        serializer = PostSerializer(posts, many=True)
        
        data = []
        for post in serializer.data:
            new_post = {
                **post,
                'like_by_me': my_user.username in post["likes"]
            }
            data.append(new_post)
        
        return Response(
            data={
                'posts': data,
                'success': 'true',
            },
            status=status.HTTP_200_OK
        )
    except Exception as e:
        traceback.print_exc()
        return Response(
            status=500,
            data={
                'error': 'Internal Server Error',
                'success': 'false',
            }
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createPost(request):
    try: 
        data = request.data

        try:
            my_user = MyUser.objects.get(username=request.user.username)
            # print(my_user)
        except MyUser.DoesNotExist:
            return Response(
                status=404,
                data={
                    'error': 'Profile not found',
                    'success': 'false',
                }
            )

        post =  Posts.objects.create(
            user = my_user,
            content = data['content']
                )       
        serializer = PostSerializer(post , many = False)

        return Response(
            data={
                'post': serializer.data,
                'success': 'true',
                'message': 'Post created successfully',
            }
        )

    except:
        traceback.print_exc()
        return Response(
            status=500,
            data={
                'error': 'Internal Server Error',
                'success': 'false',
            }
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deletePost(request, pk):
    try:
        post = Posts.objects.get(id=pk)
        if post.user == MyUser.objects.get(username=request.user.username):
            post.delete()
            return Response(
                data={
                    'message': 'Post deleted successfully',
                    'success': 'true',
                }
            )
        else:
            return Response(
                data={
                    'error': 'You are not authorized to delete this post',
                    'success': 'false',
                }
            )
    except Posts.DoesNotExist:
        return Response(
            data={
                'error': 'Post not found',
                'success': 'false',
            }
        )
    except Exception as e:
        traceback.print_exc()
        return Response(
            status=500,
            data={
                'error': 'Internal Server Error',
                'success': 'false',
            }
        )

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def updatePost(request, pk):
    try:
        post = Posts.objects.get(id=pk)
    except Posts.DoesNotExist:
        return Response(
            data={
                'error': 'Post not found',
                'success': 'false',
            },
            status=404
        )

    if post.user != request.user:
        return Response(
            data={
                'error': 'You are not authorized to update this post',
                'success': 'false',
            },
            status=403
        )

    content = request.data.get('content', None)
    if content is None:
        return Response(
            data={
                'error': 'Content is required',
                'success': 'false',
            },
            status=400
        )

    serializer = PostSerializer(post, data={'content': content}, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(
            data={
                'post': serializer.data,
                'success': 'true',
                'message': 'Post updated successfully',
            }
        )
    else:
        return Response(
            data={
                'error': serializer.errors,
                'success': 'false',
            },
            status=400
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_posts(request):
    try:
        
        
        try:
            my_user = MyUser.objects.get(username=request.user.username)
        except MyUser.DoesNotExist:
            return Response(
                status=404,
                data={
                    'error': 'Profile not found',
                    'success': 'false',
                }
            )

        post = Posts.objects.all().order_by('-created_at')
        
        paginator = PageNumberPagination()
        paginator.page_size = 6
        paginated_posts = paginator.paginate_queryset(post, request)
        
        serializer = PostSerializer(paginated_posts, many=True)
        
        
        data = []
        for post in serializer.data:
            new_post = {
                **post,
                'like_by_me': my_user.username in post["likes"]
            }
            data.append(new_post)
            
        return paginator.get_paginated_response(data)

    except Exception as e:
        traceback.print_exc()
        return Response(
            status=500,
            data={
                'error': 'Internal Server Error',
                'success': 'false',
            }
        )


        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggleLike(request):
        try:
            try:
                user = MyUser.objects.get(username=request.user.username)
            
            except MyUser.DoesNotExist:
                return Response(
                    status=404,
                    data={
                        'error': 'Profile not found',
                        'success': 'false',
                    }
                )   
            try:
                post = Posts.objects.get(id=request.data['id'])
            except:
                return Response(
                    status=404,
                    data={
                        'error': 'Post not found',
                        'success': 'false',
                    }
                )
                
            if post.likes.filter(username = user.username).exists():
                    post.likes.remove(user.username)
                    return Response(
                        data={
                            'message': 'You have unliked this post successfully.',
                            'success': False,
                        })
            else:
                post.likes.add(user.username)
                return Response(
                    data={
                        'message': 'Post liked successfully.',
                        'success': True,
                    })
        except:
            traceback.print_exc()
            return Response(
                status=500,
                data={
                    'error': 'Internal Server Error. Failed to like/unlike.',
                    'success': 'false',
                }
            )
            

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_user(request):
    try:
        query = request.GET.get('query' , '')
        users = MyUser.objects.filter(username__icontains=query)
        serializer = UserSerializer(users, many=True)
        return Response({
            'data' : serializer.data,
            'success' :True
            })
    except Exception as e:
        traceback.print_exc()
        return Response(
            status=500,
            data={
                'error': 'Internal Server Error',
                'success': 'false',
            }
        )


@api_view(['PATCH'])  # Use uppercase 'PATCH'
@permission_classes([IsAuthenticated])
def update_user_details(request):
    try:
        data = request.data

        try:
            user = MyUser.objects.get(username=request.user.username)
        except MyUser.DoesNotExist:
            return Response(
                {
                    'error': 'Profile not found',
                    'success': 'false',
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Pass the user instance and request data to the serializer
        serializer = UserSerializer(user, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()  # Save the updated data
            return Response(
                {
                    'user': serializer.data,
                    'success': 'true',
                    'message': 'Profile updated successfully',
                },
                status=status.HTTP_200_OK
            )
        else:
            # Return validation errors if the data is invalid
            return Response(
                {
                    'error': serializer.errors,
                    'success': 'false',
                },
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        # Log the error for debugging
        traceback.print_exc()
        return Response(
            {
                'error': 'Internal Server Error',
                'success': 'false',
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )