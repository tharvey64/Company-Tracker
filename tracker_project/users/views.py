from django.shortcuts import render, redirect
from django.views.generic.base import View
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from twitter.models import Profile
# Create your views here.

class RegisterView(View):
    template = 'users/register_form.html'

    def get(self, request):
        return render(request, self.template)

    def post(self, request):
        username = request.POST.get('registerUsername',False)
        email = request.POST.get('registerEmail',None)
        password = request.POST.get('registerPassword',False)
        if username and password:
            user = User.objects.create_user(username, email, password)
            profile = Profile.objects.create(token=request.session['OAUTH_TOKEN'], secret=request.session['OAUTH_TOKEN_SECRET'], user=user)
        return redirect('/quandl')

class LoginView(View):

    def post(self, request):
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

    def post(self, request):
        logout(request)
        return redirect('pages:success', status='Logged out.')

# Reset password view 
# Update account view
# Delete account view