from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation

# Change The Sentiment Model

class Sentiment(models.Model):
    value = models.CharField(max_length=10)
    score = models.CharField(max_length=20)
    content_type = models.ForeignKey(ContentType)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    created_at = models.DateTimeField(auto_now_add=True)

class Tweet(models.Model):
    text = models.CharField(max_length=180)
    tweet_id = models.CharField(max_length=30)
    favorites = models.IntegerField()
    tweet_date = models.DateTimeField() 
    sentiment = GenericRelation(Sentiment)   

class Keyword(models.Model):
    search =  models.CharField(max_length=40)
    tweet = models.ManyToManyField(Tweet)

class Profile(models.Model):
    token = models.CharField(max_length=180)
    secret = models.CharField(max_length=180)
    user = models.ForeignKey(settings.AUTH_USER_MODEL)

# class Article(models.Model):
#     pass
    # yahoo id
    # yahoo link or web page link
    # slug line of title
    # models.ForeignKey(Sentiment)
    # models.ManyToManyField(Company)