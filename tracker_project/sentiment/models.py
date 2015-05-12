from django.db import models

# Create your models here.
class Sentiment(models.Model):
    value = models.CharField(max_length=10)
    score = models.CharField(max_length=20)
    mixed = models.CharField(max_length=3)
    created_at = models.DateTimeField()