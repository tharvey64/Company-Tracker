from django.db import models

# Create your models here.
class Sentiment(models.Model):
    value = models.CharField(max_length=10)
    score = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)