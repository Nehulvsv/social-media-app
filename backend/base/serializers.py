from rest_framework import serializers
from .models import MyUser,Posts

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = MyUser
        fields = ['username', 'password', 'email', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = MyUser(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])  # Hashes the password
        user.save()
        return user


class ProfileSerializer(serializers.ModelSerializer):
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = MyUser
        fields = ['username', 'bio', 'followers', 'profile_image', 'follower_count', 'following_count' , 'first_name','post_count','last_name'] 

    def get_follower_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()
    
    def get_post_count(self, obj):
        return obj.posts.count()

class PostSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()
    user_image =serializers.SerializerMethodField()
    class Meta:
        model = Posts
        fields = [ 'id','user', 'content', 'created_at', 'likes' , 'username' ,'like_count' ,'formatted_date','user_image']
        # read_only_fields = ['id', 'user', 'created_at', 'likes']
        
    def get_like_count(self,obj):
        return obj.likes.count()
    
    def get_username(self,obj):
        return obj.user.username
    
    def get_user_image(self, obj):
        request = self.context.get('request')  
        if obj.user.profile_image: 
            image_url = obj.user.profile_image.url 
            if request:
                return request.build_absolute_uri(image_url) 
            return image_url
        return None 
        
    def get_formatted_date(self,obj):
        return obj.created_at.strftime("%d %b %y")    
    
    
# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = MyUser
#         fields = ['username', 'bio', 'email' ,'profile_image' ,'first_name','last_name']

from rest_framework import serializers
from .models import MyUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyUser
        fields = ['username', 'first_name', 'last_name', 'email', 'profile_image']

    def update(self, instance, validated_data):
        # Update the username if provided
        new_username = validated_data.get('username')
        if new_username and new_username != instance.username:
            # Check if the new username is unique
            if MyUser.objects.filter(username=new_username).exists():
                raise serializers.ValidationError({"username": "This username is already taken."})
            instance.username = new_username

        # Update other fields
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.profile_image = validated_data.get('profile_image', instance.profile_image)
        instance.save()
        return instance