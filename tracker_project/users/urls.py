from django.conf.urls import include, url
from django.contrib import admin
import users.views as view

urlpatterns = [
    url(r'^login/$', view.LoginView.as_view(), name =''),   
    url(r'^register/$', view.RegisterView.as_view(), name =''),
]