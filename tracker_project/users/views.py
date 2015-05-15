from django.shortcuts import render, redirect
from django.views.generic.base import View
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
# Create your views here.

class RegisterView(View):

    def post(request):
        username = request.POST.get('username',False)
        email = request.POST.get('email',None)
        password = request.POST.get('password',False)
        if username and password:
            user = User.objects.create_user(username,email,password)
            # redirect(to success page)
        # redirect(to error page)

class LoginView(View):

    def post(request):
        username = request.POST.get('username', False)
        password = request.POST.get('password', False)
        user = authenticate(username=username,password=password)
        if user: 
            if user.is_active:
                login(request, user)
                # redirect(to success page)
            else:
                # disabled user
        else:
            # invalid login

class LogoutView(View):

    def post(request):
        logout(request)
        # redirect(to success page)

# Reset password view 
# Update account view
# Delete account view