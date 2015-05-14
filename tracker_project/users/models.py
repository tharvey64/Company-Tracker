from django.db import models
from django.contib.auth.models import (
    BaseUserManager, AbstractBaseUser, PermissionsMixin
)
# Broken Forms 
# UserCreationForm
# UserChangeForm
# Create your models here.

# USER FIELDS
# email
# password
# first name
# last name
# token
# secret
class TwitterUserManager(BaseUserManager):

    def create_user(self, email, token, secret, password=None):
        if not email:
            raise ValueError('Users must have an email address.')
        if not token:
            raise ValueError('Users must have an oauth token.')
        if not secret:
            raise ValueError('Users must have an oauth secret.')
        if not password:
            raise ValueError('Users must have a password.')

        user = self.model(
            email=self.normalize_email(email),
            token=token,
            secret=secret,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, token, secret, password):
        user = self.create_user(
            email,
            token=token,
            secret=secret,
            password=password
        )
        user.is_admin = True
        user.save(using_self._db)
        return user

class TwitterUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(verbose_name='email address', max_length=255,unique=True)
    token = models.CharField(max_length=150)
    secret = models.CharField(max_length=150)
    password = models.CharField(max_length=80)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    objects = TwitterUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['token', 'secret']

    def get_full_name(self):
        return self.email

    def get_short_name(self):
        return self.email

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin