from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
# Create your models here.
# Change The Sentiment Model
# Create Generic Foriegn Key
class Sentiment(models.Model):
    value = models.CharField(max_length=10)
    score = models.CharField(max_length=20)
    content_type = models.ForeignKey(ContentType)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    created_at = models.DateTimeField(auto_now_add=True)