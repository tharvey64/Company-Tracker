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
        username = request.session['screen_name']
        email = request.POST.get('registerEmail',None)
        password = request.POST.get('registerPassword',False)
        if username and password:
            user = User.objects.create_user(username, email, password)
            profile = Profile.objects.create(token=request.session['OAUTH_TOKEN'], secret=request.session['OAUTH_TOKEN_SECRET'], user=user)
        return redirect('/quandl')

class LoginView(View):

    def post(self, request):
        email = request.POST.get('loginEmail', False)
        username = User.objects.filter(email=email)
        password = request.POST.get('loginPassword', False)
        user = authenticate(username=username[0],password=password)
        if user:
            if user.is_active:
                user = User.objects.filter(email=request.POST.get('loginEmail'))
                request.session.flush()
                request.session['OAUTH_TOKEN'] = user[0].profile_set.values()[0]['token']
                request.session['OAUTH_TOKEN_SECRET'] = user[0].profile_set.values()[0]['secret']
                request.session['screen_name']= user[0].username
                return redirect('/quandl')
            else:
                return redirect('/quandl')
        return redirect('/quandl')

class LogoutView(View):

    def get(self, request):
        logout(request)
        request.session.flush()
        return redirect('/quandl')

# Reset password view 
# Update account view
# Delete account view