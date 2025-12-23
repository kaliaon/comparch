from django.urls import path
from .views import (
    RegisterView, LoginView, 
    ProfileDetailView, CurrentUserProfileView, UpdateProfileView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile endpoints
    path('profile/', CurrentUserProfileView.as_view(), name='current-user-profile'),
    path('profile/update/', UpdateProfileView.as_view(), name='update-profile'),
    path('profile/<str:username>/', ProfileDetailView.as_view(), name='user-profile'),
]