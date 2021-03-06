from django.shortcuts import render, redirect
from django.views.generic.base import View
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from sentiment.models import Profile
# Create your views here.

class RegisterView(View):
    template = 'users/register_form.html'

    def get(self, request):
        return render(request, self.template)

    def post(self, request):
        if len(request.session.keys()) is 0:
            return redirect('/')
        token = request.session['OAUTH_TOKEN']
        secret = request.session['OAUTH_TOKEN_SECRET']
        username = request.session['screen_name']
        email = request.POST.get('registerEmail',None)
        password = request.POST.get('registerPassword',False)
        if username and password and token and secret and email:
            user = User.objects.create_user(username, email, password)
            profile = Profile.objects.create(
                token=token,
                secret=secret, 
                user=user
            )
            # add session expire
            request.session.flush()
            return redirect('/')
        else:
            return redirect('/users/register/')

class LoginView(View):

    def post(self, request):
        email = request.POST.get('loginEmail', False)
        user = User.objects.filter(email=email)
        if len(user) is 0:
            return redirect('/')
        password = request.POST.get('loginPassword', False)
        user = authenticate(username=user[0].username, password=password)
        if user:
            if user.is_active:
                login(request, user)
                return redirect('/')
            else:
                return redirect('/')
        return redirect('/')

class LogoutView(View):

    def get(self, request):
        logout(request)
        request.session.flush()
        return redirect('/')

# Reset password view 
# Update account view
# Delete account view