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
            # redirect('pages:success', status='Registered.')
        # redirect('pages:error', error='Invalid username or password')

class LoginView(View):

    def post(request):
        username = request.POST.get('username', False)
        password = request.POST.get('password', False)
        user = authenticate(username=username,password=password)
        if user: 
            if user.is_active:
                login(request, user)
                return redirect('pages:success', status='Logged In.')
            else:
                return redirect('pages:error', error='Inactive User.')
        return redirect('pages:error', error='Invalid username or password.')

class LogoutView(View):

    def post(request):
        logout(request)
        return redirect('pages:success', status='Logged out.')

# Reset password view 
# Update account view
# Delete account view