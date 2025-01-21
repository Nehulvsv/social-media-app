from django.contrib import admin
from .models import MyUser,Posts

# Register your models here.
admin.site.register(MyUser)
admin.site.register(Posts)