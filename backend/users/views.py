from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, ProfileSerializer, ProfileUpdateSerializer, UserSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.generics import RetrieveAPIView, UpdateAPIView
from django.shortcuts import get_object_or_404
from .models import User

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]

class ProfileDetailView(RetrieveAPIView):
    """View for retrieving a user's profile"""
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        if 'username' in self.kwargs:
            return get_object_or_404(User, username=self.kwargs['username'])
        return self.request.user

class CurrentUserProfileView(RetrieveAPIView):
    """View for retrieving the current user's profile"""
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class UpdateProfileView(UpdateAPIView):
    """View for updating the current user's profile"""
    serializer_class = ProfileUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return the full profile after update
        return Response(ProfileSerializer(instance).data)
