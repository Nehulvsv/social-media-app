from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class MyUser(AbstractUser):
    username = models.CharField(max_length=50, unique=True,primary_key=True)
    bio = models.CharField(max_length=250, blank=True )
    followers = models.ManyToManyField('self' , symmetrical=False , related_name='following',blank=True)
    profile_image = models.ImageField(upload_to = 'profile_image' , blank=True, null=True )
    
    
    def __str__(self):
        return self.username
    
    
class Posts(models.Model):
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField(max_length=450)
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(MyUser ,related_name='post_likes' , null=True)
    def __str__(self):
        return f"{self.user} - {self.content[:50]}..."