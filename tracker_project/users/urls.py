from django.conf.urls import url
from django.contrib import admin
import users.views as view

urlpatterns = [
    url(r'^register/$', view.RegisterView.as_view(), name ='register'),
    url(r'^login/$', view.LoginView.as_view(), name='login'),
    url(r'^logout/$', view.LogoutView.as_view(), name ='logout')    
]