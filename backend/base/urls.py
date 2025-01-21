from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from.views import CustomTokenObtainPairView,customTokenRefreshView,my_profile,registerView,logout,check_login_status,follow_user,get_user_posts,toggleLike,createPost,get_posts,deletePost,search_user,update_user_details,updatePost
urlpatterns = [
   path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
   path('token/refresh/', customTokenRefreshView.as_view(), name='token_refresh'),
   path('register/', registerView),
   path('logout/', logout ),
   path('status/', check_login_status),
   
   path('my-profile/<str:pk>' ,my_profile),
   path('follow/', follow_user),
   path('toggle-like',toggleLike),
   path('posts/<str:pk>',get_user_posts),
   path('create-post',createPost),
   path('all-posts',get_posts),
   path('delete-post/<int:pk>',deletePost),
   path('update-post/<int:pk>' ,updatePost),
   path('search',search_user),
   path('update-user',update_user_details),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)