from django.db import models
from django.conf import settings
# from sentiment.models import Sentiment
# Create your models here.
# Change The Sentiment Model
class Tweet(models.Model):
    text = models.CharField(max_length=180)
    tweet_id = models.CharField(max_length=30)
    favorites = models.IntegerField()
    tweet_date = models.DateTimeField()    

class Keyword(models.Model):
    search =  models.CharField(max_length=40)
    tweet = models.ManyToManyField(Tweet)

class Profile(models.Model):
    token = models.CharField(max_length=180)
    secret = models.CharField(max_length=180)
    user = models.ForeignKey(settings.AUTH_USER_MODEL)