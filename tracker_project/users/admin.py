from django import forms
from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from customauth.models import TwitterUser

class UserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput)

    class Meta:
        model = TwitterUser
        fields = ('email', 'password')

    def clean_password2(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match.")
        return password2

        def save(self, commit=True):
            user = super.save(commit=False)
            user.set_password(self.cleand_data["password1"])
            if commit:
                user.save()
            return user

class UserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = TwitterUser
        fields = ('email', 'password', 'token', 'secret', 'is_active', 'is_admin')

    def clean_password(self):
        return self.initial["password"]

# UserAdmin or ModelAdmin
class TwitterUserAdmin(UserAdmin):
    form = UserChangeForm        
    add_form = UserCreationForm
    
    list_display = ('email', 'is_admin')
    list_filter = ('is_admin',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Oauth info', {'fields':('token','secret')}),
        ('Permissions',{'fields': ('is_admin',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email','token','secret','password1','password2')}
        ),
    )
    search_fields = ('email',)
    ordering = ('email',)
    filter_horizontal = ()

admin.site.register(TwitterUser, TwitterUserAdmin)
