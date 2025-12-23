from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'full_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', '')
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'full_name')
        read_only_fields = ('id',)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 
            'username', 
            'email', 
            'full_name', 
            'bio', 
            'profile_picture', 
            'date_of_birth', 
            'phone_number', 
            'website', 
            'location'
        )
        read_only_fields = ('id', 'username', 'email')


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'full_name', 
            'bio', 
            'profile_picture', 
            'date_of_birth', 
            'phone_number', 
            'website', 
            'location'
        )

    def validate_date_of_birth(self, value):
        """
        Check that the date of birth is not in the future.
        """
        import datetime
        if value and value > datetime.date.today():
            raise serializers.ValidationError("Date of birth cannot be in the future")
        return value
